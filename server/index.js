





const express = require("express")
const { connectDB } = require("./config/db")
const app = express()
const PORT = process.env.PORT || 3000

// Import models to ensure they're registered with sequelize
require("./models/user")
require("./models/userPreference")


connectDB()
    .then(() => {
        app.listen(PORT, function(error) {
            if (error) console.log(error);
            console.log("Server listening on port ", PORT)
        })
    })
    .catch((error) => {
        console.error("Failed to start server:", error)
        process.exit(1)
    })
