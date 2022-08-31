import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import { userJoin, userLeft, getUsers } from './util/users';

const app = express();

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "http://localhost:3000" } });

io.on("connection", socket => {
    socket.join("myChat");

    socket.on("handle-connection", (listing_id: string, user: string) => {
        const channel: string = listing_id;
        socket.join(channel);
        if (!userJoin(socket.id, channel, user)) {
            console.info(channel, user)
            socket.emit("username-taken")
        } else {
            socket.emit("username-submitted-successfully")
            io.to(channel).emit("get-connected-users", getUsers());
        }
    });

    socket.on("message", (message: { listing_id: string, message: string; username: string }) => {
        const channel: string = message.listing_id;
        socket.broadcast.to(channel).emit("receive-message", message);
    })

    socket.on("disconnect", () => {
        userLeft(socket.id);
    })
})

server.listen(5000, () => console.log("Server started on port 5000..."));