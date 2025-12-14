import express from "express";
import { createClient } from "redis";
import { WebSocketServer, WebSocket } from "ws";
import {
  type BasePayload,
  type PubSubPayload,
  type User,
} from "../type/types.js";

const app = express();
app.use(express.json());
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
    const user = users.find((user) => user.socket === socket);
    data = String(data);
    console.log("Received: ", data);
    try {
      const data2: BasePayload = JSON.parse(data);
      console.log(data2);
      if (user) {
        const payload: BasePayload = {
          toId: data2.toId,
          message: "Sample message",
        };
        handlemessage(user, payload, isBinary);
      }
    } catch (err) {
      console.log("Bad input data");
    }
  });
});

app.get("/ping", (req, res) => {
  res.end("pong");
});

app.post("/json", (req, res) => {
  const body = req.body;
  console.log(JSON.stringify(body));
  res.end(JSON.stringify(body));
});

// Handler Functionsy)
function handlemessage(user: User, data: BasePayload, isBinary: boolean) {
  try {
    const payload: PubSubPayload = {
      fromId: user.id,
      toId: data.toId,
      message: data.message,
    };
    publisher.publish("incoming_chat", JSON.stringify(payload));
  } catch (err) {
    console.error("error publishing to pubsub: ", err);
    return;
  }
  user?.socket.send(`Message sent to pubsub`);
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
        // Parse Payload
        try {
          const data: PubSubPayload = JSON.parse(message);
          console.log(`Received message on ${channel}: ${message}`);
          const id = data.toId;

          users.forEach((user) => {
            if (id == user.id) {
              console.log(`Sent final message to ${data.toId}`);
              user.socket.send(
                `User id ${data.fromId} pinged ${data.toId} with message ${data.message}`
              );
            }
          });
        } catch (err) {
          console.log("Improper JSON type...");
          publisher.publish("all_chat", "Invalid Type");
          return;
        }
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
