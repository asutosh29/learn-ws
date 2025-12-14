import express from "express";
import { createClient } from "redis";
import { WebSocketServer, WebSocket } from "ws";

interface User {
  socket: WebSocket;
  id: string;
}

interface Payload {
  fromId: string;
  toId: string;
  message: string;
}

const app = express();
const PORT = 8080;
// HTTP Server
const server = app.listen(PORT, (err) => {
  if (err) {
    console.log("error starting server: ", err);
  } else {
    console.log("server started successfully on port: ", PORT);
  }
});

// WebSocket server
const wss = new WebSocketServer({ server });

// Initialising the PubSub for the current server
const subscriber = createClient();
await startSubscriber();

const publisher = createClient();
await connectPublisher();

const users: User[] = [];
let NUM_USERS = 0;

wss.on("connection", (socket) => {
  const newUser: User = {
    socket: socket,
    id: crypto.randomUUID(),
  };
  users.push(newUser);
  NUM_USERS++;

  socket.send(`User with id ${newUser.id} Connected Successfully`);
  socket.on("error", (err) => {
    console.log(err);
  });

  socket.on("message", (data: string, isBinary) => {
    handlemessage(socket, newUser, data,isBinary);
  });
});

app.get("/ping", (req, res) => {
  res.end("pong");
});

// Handler Functions
function handlemessage(socket: WebSocket, user: User, data: string,isBinary: boolean) {
  const currentUser = users.find((user) => user.socket === socket);

  try {
    publisher.publish("incoming_chat", data);
  } catch (err) {
    console.error("error publishing to pubsub: ", err);
    return;
  }
  currentUser?.socket.send(`Message sent to pubsub`);
}

// PUBSUB
async function startSubscriber() {
  try {
    await subscriber.connect();
    console.log("Subscriber started...");
    console.log("Listening to pubsub...");
    await subscriber.subscribe(
      "all_chat",
      (message: string, channel: string) => {
        console.log(`Received message on ${channel}: ${message}`);
        const id = message;
        users.forEach((user) => {
          if (id == user.id) {
            console.log(`Sent final message to ${id}`);
            user.socket.send(`User id pinged ${id}`);
          }
        });
      }
    );
  } catch (err) {
    console.log("Failed to connect to redis server: ", err);
  }
}

async function connectPublisher() {
  try {
    await publisher.connect();
    console.log("Publisher started...");
  } catch (err) {
    console.log("Failed to connect Publisher");
    console.log("Error connecting to redis: ", err);
    process.exit(1);
  }
}
