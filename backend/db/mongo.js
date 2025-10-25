const mongoose = require("mongoose");

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || "BloomUp";

async function connectMongo() {
    try {
        // if already connected
        if (mongoose.connection.readyState ===1 ) {
            return mongoose.connection;
        }

        await mongoose.connect(uri, {
            dbName,
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        return mongoose.connection;
    } catch (err) {
        throw err;
    }
}

async function closeMongo() {
    await mongoose.disconnect();
}

module.exports = { connectMongo, closeMongo };
