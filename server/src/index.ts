import express from "express";
import http from "http";
import path from "path";
import socketIO from "socket.io";
import cards from './cards.json';
import { SERVER_EVENTS, CLIENT_EVENTS, GAME_STATE, ROUND_STATE, TEAMS, IPlayer,IRound, IScores, EventData, ICard } from '../../client/src/shared/constants';

const app = express();
const server = new http.Server(app);
const io = socketIO(server);
const port = process.env.PORT || 5000;

app.set("port", port);
app.use(express.static(path.join(__dirname, '../../client/build')));

// app.use("/static", express.static(path.join(__dirname, "../build/static")));

app.get("/", function (request, response) {
  response.sendFile(path.join(__dirname, "../../client/build/index.html"));
});

server.listen(port, function () {
  console.log(`Starting server on port ${port}`);
});

interface Rooms {
  [roomName: string]: {
    cards: ICard[];
    players: IPlayer[];
    gameState: GAME_STATE,
    round: IRound,
    scores: IScores,
  }
}

const rooms: Rooms = {};

io.on("connection", function (socket) {
  socket.on(CLIENT_EVENTS.JOIN, function (data: EventData[CLIENT_EVENTS.JOIN]) {
    console.log(CLIENT_EVENTS.JOIN, data);
    const player = { id: socket.id, name: data.playerName };
    let room = rooms[data.roomName];
    if (room) {
      room.players.push({
        ...player,
        team: TEAMS[room.players.length % 2 as 0 | 1],
      });
    } else {
      const cardsCopy = cards.slice();
      shuffleCards(cardsCopy);
      room = {
        cards: cardsCopy,
        players: [{ ...player, team: TEAMS[0] }],
        gameState: GAME_STATE.WAITING,
        round: {
          number: 0,
          state: ROUND_STATE.WAITING,
          speaker: null as any,
          watcher: null as any,
        },
        scores: { [TEAMS[0]]: 0, [TEAMS[1]]: 0 },
      };
      rooms[data.roomName] = room;
    }
    socket.join(data.roomName);
    socket.emit(SERVER_EVENTS.GAME_STATE, {
      player,
      gameState: room.gameState,
      round: room.round,
      scores: room.scores,
    } as EventData[SERVER_EVENTS.GAME_STATE]);
    io.in(data.roomName).emit(SERVER_EVENTS.PLAYERS_IN_GAME, {
      players: room.players,
    } as EventData[SERVER_EVENTS.PLAYERS_IN_GAME]);
  });

  socket.on(CLIENT_EVENTS.START_GAME, function (data: EventData[CLIENT_EVENTS.START_GAME]) {
    const room = rooms[data.roomName];
    const roundSpeaker = room.players[room.round.number % room.players.length];
    const roundWatcher = room.players[(room.round.number + 1) % room.players.length];
    room.gameState = GAME_STATE.PLAYING;
    room.round.state = ROUND_STATE.WAITING;
    room.round.speaker = roundSpeaker;
    room.round.watcher = roundWatcher;
    console.log(room);
    console.log(roundSpeaker, roundWatcher);
    io.in(data.roomName).emit(SERVER_EVENTS.GAME_STARTED, {
      gameState: room.gameState,
      round: room.round,
    } as EventData[SERVER_EVENTS.GAME_STARTED]);
  });

  socket.on(CLIENT_EVENTS.START_ROUND, function(data :EventData[CLIENT_EVENTS.START_ROUND]) {
    const room = rooms[data.roomName];
    room.round.state = ROUND_STATE.PLAYING;
    const card = getRandomCard(room.cards);
    io.in(data.roomName).emit(SERVER_EVENTS.ROUND_STARTED, { round: room.round } as EventData[SERVER_EVENTS.ROUND_STARTED]);
    setTimeout(() => {
      room.round.number += 1;
      room.round.state = ROUND_STATE.WAITING;
      const roundSpeaker = room.players[room.round.number % room.players.length];
      const roundWatcher = room.players[(room.round.number + 1) % room.players.length];
      room.round.speaker = roundSpeaker;
      room.round.watcher = roundWatcher;
      io.in(data.roomName).emit(SERVER_EVENTS.ROUND_ENDED, { round: room.round } as EventData[SERVER_EVENTS.ROUND_ENDED])
    }, 60000)
    io.to(room.round.watcher.id).emit(SERVER_EVENTS.DEAL_CARD, { card } as EventData[SERVER_EVENTS.DEAL_CARD]);
    io.to(room.round.speaker.id).emit(SERVER_EVENTS.DEAL_CARD, { card } as EventData[SERVER_EVENTS.DEAL_CARD]);
  });

  socket.on(CLIENT_EVENTS.SCORE, function (data: EventData[CLIENT_EVENTS.SCORE]) {
    const room = rooms[data.roomName];
    const card = getRandomCard(room.cards);
    if (room.round.speaker.id === socket.id) {
      room.scores[room.round.speaker.team] += 1;
      io.to(room.round.watcher.id).emit(SERVER_EVENTS.DEAL_CARD, { card } as EventData[SERVER_EVENTS.DEAL_CARD]);
      io.to(room.round.speaker.id).emit(SERVER_EVENTS.DEAL_CARD, { card } as EventData[SERVER_EVENTS.DEAL_CARD]);
      io.in(data.roomName).emit(SERVER_EVENTS.UPDATE_SCORES, {
        scores: room.scores,
      } as EventData[SERVER_EVENTS.UPDATE_SCORES]);
    }
  });

  socket.on(CLIENT_EVENTS.SKIP, function (data: EventData[CLIENT_EVENTS.SKIP]) {
    const room = rooms[data.roomName];
    const card = getRandomCard(room.cards);
    if (room.round.speaker.id === socket.id) {
      io.to(room.round.watcher.id).emit(SERVER_EVENTS.DEAL_CARD, { card } as EventData[SERVER_EVENTS.DEAL_CARD]);
      io.to(room.round.speaker.id).emit(SERVER_EVENTS.DEAL_CARD, { card } as EventData[SERVER_EVENTS.DEAL_CARD]);
    }
  });

  socket.on(CLIENT_EVENTS.INVALIDATE, function (data: EventData[CLIENT_EVENTS.INVALIDATE]) {
    const room = rooms[data.roomName];
    const card = getRandomCard(room.cards);
    if (room.round.watcher.id === socket.id) {
      room.scores[room.round.watcher.team] += 1;
      io.to(room.round.watcher.id).emit(SERVER_EVENTS.DEAL_CARD, { card } as EventData[SERVER_EVENTS.DEAL_CARD]);
      io.to(room.round.speaker.id).emit(SERVER_EVENTS.DEAL_CARD, { card } as EventData[SERVER_EVENTS.DEAL_CARD]);
      io.in(data.roomName).emit(SERVER_EVENTS.UPDATE_SCORES, {
        scores: room.scores,
      } as EventData[SERVER_EVENTS.UPDATE_SCORES]);
    }
  });
});

const getRandomCard = (cards: ICard[]): ICard => {
  return cards.pop() as ICard;
}

function shuffleCards(cards: ICard[]): void {
  for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
  }
}