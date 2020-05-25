export enum CLIENT_EVENTS {
  JOIN = "join",
  START_GAME = "startGame",
  SCORE = "score",
  SKIP = "skip",
  INVALIDATE = "invalidate",
  START_ROUND = 'startRound',
};

export enum SERVER_EVENTS {
  PLAYERS_IN_GAME = "playersInGame",
  GAME_STARTED = "gameStarted",
  GAME_STATE = "gameState",
  DEAL_CARD = "dealCard",
  UPDATE_SCORES = "updateScores",
  ROUND_STARTED = 'roundStarted',
  ROUND_ENDED = 'roundEnded',
};

export interface EventData {
  [SERVER_EVENTS.PLAYERS_IN_GAME]: { players: IPlayer[] };
  [SERVER_EVENTS.GAME_STARTED]: { gameState:GAME_STATE, round: IRound },
  [SERVER_EVENTS.GAME_STATE]: { player: IPlayer, gameState: GAME_STATE, round: IRound, scores: IScores },
  [SERVER_EVENTS.DEAL_CARD]: { card: ICard },
  [SERVER_EVENTS.UPDATE_SCORES]: { scores: IScores },
  [SERVER_EVENTS.ROUND_STARTED]: { round: IRound },
  [SERVER_EVENTS.ROUND_ENDED]: { round: IRound },
  [CLIENT_EVENTS.JOIN]: { roomName: string, playerName: string },
  [CLIENT_EVENTS.START_GAME]: { roomName: string, playerId: playerId },
  [CLIENT_EVENTS.SCORE]: { roomName: string },
  [CLIENT_EVENTS.SKIP]: { roomName: string },
  [CLIENT_EVENTS.INVALIDATE]: { roomName: string },
  [CLIENT_EVENTS.START_ROUND]: { roomName: string },
};

export enum GAME_STATE {
  WAITING = "waiting",
  PLAYING = "playing",
};

export enum ROUND_STATE {
  WAITING = "waiting",
  PLAYING = "playing",
};

export const TEAMS = {
  0: "blue" as 'blue',
  1: "red" as 'red',
};

type playerId = string;
type cardId = number;

export interface IPlayer {
  id: playerId;
  name: string;
  team: 'blue' | 'red';
};

export interface IRound {
  number: number,
  state: ROUND_STATE,
  speaker: IPlayer,
  watcher: IPlayer,
}

export interface IScores {
  blue: number;
  red: number;
}

export interface ICard {
  id: cardId;
  word: string;
  tabu: string[]
}