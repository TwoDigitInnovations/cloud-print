import { io } from "socket.io-client";

let socket: any;

const socketUrl = ("https://api.mylodge.cloud");
// const socketUrl = ("http://localhost:3001");

socket = io(socketUrl, {
    transports: ["websocket"],
    // withCredentials: true,
});

export default socket;