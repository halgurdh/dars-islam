#!/usr/bin/env node
import { createHash, randomUUID } from 'crypto';
import http from 'http';

const PORT = parseInt(process.env.MULTIPLAYER_PORT || '8787', 10);
const HOST = process.env.MULTIPLAYER_HOST || '0.0.0.0';
const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

const clients = new Map();
const rooms = new Map();

function log(msg) {
  console.log(`[multiplayer] ${msg}`);
}

function roomKey(game, code) {
  return `${game}:${code}`;
}

function makeRoomCode() {
  return Array.from({ length: 6 }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join('');
}

function createUniqueRoomCode(game) {
  for (let i = 0; i < 2000; i++) {
    const code = makeRoomCode();
    if (!rooms.has(roomKey(game, code))) return code;
  }
  throw new Error('Could not allocate a unique room code.');
}

function normalizeRoomCode(value) {
  return String(value || '').toUpperCase().trim();
}

function sendFrame(socket, data, opcode = 0x1) {
  const payload = Buffer.isBuffer(data) ? data : Buffer.from(String(data), 'utf8');
  let header;
  if (payload.length < 126) {
    header = Buffer.from([0x80 | opcode, payload.length]);
  } else if (payload.length < 65536) {
    header = Buffer.alloc(4);
    header[0] = 0x80 | opcode;
    header[1] = 126;
    header.writeUInt16BE(payload.length, 2);
  } else {
    header = Buffer.alloc(10);
    header[0] = 0x80 | opcode;
    header[1] = 127;
    header.writeBigUInt64BE(BigInt(payload.length), 2);
  }
  socket.write(Buffer.concat([header, payload]));
}

function sendJson(client, message) {
  if (client.socket.destroyed) return;
  sendFrame(client.socket, JSON.stringify(message));
}

function sendError(client, code, message) {
  sendJson(client, { type: 'error', code, message });
}

function memberView(room, clientId) {
  const client = room.members.get(clientId);
  return {
    peerId: client.id,
    name: client.name,
    isHost: room.hostId === client.id,
    cls: client.profile.cls,
  };
}

function rosterFor(room) {
  return [...room.members.keys()].map((clientId) => memberView(room, clientId));
}

function broadcastRoster(room) {
  const members = rosterFor(room);
  for (const client of room.members.values()) {
    sendJson(client, { type: 'roster', members });
  }
}

function closeRoom(room, reason) {
  for (const client of room.members.values()) {
    if (client.id !== room.hostId) {
      sendJson(client, { type: 'room_closed', reason });
    }
    client.room = null;
    client.profile = {};
  }
  rooms.delete(roomKey(room.game, room.code));
}

function leaveRoom(client, reason = 'The room closed.') {
  const room = client.room;
  if (!room) return;

  room.members.delete(client.id);
  client.room = null;
  client.profile = {};

  if (room.hostId === client.id) {
    closeRoom(room, reason);
    return;
  }

  if (room.members.size === 0) {
    rooms.delete(roomKey(room.game, room.code));
    return;
  }

  broadcastRoster(room);
}

function joinRoom(client, room, name) {
  client.room = room;
  client.name = String(name || 'Player').trim() || 'Player';
  client.profile = {};
  room.members.set(client.id, client);
}

function relayRoomEvent(client, target, event) {
  const room = client.room;
  if (!room) {
    sendError(client, 'not-in-room', 'Join a room before sending events.');
    return;
  }

  for (const member of room.members.values()) {
    if (member.id === client.id) continue;
    if (target === 'host' && member.id !== room.hostId) continue;
    if (target === 'guests' && member.id === room.hostId) continue;
    sendJson(member, {
      type: 'room_event',
      from: client.id,
      event,
    });
  }
}

function handleClientMessage(client, message) {
  switch (message.type) {
    case 'create_room': {
      leaveRoom(client, 'The host left the room.');
      const game = String(message.game || '').trim();
      if (!game) {
        sendError(client, 'invalid-game', 'Missing game identifier.');
        return;
      }
      const code = createUniqueRoomCode(game);
      const room = {
        game,
        code,
        hostId: client.id,
        members: new Map(),
      };
      rooms.set(roomKey(game, code), room);
      joinRoom(client, room, message.name);
      sendJson(client, { type: 'room_created', roomCode: code, members: rosterFor(room) });
      break;
    }

    case 'join_room': {
      leaveRoom(client, 'The player left the room.');
      const game = String(message.game || '').trim();
      const code = normalizeRoomCode(message.roomCode);
      if (!/^[A-Z2-9]{6}$/.test(code)) {
        sendError(client, 'invalid-room-code', 'Enter a valid 6-character room code.');
        return;
      }
      const room = rooms.get(roomKey(game, code));
      if (!room) {
        sendError(client, 'room-not-found', `Room ${code} was not found.`);
        return;
      }
      joinRoom(client, room, message.name);
      const members = rosterFor(room);
      sendJson(client, { type: 'room_joined', roomCode: code, members });
      broadcastRoster(room);
      break;
    }

    case 'leave_room':
      leaveRoom(client, 'The player left the room.');
      break;

    case 'member_update':
      if (!client.room) {
        sendError(client, 'not-in-room', 'Join a room before updating member state.');
        return;
      }
      client.name = typeof message.patch?.name === 'string' && message.patch.name.trim()
        ? message.patch.name.trim()
        : client.name;
      if (message.patch && 'cls' in message.patch) {
        client.profile.cls = message.patch.cls;
      }
      broadcastRoster(client.room);
      break;

    case 'room_event':
      relayRoomEvent(client, message.target || 'all', message.event);
      break;

    default:
      sendError(client, 'bad-message', 'Unsupported multiplayer message.');
  }
}

function decodeFrames(client, chunk) {
  client.buffer = Buffer.concat([client.buffer, chunk]);
  while (client.buffer.length >= 2) {
    const first = client.buffer[0];
    const second = client.buffer[1];
    const opcode = first & 0x0f;
    const masked = (second & 0x80) !== 0;
    let payloadLength = second & 0x7f;
    let offset = 2;

    if (payloadLength === 126) {
      if (client.buffer.length < offset + 2) return;
      payloadLength = client.buffer.readUInt16BE(offset);
      offset += 2;
    } else if (payloadLength === 127) {
      if (client.buffer.length < offset + 8) return;
      payloadLength = Number(client.buffer.readBigUInt64BE(offset));
      offset += 8;
    }

    const maskLength = masked ? 4 : 0;
    if (client.buffer.length < offset + maskLength + payloadLength) return;

    const mask = masked ? client.buffer.subarray(offset, offset + 4) : null;
    offset += maskLength;
    const payload = client.buffer.subarray(offset, offset + payloadLength);
    client.buffer = client.buffer.subarray(offset + payloadLength);

    if (masked && mask) {
      for (let i = 0; i < payload.length; i++) {
        payload[i] ^= mask[i % 4];
      }
    }

    if (opcode === 0x8) {
      client.socket.end();
      leaveRoom(client, 'The player disconnected.');
      return;
    }

    if (opcode === 0x9) {
      sendFrame(client.socket, payload, 0xA);
      continue;
    }

    if (opcode !== 0x1) continue;

    try {
      handleClientMessage(client, JSON.parse(payload.toString('utf8')));
    } catch {
      sendError(client, 'bad-json', 'Invalid multiplayer payload.');
    }
  }
}

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ ok: true, rooms: rooms.size, clients: clients.size }));
    return;
  }

  res.writeHead(404, { 'content-type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.on('upgrade', (req, socket) => {
  const key = req.headers['sec-websocket-key'];
  if (!key) {
    socket.destroy();
    return;
  }

  const accept = createHash('sha1')
    .update(`${key}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`)
    .digest('base64');

  socket.write([
    'HTTP/1.1 101 Switching Protocols',
    'Upgrade: websocket',
    'Connection: Upgrade',
    `Sec-WebSocket-Accept: ${accept}`,
    '\r\n',
  ].join('\r\n'));

  const client = {
    id: randomUUID(),
    socket,
    room: null,
    name: 'Player',
    profile: {},
    buffer: Buffer.alloc(0),
  };
  clients.set(client.id, client);
  sendJson(client, { type: 'welcome', clientId: client.id });

  socket.on('data', (chunk) => decodeFrames(client, chunk));
  socket.on('close', () => {
    leaveRoom(client, 'The player disconnected.');
    clients.delete(client.id);
  });
  socket.on('error', () => {
    leaveRoom(client, 'The player disconnected.');
    clients.delete(client.id);
  });
});

server.listen(PORT, HOST, () => {
  log(`Listening on ws://${HOST}:${PORT}`);
});
