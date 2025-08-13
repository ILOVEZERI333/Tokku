const mongoose = require("mongoose")
import dotenv from "dotenv"

dotenv.config({path: "./config.env"})

async function connectDB() { 
    try { 
        const conn = await mongoose.connect(process.env.MONGO_URI)
        console.log("Connected to MongoDB")
        return conn
    }
    catch (error) { 
        console.error(error)
        throw error
    }
}

module.exports = connectDB