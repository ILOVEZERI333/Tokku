import { validationResult, query, body } from "express-validator"
import connectDB from "../config/db"


const express = require("express")

const router = express.Router()


const validiationChain = [
    body("username").isLength({ min: 3 }).withMessage("Username must be at least 3 characters long"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
]



// Login route
router.post("/login", validiationChain, (req, res) => {

    
    const errors = validationResult(req)
    
    if (!errors.isEmpty()) { 
        return res.status(400).json({ errors: errors.array() })
    }
    
    try { 
        const { email, password } = req.body
    }
    catch (error) { 
        console.error(error)
        res.status(500).json({ message: "Internal server error" })
    }

    
    // - Validate credentials
    //TODO: Implement user model, bcrypt (hashing password)
    // - Generate JWT token or session
    // - Send response
})

// Register route
router.post("/register", validiationChain, (req, res) => {

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    try { 
        const { email, password } = req.body
    }
    catch (error) { 
        console.error(error)
        res.status(500).json({ message: "Internal server error" })
    }


    connection = connectDB()



    // TODO: User Model
    // - Check if user already exists
    // - Hash password
    // - Save user to database
    // - Send response
})

module.exports = router


