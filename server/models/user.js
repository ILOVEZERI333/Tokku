

const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    user_id: {
        type: String,
        required: true,
        unique: true,
        primaryKey: true
    },
    password: {
        type: String,
        required: true
    }
})


module.exports = mongoose.model("User", userSchema)