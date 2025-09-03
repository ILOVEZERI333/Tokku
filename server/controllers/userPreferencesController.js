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
    body("category").notEmpty().withMessage("Category is required"),
    body("level").optional().isInt({ min: 1, max: 5 }).withMessage("Level must be between 1 and 5")
]

const updatePreferenceValidation = [
    body("level").isInt({ min: 1, max: 5 }).withMessage("Level must be between 1 and 5")
]

// POST /api/preferences - Create new preference
router.post("/preferences", createPreferenceValidation, async (req, res) => {
    const errors = validationResult(req)
    
    if (!errors.isEmpty()) {
        console.log("Request body:", req.body)
        console.log("Validation errors:", errors.array())
        console.log("ERROR" + errors.array()[0].message)

        return res.status(400).json({ errors: errors.array() })
    }
    
    try {
        const { user_id, category, level = 1 } = req.body
        
        const preference = await addUserPreference(user_id, category, level)
        
        res.status(201).json(preference)
    } catch (error) {
        console.error("Error creating preference:", error)
        
        if (error.message.startsWith("Validation failed:")) {
            return res.status(400).json({ message: error.message })
        }
        
        if (error.message === "Preference already exists for this user and category") {
            return res.status(409).json({ message: "Preference already exists for this user and category" })
        }
        
        if (error.message === "Invalid user or category reference") {
            return res.status(400).json({ message: "Invalid user or category reference" })
        }
        
        if (error.message === "Database operation failed") {
            return res.status(500).json({ message: "Database operation failed" })
        }
        
        // Log the full error for debugging
        console.error("Full error details:", {
            message: error.message,
            name: error.name,
            stack: error.stack
        })

        return res.status(500).json({ 
            message: "Internal server error",
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        })
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
        
        if (error.message === "Database operation failed") {
            return res.status(500).json({ message: "Database operation failed" })
        }
        
        return res.status(500).json({ message: "Internal server error" })
    }
})

// PUT /api/preferences/:userId/:category - Update preference
router.put("/preferences/:userId/:category", updatePreferenceValidation, async (req, res) => {
    const errors = validationResult(req)
    
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    
    try {
        const { userId, category } = req.params
        const { level } = req.body
        
        const preference = await updateUserPreference(userId, category, level)
        
        res.status(200).json(preference)
    } catch (error) {
        console.error(error)
        
        if (error.message.startsWith("Validation failed:")) {
            return res.status(400).json({ message: error.message })
        }
        
        if (error.message === "Category not found") {
            return res.status(404).json({ message: "Category not found" })
        }
        
        if (error.message === "Preference not found") {
            return res.status(404).json({ message: "Preference not found" })
        }
        
        if (error.message === "Database operation failed") {
            return res.status(500).json({ message: "Database operation failed" })
        }
        
        return res.status(500).json({ message: "Internal server error" })
    }
})

// DELETE /api/preferences/:userId/:category - Delete preference
router.delete("/preferences/:userId/:category", async (req, res) => {
    try {
        const { userId, category } = req.params
        
        const deleted = await removeUserPreference(userId, category)
        
        if (!deleted) {
            return res.status(404).json({ message: "Preference not found" })
        }
        
        res.status(200).json({ message: "Preference deleted successfully" })
    } catch (error) {
        console.error(error)
        
        if (error.message === "Category not found") {
            return res.status(404).json({ message: "Category not found" })
        }
        
        if (error.message === "Database operation failed") {
            return res.status(500).json({ message: "Database operation failed" })
        }
        
        return res.status(500).json({ message: "Internal server error" })
    }
})

module.exports = router

