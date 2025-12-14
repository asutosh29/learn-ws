import { createClient } from "redis";

interface data {
  id: number;
}

const client = createClient();

async function startWorker() {
  try {
    await client.connect();
    console.log("Connected to client successfully");
    // brpop

    while (1) {
      try {
        const data = await client.brPop("channel", 0);
        // console.log(data);
        console.log("Working on id: ", data?.element)
        await new Promise((resolve, reject) => {setTimeout(() => {resolve(1)}, (4 + Math.random()*2)*1000);})
        console.log("Processed id: ", data?.element)
      } catch (error) {
        console.log("Error occured while brPOP: ", error);
      }
    }
  } catch (error) {
    console.log("error connecting to redis: ", error);
  }
}

startWorker()

// async function processData(data: data | null){
//     if (!data){
//         return
//     }
//     const {id} = data

//     console.log("Processing id: ", id)

//     // Simulate processing
//     await new Promise((resolve, reject) => {
//         setTimeout(()=>resolve(1),(Math.random()*5))
//     })

// }
