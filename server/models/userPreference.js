const mongoose = require("mongoose")

const userPreferenceSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true,
        index: true //For faster queries by user
    },
    preference_name: {
        type: String,
        required: true
    },
    level: {
        type: Number,
        min: 1,
        max: 5,
        default: 1
    },
    category: {
        type: String,
        default: "general"
    },
    created_at: {
        type: Date,
        default: Date.now
    }
})


userPreferenceSchema.index({ user_id: 1, preference_name: 1 }, { unique: true })

module.exports = mongoose.model("UserPreference", userPreferenceSchema)
