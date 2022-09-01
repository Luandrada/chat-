import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import { userJoin, userLeft, getUsers } from './util/users';

const app = express();

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "http://localhost:3000" } });

io.on("connection", socket => {
    socket.join("MyChat");

    socket.on("handle-connection", (listing_id: string, user: string) => {
        console.log(listing_id);
        
        const channel: string = listing_id;
        socket.join(channel);
        console.info(channel, user)
        if (!userJoin(socket.id, channel, user)) {
            console.info(channel, user)
            socket.emit("room-already-exist")
        } else {
            socket.emit("room-created-successfully")
            io.to(channel).emit("get-connected-users", getUsers());
        }
    });

    socket.on("message", (message: { listingId: string, message: string; userId: string }) => {
        const channel: string = message.listingId;
        console.log("CANAL" , channel);
        
        socket.broadcast.to(channel).emit("receive-message", message);
    })

    socket.on("disconnect", () => {
        userLeft(socket.id);
    })
})

server.listen(5000, () => console.log("Server started on port 5000..."));