import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import QRCode from 'qrcode';
import { roomManager } from './roomManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../dist')));

// Health check endpoint for Docker / orchestration
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime(), roomsCount: roomManager.rooms.size });
});

// REST API for room QR Code generation
app.get('/api/qr/:code', async (req, res) => {
  try {
    const code = req.params.code;
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.get('host');
    const roomUrl = `${protocol}://${host}/?room=${code}`;
    const qrDataUrl = await QRCode.toDataURL(roomUrl, {
      margin: 1,
      color: {
        dark: '#4f46e5',
        light: '#ffffff'
      }
    });
    res.json({ qrDataUrl, roomUrl });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

// Catch-all route to serve SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Socket.io Real-time Event Handlers
io.on('connection', (socket) => {
  console.log(`[Socket Connected] ID: ${socket.id}`);

  // Create a new room with Host Security Token
  socket.on('create_room', ({ name, avatar }) => {
    const { room, hostToken } = roomManager.createRoom(socket.id, name, avatar);
    socket.join(room.code);
    socket.emit('room_joined', {
      room: roomManager.serializeRoom(room),
      playerId: socket.id,
      hostToken
    });
    console.log(`[Room Created] Code: ${room.code} HostToken: ${hostToken} by ${name}`);
  });

  // Join or Re-authenticate as Host
  socket.on('join_room', ({ code, name, avatar, hostToken }) => {
    const cleanCode = code ? code.toUpperCase() : '';
    const result = roomManager.joinRoom(cleanCode, socket.id, name, avatar, hostToken);

    if (result.error) {
      socket.emit('error_message', { message: result.error });
      return;
    }

    socket.join(cleanCode);
    socket.emit('room_joined', {
      room: roomManager.serializeRoom(result.room),
      playerId: socket.id,
      hostToken: result.hostToken || null
    });
    io.to(cleanCode).emit('room_updated', { room: roomManager.serializeRoom(result.room) });
    console.log(`[Player Joined] ${name} joined room ${cleanCode} (Host: ${!!result.hostToken})`);
  });

  // Dedicated Host Reconnect Event
  socket.on('reconnect_host', ({ code, hostToken }) => {
    const cleanCode = code ? code.toUpperCase() : '';
    const result = roomManager.reconnectHost(cleanCode, socket.id, hostToken);

    if (result.error) {
      socket.emit('error_message', { message: result.error });
      return;
    }

    socket.join(cleanCode);
    socket.emit('room_joined', {
      room: roomManager.serializeRoom(result.room),
      playerId: socket.id,
      hostToken: result.hostToken
    });
    io.to(cleanCode).emit('room_updated', { room: roomManager.serializeRoom(result.room) });
    io.to(cleanCode).emit('host_reconnected', { hostName: result.player.name });
    console.log(`[Host Reconnected] Host re-authenticated for room ${cleanCode}`);
  });

  // Start a game in room
  socket.on('start_game', ({ code, gameType, options }) => {
    const room = roomManager.getRoom(code);
    if (!room || room.hostId !== socket.id) return;

    const updatedRoom = roomManager.startGame(code, gameType, options);
    if (updatedRoom) {
      io.to(code).emit('game_started', { room: roomManager.serializeRoom(updatedRoom) });
    }
  });

  // Handle in-game actions
  socket.on('game_action', ({ code, action, payload }) => {
    const result = roomManager.handleGameAction(code, socket.id, action, payload);
    const room = roomManager.getRoom(code);

    if (room) {
      io.to(code).emit('game_state_updated', {
        room: roomManager.serializeRoom(room),
        actionResult: result
      });
    }
  });

  // Canvas drawing streaming for Pictionary
  socket.on('draw_event', ({ code, drawData }) => {
    socket.to(code).emit('draw_event_broadcast', drawData);
  });

  // Chat message relay
  socket.on('send_chat', ({ code, message }) => {
    const room = roomManager.getRoom(code);
    if (!room) return;

    const player = room.players.get(socket.id);
    if (!player) return;

    const chatItem = {
      id: Date.now(),
      sender: player.name,
      color: player.color,
      avatar: player.avatar,
      text: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    room.chatMessages.push(chatItem);
    io.to(code).emit('chat_received', chatItem);
  });

  // Disconnect handler
  socket.on('disconnect', () => {
    console.log(`[Socket Disconnected] ID: ${socket.id}`);
    const result = roomManager.removePlayer(socket.id);
    if (result && result.room) {
      io.to(result.room.code).emit('room_updated', { room: roomManager.serializeRoom(result.room) });
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`🚀 Party Funtime Server running at http://localhost:${PORT}`);
});
