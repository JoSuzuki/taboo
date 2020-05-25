import React from 'react';
import { IRound, IPlayer, ROUND_STATE, ICard, CLIENT_EVENTS, EventData } from '../../shared/constants';
import socket from '../../services/socket/socket';
import Card from '../Card/Card';

interface RoundProps {
  roomName: string;
  round: IRound;
  player: IPlayer;
  card: ICard;
}

const Round: React.FC<RoundProps> = ({ roomName, round, player, card }) => {
  switch (round.state) {
    case ROUND_STATE.WAITING:
      return (
        <React.Fragment>
          {round.speaker?.id === player?.id ? (
            <button
              onClick={() =>
                socket.emit(CLIENT_EVENTS.START_ROUND, { roomName } as EventData[CLIENT_EVENTS.START_ROUND])
              }
            >
              começar rodada
            </button>
          ) : (
            <div>Esperando jogador: {round.speaker?.name} começar a rodada</div>
          )}
        </React.Fragment>
      );
    case ROUND_STATE.PLAYING:
      return (
        <React.Fragment>
          {(round.speaker?.id === player?.id ||
            round.watcher?.id === player?.id) && card && <Card card={card} />}
          {round.speaker?.id === player?.id && (
            <React.Fragment>
              <button
                onClick={() => socket.emit(CLIENT_EVENTS.SCORE, { roomName } as EventData[CLIENT_EVENTS.SCORE])}
              >
                Pontuar
              </button>
              <button
                onClick={() => socket.emit(CLIENT_EVENTS.SKIP, { roomName } as EventData[CLIENT_EVENTS.SKIP])}
              >
                Pular
              </button>
            </React.Fragment>
          )}
          {round.watcher?.id === player?.id && (
            <React.Fragment>
              <button
                onClick={() =>
                  socket.emit(CLIENT_EVENTS.INVALIDATE, { roomName } as EventData[CLIENT_EVENTS.INVALIDATE])
                }
              >
                Invalidar
              </button>
            </React.Fragment>
          )}
        </React.Fragment>
      );
  }
};

export default Round;