import React from 'react';
import { GAME_STATE, IRound, IPlayer, ICard, CLIENT_EVENTS, EventData } from '../../shared/constants';
import socket from '../../services/socket/socket';
import Round from '../Round/Round';

interface GameProps {
  roomName: string;
  gameState: GAME_STATE;
  round: IRound;
  player: IPlayer;
  card: ICard;
}

const Game: React.FC<GameProps> = ({ roomName, gameState, round, player, card }) => {
  console.log(gameState, round, player);
  switch (gameState) {
    case GAME_STATE.WAITING:
      return (
        <React.Fragment>
          <div>Espere todo mundo entrar para começar o jogo!</div>
          <button
            onClick={() => {
              socket.emit(CLIENT_EVENTS.START_GAME, {
                roomName,
                playerId: player.id,
              } as EventData[CLIENT_EVENTS.START_GAME]);
            }}
          >
            Começar
          </button>
        </React.Fragment>
      );
    case GAME_STATE.PLAYING:
      return (
        <React.Fragment>
          <div>Rodada de:{round.speaker?.name}</div>
          <div>Vigia:{round.watcher?.name}</div>
          <Round
            roomName={roomName}
            round={round}
            player={player}
            card={card}
          />
        </React.Fragment>
      );
  }
};

export default Game;