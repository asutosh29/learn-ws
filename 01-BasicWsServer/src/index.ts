import {WebSocket, WebSocketServer} from "ws"
import http from "http"

const server = http.createServer((req: http.IncomingMessage , res: http.ServerResponse) => {
    console.log(`${new Date()}: request received for ${req.url}`)
    res.end("Hi there!")
});

//  wss: web socket server
const wss = new WebSocketServer({server})

wss.on("connection",(socket) => {
    socket.on('error',(err) => console.log(err))

    socket.on('message',(data, isBinary)=>{
        wss.clients.forEach((client)=>{
            if (client.readyState === WebSocket.OPEN){
                client.send(data, {binary: isBinary})
                client.send(`${new Date()}: request received`)
            }
        })
    })

    socket.send("Message from server!!!")
})

server.listen(8080,()=>console.log("Server running on port 8080"))