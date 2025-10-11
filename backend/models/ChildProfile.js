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

async function getAllProfiles() {
  const collection = await getCollection();
  return await collection.find({}).toArray();
}

async function getProfileById(id) {
  const collection = await getCollection();
  return await collection.findOne({ _id: new ObjectId(id) });
}

async function createProfile(profileData) {
  const collection = await getCollection();
  const result = await collection.insertOne(profileData);
  return result.insertedId;
}

async function updateProfile(id, updatedData) {
  const collection = await getCollection();
  await collection.updateOne(
    { _id: new ObjectId(id) },
    { $set: updatedData }
  );
}

async function deleteProfile(id) {
  const collection = await getCollection();
  await collection.deleteOne({ _id: new ObjectId(id) });
}

module.exports = {
  getAllProfiles,
  getProfileById,
  createProfile,
  updateProfile,
  deleteProfile,
};
