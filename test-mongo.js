// test-mongo.js
const { MongoClient, ServerApiVersion } = require("mongodb");

const uri = "mongodb+srv://designcraft:YOUR_PASSWORD@cluster0.o28grwm.mongodb.net/canva-clone?retryWrites=true&w=majority";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect(); // connect to Atlas
    await client.db("canva-clone").command({ ping: 1 }); // test DB
    console.log("Pinged your deployment. Connected successfully!");
  } finally {
    await client.close(); // close connection
  }
}

run().catch(console.dir);