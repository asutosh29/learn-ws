import express from "express"
import {createClient} from "redis"

const app = express()
app.use(express.json())

const client = createClient()
client.on("error", err => console.log("Redis client error: ", err))
await client.connect()

app.post("/check",(req,res)=>{
    const {id} = req.body

    res.json({message:"OK",id: id}).status(200)
})

app.listen(8080, ()=>{console.log("Server started on port 8080...")})