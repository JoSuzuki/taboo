var socket = io();

const CLIENT_EVENTS = {
  JOIN: "join",
  START_GAME: "startGame",
  SCORE: "score",
  SKIP: "skip",
  INVALIDATE: "invalidate",
  START_ROUND: "startRound",
};

var SERVER_EVENTS = {
  PLAYERS_IN_GAME: "playersInGame",
  GAME_STARTED: "gameStarted",
  GAME_STATE: "gameState",
  DEAL_CARD: "dealCard",
  UPDATE_SCORES: "updateScores",
  ROUND_STARTED: "roundStarted",
  ROUND_ENDED: "roundEnded",
};

const LOBBY_STATE = {
  LOGIN: "login",
  GAME: "game",
};

const ROUND_STATE = {
  WAITING: "waiting",
  PLAYING: "playing",
};

const GAME_STATE = {
  WAITING: "waiting",
  PLAYING: "playing",
};

const TEAMS = {
  0: "blue",
  1: "red",
};

const App = () => {
  const [roomName, setRoomName] = React.useState("");
  const [playerName, setPlayerName] = React.useState("");
  const [player, setPlayer] = React.useState({});
  const [lobbyState, setLobbyState] = React.useState(LOBBY_STATE.LOGIN);
  const [players, setPlayers] = React.useState([]);
  const [gameState, setGameState] = React.useState(GAME_STATE.WAITING);
  const [round, setRound] = React.useState({
    number: 0,
    state: ROUND_STATE.WAITING,
    speaker: {},
    watcher: {},
  });
  const [scores, setScores] = React.useState({ [TEAMS[0]]: 0, [TEAMS[1]]: 0 });
  const [card, setCard] = React.useState(null);

  socket.on(SERVER_EVENTS.GAME_STARTED, (data) => {
    setGameState(data.gameState);
    setRound(data.round);
  });

  socket.on(SERVER_EVENTS.GAME_STATE, (data) => {
    setPlayer(data.player);
    setGameState(data.gameState);
    setRound(data.round);
    setScores(data.scores);
  });

  socket.on(SERVER_EVENTS.PLAYERS_IN_GAME, (data) => {
    setPlayers(data.players);
  });

  socket.on(SERVER_EVENTS.DEAL_CARD, (data) => {
    setCard(data.card);
  });

  socket.on(SERVER_EVENTS.UPDATE_SCORES, (data) => {
    setScores(data.scores);
  });

  socket.on(SERVER_EVENTS.ROUND_STARTED, (data) => {
    setRound(data.round);
  });

  socket.on(SERVER_EVENTS.ROUND_ENDED, (data) => {
    setRound(data.round);
  });

  switch (lobbyState) {
    case LOBBY_STATE.LOGIN:
      return (
        <React.Fragment>
          <div>
            <label>Nome da sala:</label>
            <input
              id="roomName"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            ></input>
          </div>
          <div>
            <label>Nome do jogador:</label>
            <input
              id="playerName"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
            ></input>
          </div>
          <button
            onClick={() => {
              socket.emit(CLIENT_EVENTS.JOIN, { roomName, playerName });
              setLobbyState(LOBBY_STATE.GAME);
            }}
          >
            Entrar
          </button>
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
            player={player}
            round={round}
            card={card}
          />
        </React.Fragment>
      );
  }
};

const Game = ({ roomName, gameState, round, player, card }) => {
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
              });
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

const Round = ({ roomName, round, player, card }) => {
  switch (round.state) {
    case ROUND_STATE.WAITING:
      return (
        <React.Fragment>
          {round.speaker?.id === player?.id ? (
            <button
              onClick={() =>
                socket.emit(CLIENT_EVENTS.START_ROUND, { roomName })
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
                onClick={() => socket.emit(CLIENT_EVENTS.SCORE, { roomName })}
              >
                Pontuar
              </button>
              <button
                onClick={() => socket.emit(CLIENT_EVENTS.SKIP, { roomName })}
              >
                Pular
              </button>
            </React.Fragment>
          )}
          {round.watcher?.id === player?.id && (
            <React.Fragment>
              <button
                onClick={() =>
                  socket.emit(CLIENT_EVENTS.INVALIDATE, { roomName })
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

const Card = ({ card }) => {
  console.log(card);
  return (
    <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px solid blue', borderRadius: '8px', margin: '20px' }}>
      <div>Card: {card.id}</div>
      <div style={{ fontSize: '20px' }}>Palavra:</div>
      <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{card.word.toUpperCase()}</div>
      <div style={{ borderTop: '1px solid gray' }}></div>
      <div>Taboos:</div>
      {card.tabu.map(tabu => <div key={tabu}>{tabu}</div>)}
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
