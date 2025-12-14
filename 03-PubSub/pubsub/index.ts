import { createClient } from "redis";
import type { PubSubPayload } from "../type/types.js";

const subscriber = createClient();
await startSubscriber();

const publisher = createClient();
await connectPublisher();

async function startSubscriber() {
  try {
    await subscriber.connect();
    console.log("Pubsub subscriber started...");
    await subscriber.pSubscribe(
      "incoming_chat",
      (message: string, channel: string) => {
        // Parse Payload
        try {
          const data: PubSubPayload = JSON.parse(message);

          console.log(`Received message on ${channel}: ${data.message}`);
          publisher.publish("all_chat", JSON.stringify(data));
          console.log(`Published message on ${channel}: ${data.toId}`);
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
    console.log("Pubsub publisher started...");
  } catch (err) {
    console.log("Failed to connect Publisher");
    console.log("Error connecting to redis: ", err);
    process.exit(1);
  }
}
