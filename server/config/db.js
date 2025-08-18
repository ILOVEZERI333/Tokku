const mongoose = require("mongoose")
import dotenv from "dotenv"

// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' ? './.env.production' : './.env.development'
dotenv.config({path: envFile})

async function connectDB() { 
    try { 
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        console.log("Connected to MongoDB")
        return conn
    }
    catch (error) { 
        console.error(error)
        throw error
    }
}

module.exports = connectDB