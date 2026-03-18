// ============================================
// Grid Battle 1v1 – Custom Server (Socket.IO + Next.js)
// ============================================

import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server as SocketIOServer } from "socket.io";
import { nanoid } from "nanoid";
import {
  Room,
  Match,
  RoomConfig,
  ServerToClientEvents,
  ClientToServerEvents,
  PlayerRole,
  Position,
  Direction,
} from "./src/lib/types";
import { generateGrid, isValidPlacement, applyMove, getValidMoves } from "./src/lib/gameLogic";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// ============================================
// In-Memory Room Store
// ============================================
const rooms = new Map<string, Room>();

// Map socket ID → { roomId, matchId?, isHost }
const socketToRoom = new Map<string, { roomId: string; matchId?: string; isHost: boolean }>();

function generateRoomId(): string {
  return nanoid(6).toUpperCase();
}

function generateMatchId(): string {
  return nanoid(8);
}

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: { origin: "*" },
    transports: ["websocket", "polling"],
  });

  // ============================================
  // Socket Event Handlers
  // ============================================

  io.on("connection", (socket) => {
    console.log(`[Socket] Connected: ${socket.id}`);

    // ----------------------------------------
    // CREATE ROOM (Host)
    // ----------------------------------------
    socket.on("create-room", ({ config }) => {
      const roomId = generateRoomId();
      const room: Room = {
        roomId,
        hostSocketId: socket.id,
        config,
        matches: [],
        waitingQueue: [],
        status: "waiting",
      };

      rooms.set(roomId, room);
      socketToRoom.set(socket.id, { roomId, isHost: true });
      socket.join(roomId);
      socket.join(`${roomId}-host`);

      console.log(`[Room] Created: ${roomId} by ${socket.id}`);
      socket.emit("room-created", { roomId });
    });

    // ----------------------------------------
    // HOST JOIN (Monitor)
    // ----------------------------------------
    socket.on("host-join", ({ roomId }) => {
      const room = rooms.get(roomId);
      if (!room) {
        socket.emit("error", { message: "Room not found" });
        return;
      }

      room.hostSocketId = socket.id;
      socketToRoom.set(socket.id, { roomId, isHost: true });
      socket.join(roomId);
      socket.join(`${roomId}-host`);

      socket.emit("host-update", { room });
    });

    // ----------------------------------------
    // JOIN ROOM (Player)
    // ----------------------------------------
    socket.on("join-room", ({ roomId }) => {
      const room = rooms.get(roomId);
      if (!room) {
        socket.emit("error", { message: "Room not found" });
        return;
      }

      if (room.status === "closed") {
        socket.emit("error", { message: "Room is closed" });
        return;
      }

      // Check if player is already in the room
      const existing = socketToRoom.get(socket.id);
      if (existing && existing.roomId === roomId && existing.matchId) {
        // Reconnect to existing match
        const match = room.matches.find((m) => m.matchId === existing.matchId);
        if (match) {
          const role = match.players.Alice === socket.id ? "Alice" : "Bob";
          socket.emit("match-started", { matchId: match.matchId, match, role });
          return;
        }
      }

      socket.join(roomId);
      room.waitingQueue.push(socket.id);
      socketToRoom.set(socket.id, { roomId, isHost: false });

      room.status = "active";

      // Emit waiting state
      socket.emit("waiting-for-opponent");

      // Notify host about player count
      io.to(`${roomId}-host`).emit("player-count", {
        count: room.waitingQueue.length + room.matches.length * 2,
      });

      // Try to pair players
      if (room.waitingQueue.length >= 2) {
        const player1Id = room.waitingQueue.shift()!;
        const player2Id = room.waitingQueue.shift()!;

        // Randomly assign Alice/Bob
        const isPlayer1Alice = Math.random() < 0.5;
        const aliceId = isPlayer1Alice ? player1Id : player2Id;
        const bobId = isPlayer1Alice ? player2Id : player1Id;

        // Pick a random s from sList
        const s = room.config.sList[Math.floor(Math.random() * room.config.sList.length)];

        // Generate grid
        const grid = generateGrid(room.config.N, room.config.M, room.config.p, room.config.q, s);
        const removed = Array.from({ length: room.config.N }, () =>
          Array.from({ length: room.config.M }, () => false)
        );

        const matchId = generateMatchId();
        const match: Match = {
          matchId,
          players: { Alice: aliceId, Bob: bobId },
          currentPlayer: "Alice",
          grid,
          removed,
          pos: null,
          s,
          status: "placing", // Alice needs to place the pawn first
          winner: null,
          moveCount: 0,
        };

        room.matches.push(match);

        // Update socket-to-room mapping
        socketToRoom.set(aliceId, { roomId, matchId, isHost: false });
        socketToRoom.set(bobId, { roomId, matchId, isHost: false });

        // Notify both players
        const aliceSocket = io.sockets.sockets.get(aliceId);
        const bobSocket = io.sockets.sockets.get(bobId);

        if (aliceSocket) {
          aliceSocket.emit("match-started", { matchId, match, role: "Alice" });
        }
        if (bobSocket) {
          bobSocket.emit("match-started", { matchId, match, role: "Bob" });
        }

        // Notify host
        io.to(`${roomId}-host`).emit("host-update", { room });
        console.log(`[Match] ${matchId} started: Alice=${aliceId}, Bob=${bobId}, s=${s}`);
      }
    });

    // ----------------------------------------
    // PLACE PAWN (Alice's first move)
    // ----------------------------------------
    socket.on("place-pawn", ({ matchId, pos }) => {
      const info = socketToRoom.get(socket.id);
      if (!info) return;
      const room = rooms.get(info.roomId);
      if (!room) return;

      const match = room.matches.find((m) => m.matchId === matchId);
      if (!match) {
        socket.emit("error", { message: "Match not found" });
        return;
      }

      if (match.status !== "placing") {
        socket.emit("error", { message: "Not in placement phase" });
        return;
      }

      // Only Alice can place
      if (match.players.Alice !== socket.id) {
        socket.emit("error", { message: "Only Alice can place the pawn" });
        return;
      }

      if (!isValidPlacement(match.grid, pos)) {
        socket.emit("error", { message: "Invalid placement" });
        return;
      }

      match.pos = pos;
      match.status = "playing";
      match.currentPlayer = "Bob"; // After placing, Bob moves next

      // Check if Bob has any valid moves
      const validMoves = getValidMoves(match.grid, match.removed, pos);
      if (validMoves.length === 0) {
        match.status = "finished";
        match.winner = "Alice"; // Bob can't move, Alice wins
      }

      // Notify both players
      const aliceSocket = io.sockets.sockets.get(match.players.Alice);
      const bobSocket = io.sockets.sockets.get(match.players.Bob);

      if (match.status === "finished") {
        aliceSocket?.emit("game-over", { winner: match.winner!, match });
        bobSocket?.emit("game-over", { winner: match.winner!, match });
      } else {
        aliceSocket?.emit("match-updated", { match });
        bobSocket?.emit("match-updated", { match });
      }

      io.to(`${info.roomId}-host`).emit("host-update", { room });
    });

    // ----------------------------------------
    // MOVE (During gameplay)
    // ----------------------------------------
    socket.on("move", ({ matchId, direction }) => {
      const info = socketToRoom.get(socket.id);
      if (!info) return;
      const room = rooms.get(info.roomId);
      if (!room) return;

      const matchIndex = room.matches.findIndex((m) => m.matchId === matchId);
      if (matchIndex === -1) {
        socket.emit("error", { message: "Match not found" });
        return;
      }

      const match = room.matches[matchIndex];

      if (match.status !== "playing") {
        socket.emit("error", { message: "Game is not in playing state" });
        return;
      }

      // Check it's this player's turn
      const currentPlayerId = match.players[match.currentPlayer];
      if (currentPlayerId !== socket.id) {
        socket.emit("error", { message: "Not your turn" });
        return;
      }

      try {
        const newMatch = applyMove(match, direction);
        room.matches[matchIndex] = newMatch;

        const aliceSocket = io.sockets.sockets.get(newMatch.players.Alice);
        const bobSocket = io.sockets.sockets.get(newMatch.players.Bob);

        if (newMatch.status === "finished") {
          aliceSocket?.emit("game-over", { winner: newMatch.winner!, match: newMatch });
          bobSocket?.emit("game-over", { winner: newMatch.winner!, match: newMatch });
        } else {
          aliceSocket?.emit("match-updated", { match: newMatch });
          bobSocket?.emit("match-updated", { match: newMatch });
        }

        io.to(`${info.roomId}-host`).emit("host-update", { room });
      } catch (err) {
        socket.emit("error", { message: (err as Error).message });
      }
    });

    // ----------------------------------------
    // CLOSE ROOM (Host)
    // ----------------------------------------
    socket.on("close-room", ({ roomId }) => {
      const room = rooms.get(roomId);
      if (!room) return;

      if (room.hostSocketId !== socket.id) {
        socket.emit("error", { message: "Only the host can close the room" });
        return;
      }

      room.status = "closed";
      io.to(roomId).emit("room-closed");

      // Clean up
      for (const match of room.matches) {
        socketToRoom.delete(match.players.Alice);
        socketToRoom.delete(match.players.Bob);
      }
      for (const sid of room.waitingQueue) {
        socketToRoom.delete(sid);
      }
      socketToRoom.delete(socket.id);
      rooms.delete(roomId);

      console.log(`[Room] Closed: ${roomId}`);
    });

    // ----------------------------------------
    // DISCONNECT
    // ----------------------------------------
    socket.on("disconnect", () => {
      console.log(`[Socket] Disconnected: ${socket.id}`);
      const info = socketToRoom.get(socket.id);
      if (!info) return;

      const room = rooms.get(info.roomId);
      if (!room) return;

      if (info.isHost) {
        // Host disconnected - keep room alive but update hostSocketId
        return;
      }

      // Remove from waiting queue
      room.waitingQueue = room.waitingQueue.filter((id) => id !== socket.id);

      // Check if in an active match
      if (info.matchId) {
        const match = room.matches.find((m) => m.matchId === info.matchId);
        if (match && match.status !== "finished") {
          // Player disconnected during game → other player wins
          const winner: PlayerRole =
            match.players.Alice === socket.id ? "Bob" : "Alice";
          match.status = "finished";
          match.winner = winner;

          const winnerId = match.players[winner];
          const winnerSocket = io.sockets.sockets.get(winnerId);
          winnerSocket?.emit("game-over", { winner, match });

          io.to(`${info.roomId}-host`).emit("host-update", { room });
        }
      }

      socketToRoom.delete(socket.id);
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Grid Battle 1v1 ready on http://${hostname}:${port}`);
  });
});
