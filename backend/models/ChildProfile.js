const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
const dbName = "BloomUp";
const collectionName = "ChildProfiles";

async function getCollection() {
  if (!client.topology || !client.topology.isConnected()) {
    await client.connect();
  }
  const db = client.db(dbName);
  return db.collection(collectionName);
}

async function getAllChildrenByUser(userId) {
  const collection = await getCollection();
  return await collection.find({ userId: String(userId) }).toArray();
}

async function getChildByIdForUser(userId, childId) {
  const collection = await getCollection();
  return await collection.findOne({
    _id: new ObjectId(childId),
    userId: String(userId),
  });
}

async function createChildForUser(userId, profileData) {
  const collection = await getCollection();
  const document = { ...profileData, userId: String(userId) };
  const result = await collection.insertOne(document);
  return result.insertedId;
}

async function updateChildForUser(userId, childId, updatedData) {
  const collection = await getCollection();
  const result = await collection.updateOne(
    { _id: new ObjectId(childId), userId: String(userId) },
    { $set: { ...updatedData, userId: String(userId) } }
  );
  return result.matchedCount > 0; // 0: the child not found
}

async function deleteChildForUser(userId, childId) {
  const collection = await getCollection();
  const result = await collection.deleteOne({
    _id: new ObjectId(childId),
    userId: String(userId),
  });
  return result.deletedCount > 0; // 0: the child not found
}

module.exports = {
  getAllChildrenByUser,
  getChildByIdForUser,
  createChildForUser,
  updateChildForUser,
  deleteChildForUser,
};
