# Learning Websockets

# Pubsub example
## Setup
Install the dependencies
```
> npm i
```

Start redis instance
```
docker-compose up
```

Start the services

Run Server. To run multiple servers change the port number and run the following command again
```
npm run server
```

Run the pubsub server
```
npm run pubsub
```

## Testing
Open any API client which supports. Connect demo users to different WebSocket servers

When connected users will get their user ids.

Any user can ping any other user by using their id.

Simple send the id as the payload to ping the other user