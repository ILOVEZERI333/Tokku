const { validationResult, body } = require("express-validator")
const express = require("express")
const { 
    addUserPreference, 
    getUserWithPreferences, 
    updateUserPreference, 
    removeUserPreference 
} = require("../services/userPreferenceServices")

const router = express.Router()


const createPreferenceValidation = [
    body("user_id").notEmpty().withMessage("User ID is required"),
    body("preference_name").notEmpty().withMessage("Preference name is required"),
    body("level").optional().isInt({ min: 1, max: 5 }).withMessage("Level must be between 1 and 5"),
    body("category").optional().isString().withMessage("Category must be a string")
]

const updatePreferenceValidation = [
    body("level").isInt({ min: 1, max: 5 }).withMessage("Level must be between 1 and 5")
]

// POST /api/preferences - Create new preference
router.post("/preferences", createPreferenceValidation, async (req, res) => {
    const errors = validationResult(req)
    
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    
    try {
        const { user_id, preference_name, level = 1, category = "general" } = req.body
        
        const preference = await addUserPreference(user_id, preference_name, level, category)
        
        res.status(201).json(preference)
    } catch (error) {
        console.error(error)
        
        if (error.message === "Preference already exists for this user") {
            return res.status(409).json({ message: "Preference already exists for this user" })
        }
        
        return res.status(500).json({ message: "Internal server error" })
    }
})

// GET /api/preferences/:userId - Get user preferences
router.get("/preferences/:userId", async (req, res) => {
    try {
        const { userId } = req.params
        
        const userWithPreferences = await getUserWithPreferences(userId)
        
        res.status(200).json(userWithPreferences)
    } catch (error) {
        console.error(error)
        
        if (error.message === "User not found") {
            return res.status(404).json({ message: "User not found" })
        }
        
        return res.status(500).json({ message: "Internal server error" })
    }
})

// PUT /api/preferences/:id - Update preference
router.put("/preferences/:id", updatePreferenceValidation, async (req, res) => {
    const errors = validationResult(req)
    
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    
    try {
        const { id } = req.params
        const { level } = req.body
        
        // Note: This would need to be adjusted based on how you want to identify preferences
        // Currently using user_id and preference_name, but the route suggests using an ID
        const preference = await updateUserPreference(user_id, preference_name, level)
        
        res.status(200).json(preference)
    } catch (error) {
        console.error(error)
        
        if (error.message === "Preference not found") {
            return res.status(404).json({ message: "Preference not found" })
        }
        
        return res.status(500).json({ message: "Internal server error" })
    }
})

// DELETE /api/preferences/:id - Delete preference
router.delete("/preferences/:id", async (req, res) => {
    try {
        const { id } = req.params
        
        // Note: This would need to be adjusted based on how you want to identify preferences
        // Currently using user_id and preference_name, but the route suggests using an ID
        const deleted = await removeUserPreference(user_id, preference_name)
        
        if (!deleted) {
            return res.status(404).json({ message: "Preference not found" })
        }
        
        res.status(200).json({ message: "Preference deleted successfully" })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Internal server error" })
    }
})

module.exports = router

