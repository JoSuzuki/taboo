var express = require("express");
var http = require("http");
var path = require("path");
var socketIO = require("socket.io");
var cards = require('./cards.json')

var app = express();
var server = http.Server(app);
var io = socketIO(server);

var CLIENT_EVENTS = {
  JOIN: "join",
  START_GAME: "startGame",
  SCORE: "score",
  SKIP: "skip",
  INVALIDATE: "invalidate",
  START_ROUND: 'startRound',
};

var SERVER_EVENTS = {
  PLAYERS_IN_GAME: "playersInGame",
  GAME_STARTED: "gameStarted",
  GAME_STATE: "gameState",
  DEAL_CARD: "dealCard",
  UPDATE_SCORES: "updateScores",
  ROUND_STARTED: 'roundStarted',
  ROUND_ENDED: 'roundEnded',
};

const GAME_STATE = {
  WAITING: "waiting",
  PLAYING: "playing",
};

const ROUND_STATE = {
  WAITING: "waiting",
  PLAYING: "playing",
};

const TEAMS = {
  0: "blue",
  1: "red",
};

app.set("port", 5000);
app.use("/client", express.static(path.join(__dirname, "../client")));

app.get("/", function (request, response) {
  response.sendFile(path.join(__dirname, "../client/index.html"));
});

server.listen(5000, function () {
  console.log("Starting server on port 5000");
});

var rooms = {};

io.on("connection", function (socket) {
  socket.on(CLIENT_EVENTS.JOIN, function (data) {
    console.log(CLIENT_EVENTS.JOIN, data);
    const player = { id: socket.id, name: data.playerName };
    let room = rooms[data.roomName];
    if (room) {
      room.players.push({
        ...player,
        team: TEAMS[room.players.length % 2],
      });
    } else {
      room = {
        players: [{ ...player, team: TEAMS[0] }],
        gameState: GAME_STATE.WAITING,
        round: {
          number: 0,
          state: ROUND_STATE.WAITING,
          speaker: {},
          watcher: {},
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
    });
    io.in(data.roomName).emit(SERVER_EVENTS.PLAYERS_IN_GAME, {
      players: room.players,
    });
  });

  socket.on(CLIENT_EVENTS.START_GAME, function (data) {
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
    });
  });

  socket.on(CLIENT_EVENTS.START_ROUND, function(data) {
    const room = rooms[data.roomName];
    room.round.state = ROUND_STATE.PLAYING;
    const card = getRandomCard();
    io.in(data.roomName).emit(SERVER_EVENTS.ROUND_STARTED, { round: room.round });
    setTimeout(() => {
      room.round.number += 1;
      room.round.state = ROUND_STATE.WAITING;
      const roundSpeaker = room.players[room.round.number % room.players.length];
      const roundWatcher = room.players[(room.round.number + 1) % room.players.length];
      room.round.speaker = roundSpeaker;
      room.round.watcher = roundWatcher;
      io.in(data.roomName).emit(SERVER_EVENTS.ROUND_ENDED, { round: room.round })
    }, 10000)
    io.to(room.round.watcher.id).emit(SERVER_EVENTS.DEAL_CARD, { card });
    io.to(room.round.speaker.id).emit(SERVER_EVENTS.DEAL_CARD, { card });
  });

  socket.on(CLIENT_EVENTS.SCORE, function (data) {
    const room = rooms[data.roomName];
    const card = getRandomCard();
    if (room.round.speaker.id === socket.id) {
      room.scores[room.round.speaker.team] += 1;
      io.to(room.round.watcher.id).emit(SERVER_EVENTS.DEAL_CARD, { card });
      io.to(room.round.speaker.id).emit(SERVER_EVENTS.DEAL_CARD, { card });
      io.in(data.roomName).emit(SERVER_EVENTS.UPDATE_SCORES, {
        scores: room.scores,
      });
    }
  });

  socket.on(CLIENT_EVENTS.SKIP, function (data) {
    const room = rooms[data.roomName];
    const card = getRandomCard();
    if (room.round.speaker.id === socket.id) {
      io.to(room.round.watcher.id).emit(SERVER_EVENTS.DEAL_CARD, { card });
      io.to(room.round.speaker.id).emit(SERVER_EVENTS.DEAL_CARD, { card });
    }
  });

  socket.on(CLIENT_EVENTS.INVALIDATE, function (data) {
    const room = rooms[data.roomName];
    const card = getRandomCard();
    if (room.round.watcher.id === socket.id) {
      room.scores[room.round.watcher.team] += 1;
      io.to(room.round.watcher.id).emit(SERVER_EVENTS.DEAL_CARD, { card });
      io.to(room.round.speaker.id).emit(SERVER_EVENTS.DEAL_CARD, { card });
      io.in(data.roomName).emit(SERVER_EVENTS.UPDATE_SCORES, {
        scores: room.scores,
      });
    }
  });
});

const getRandomCard = () => {
  const card = cards.cards[Math.floor(Math.random() * cards.cards.length)];
  return card;
}