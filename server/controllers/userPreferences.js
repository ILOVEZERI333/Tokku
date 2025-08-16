const User = require("../models/user")
const UserPreference = require("../models/userPreference")


const getUserWithPreferences = async (user_id) => {
    try {
        const user = await User.findOne({ user_id })
        if (!user) {
            throw new Error("User not found")
        }

        const preferences = await UserPreference.find({ user_id })

        return {
            ...user.toObject(),
            preferences
        }
    } catch (error) {
        throw error
    }
}

// Add a preference to a user
const addUserPreference = async (user_id, preference_name, level = 1, category = "general") => {
    try {
        const newPreference = new UserPreference({
            user_id,
            preference_name: preference_name.toLowerCase(), // Normalize names
            level,
            category
        })
        return await newPreference.save()
    } catch (error) {
        // Duplicate key error
        if (error.code === 11000) {
            throw new Error("Preference already exists for this user")
        }
        throw error
    }
}


const updateUserPreference = async (user_id, preference_name, new_level) => {
    try {
        const result = await UserPreference.findOneAndUpdate(
            { user_id, preference_name: preference_name.toLowerCase() },
            { level: new_level },
            { new: true }
        )
        if (!result) {
            throw new Error("Preference not found")
        }
        return result
    } catch (error) {
        throw error
    }
}

// Remove a preference from a user
const removeUserPreference = async (user_id, preference_name) => {
    try {
        const result = await UserPreference.deleteOne({ 
            user_id, 
            preference_name: preference_name.toLowerCase() 
        })
        return result.deletedCount > 0
    } catch (error) {
        throw error
    }
}

const findUsersByPreference = async (preference_name, level) => {
    try {
        const query = { preference_name: preference_name.toLowerCase() }
        

        query.level = level

        const userPreferences = await UserPreference.find(query)
        const user_ids = userPreferences.map(user => user.user_id)
        return await User.find({ user_id: { $in: user_ids } })
    } catch (error) {
        throw error
    }
}


// Get user's preferences by category
const getUserPreferencesByCategory = async (user_id, category) => {
    try {
        return await UserPreference.find({ user_id, category })
    } catch (error) {
        throw error
    }
}

// Get user's essential preferences (level 5)
const getUserEssentialPreferences = async (user_id) => {
    try {
        return await UserPreference.find({ user_id, level: 5 })
    } catch (error) {
        throw error
    }
}

module.exports = {
    getUserWithPreferences,
    addUserPreference,
    updateUserPreference,
    removeUserPreference,
    findUsersByPreference,
    getUserPreferencesByCategory,
    getUserEssentialPreferences
}
