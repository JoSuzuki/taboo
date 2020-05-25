import React from 'react';
import { IPlayer, IRound, ROUND_STATE, GAME_STATE, IScores, TEAMS, ICard, SERVER_EVENTS, EventData, CLIENT_EVENTS } from '../../shared/constants';
import socket from '../../services/socket/socket';
import Game from '../Game/Game';
import Button from '../Button/Button';
import Layout from '../Layout/Layout';
import Input from '../Input/Input';

const LOBBY_STATE = {
  LOGIN: "login",
  GAME: "game",
};

const Lobby: React.FC = () => {
  const [roomName, setRoomName] = React.useState("");
  const [playerName, setPlayerName] = React.useState("");
  const [player, setPlayer] = React.useState<IPlayer | null>(null);
  const [lobbyState, setLobbyState] = React.useState(LOBBY_STATE.LOGIN);
  const [players, setPlayers] = React.useState<IPlayer[]>([]);
  const [gameState, setGameState] = React.useState(GAME_STATE.WAITING);
  const [round, setRound] = React.useState<IRound>({
    number: 0,
    state: ROUND_STATE.WAITING,
    speaker: null as any,
    watcher: null as any,
  });
  const [scores, setScores] = React.useState<IScores>({
    [TEAMS[0]]: 0,
    [TEAMS[1]]: 0,
  });
  const [card, setCard] = React.useState<ICard | null>(null);

  socket.on(
    SERVER_EVENTS.GAME_STARTED,
    (data: EventData[SERVER_EVENTS.GAME_STARTED]) => {
      setGameState(data.gameState);
      setRound(data.round);
    }
  );

  socket.on(
    SERVER_EVENTS.GAME_STATE,
    (data: EventData[SERVER_EVENTS.GAME_STATE]) => {
      setPlayer(data.player);
      setGameState(data.gameState);
      setRound(data.round);
      setScores(data.scores);
    }
  );

  socket.on(
    SERVER_EVENTS.PLAYERS_IN_GAME,
    (data: EventData[SERVER_EVENTS.PLAYERS_IN_GAME]) => {
      setPlayers(data.players);
    }
  );

  socket.on(
    SERVER_EVENTS.DEAL_CARD,
    (data: EventData[SERVER_EVENTS.DEAL_CARD]) => {
      setCard(data.card);
    }
  );

  socket.on(
    SERVER_EVENTS.UPDATE_SCORES,
    (data: EventData[SERVER_EVENTS.UPDATE_SCORES]) => {
      setScores(data.scores);
    }
  );

  socket.on(
    SERVER_EVENTS.ROUND_STARTED,
    (data: EventData[SERVER_EVENTS.ROUND_STARTED]) => {
      setRound(data.round);
    }
  );

  socket.on(
    SERVER_EVENTS.ROUND_ENDED,
    (data: EventData[SERVER_EVENTS.ROUND_ENDED]) => {
      setRound(data.round);
    }
  );

  switch (lobbyState) {
    case LOBBY_STATE.LOGIN:
      return (
        <React.Fragment>
          <div>
            <label>Nome da sala:</label>
            <Input
              id="roomName"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            ></Input>
          </div>
          <div>
            <label>Nome do jogador:</label>
            <Input
              id="playerName"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
            ></Input>
          </div>
          <Layout mt="16px" mb="16px">
          <Button
            onClick={() => {
              socket.emit(CLIENT_EVENTS.JOIN, {
                roomName,
                playerName,
              } as EventData[CLIENT_EVENTS]);
              setLobbyState(LOBBY_STATE.GAME);
            }}
          >
            Entrar
          </Button>
          </Layout>
        </React.Fragment>
      );
    case LOBBY_STATE.GAME:
      return (
        <React.Fragment>
          <div>Sala: {roomName}</div>
          <div>Seu nome: {playerName}</div>
          <div>Time 1 (Score: {scores[TEAMS[0]]}):</div>
          <div>
            {players
              .filter((player) => player.team === TEAMS[0])
              .map((player) => (
                <div key={player.id}>{player.name}</div>
              ))}
          </div>
          <div>Time 2 (Score: {scores[TEAMS[1]]}):</div>
          {players
            .filter((player) => player.team === TEAMS[1])
            .map((player) => (
              <div key={player.id}>{player.name}</div>
            ))}
          <div>Round: {round.number}</div>
          <Game
            roomName={roomName}
            gameState={gameState}
            player={player as IPlayer}
            round={round}
            card={card as ICard}
          />
        </React.Fragment>
      );
    default:
      return null;
  }
};

export default Lobby;