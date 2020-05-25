import io from 'socket.io-client';

const socket = io(`http://localhost:${process.env.PORT || 3000}`);

export default socket;