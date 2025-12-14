import { createClient } from "redis";

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
        console.log(`Received message on ${channel}: ${message}`);
        publisher.publish("all_chat", message);
        console.log(`Published message to ${channel}: ${message}`);
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
