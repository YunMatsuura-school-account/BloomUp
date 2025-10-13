const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
console.log("Connecting to MongoDB:", uri.slice(0, 50) + "...");

const dbName = "BloomUp";
const collectionName = "ChildProfiles";

async function getCollection() {
  if (!client.topology || !client.topology.isConnected()) {
    await client.connect();
  }
  const db = client.db(dbName);
  return db.collection(collectionName);
}

async function getAllChildren() {
  const collection = await getCollection();
  return await collection.find({}).toArray();
}

async function getChildById(id) {
  const collection = await getCollection();
  return await collection.findOne({ _id: new ObjectId(id) });
}

async function createChild(profileData) {
  const collection = await getCollection();
  const result = await collection.insertOne(profileData);
  return result.insertedId;
}

async function updateChild(id, updatedData) {
  const collection = await getCollection();
  await collection.updateOne({ _id: new ObjectId(id) }, { $set: updatedData });
}

async function deleteChild(id) {
  const collection = await getCollection();
  await collection.deleteOne({ _id: new ObjectId(id) });
}

module.exports = {
  getAllChildren,
  getChildById,
  createChild,
  updateChild,
  deleteChild,
};
