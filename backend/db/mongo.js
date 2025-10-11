const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || "BloomUp";

let client;
let db;

async function connectMongo() {
  if (db) return db;
  client = new MongoClient(uri, { ignoreUndefined: true });
  await client.connect();
  db = client.db(dbName);
  console.log("[MongoDB] connected:", dbName);
  return db;
}

function getDb() {
    if (!db) throw new Error("MongoDB not connected yet. Call connectMongo() first.");
    return db;
}

async function closeMongo() {
    if (client) await client.close();
    client = null;
    db = null;
}

module.exports = { connectMongo, getDb, closeMongo };