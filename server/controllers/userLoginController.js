const { validationResult, body } = require("express-validator")
const { authenticateUser, registerUser } = require("../services/userLoginServices")


const express = require("express")

const router = express.Router()

const validiationChain = [
    body("name")
        .notEmpty()
        .withMessage("Name is required")
        .isLength({ min: 3, max: 50 })
        .withMessage("Name must be between 3 and 50 characters long")
        .trim()
        .escape(),
    body("password")
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 6, max: 128 })
        .withMessage("Password must be between 6 and 128 characters long")
        .trim(),
]

const registerValidationChain = [
    body("name")
        .notEmpty()
        .withMessage("Name is required")
        .isLength({ min: 3, max: 50 })
        .withMessage("Name must be between 3 and 50 characters long")
        .trim()
        .escape(),
    body("email")
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Email must be valid")
        .trim()
        .escape(),
    body("password")
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 6, max: 128 })
        .withMessage("Password must be between 6 and 128 characters long")
        .trim(),
]

// Login route
router.post("/login", validiationChain, async (req, res) => {
    const errors = validationResult(req)
    
    if (!errors.isEmpty()) { 
        return res.status(400).json({ errors: errors.array() })
    }
    
    try { 
        const { name, password } = req.body

        const result = await authenticateUser(name, password)

        res.status(200).json({
            message: "Login successful",
            token: result.token,
            user: result.user
        })

    }
    catch (error) { 
        console.error(error)
        
        if (error.message === "User not found") {
            return res.status(404).json({"message": "User not found"})
        }
        
        if (error.message === "Invalid password") {
            return res.status(401).json({"message": "Invalid password"})
        }
        
        return res.status(500).json({ "message": "Internal server error" })
    }
})

router.post("/register", registerValidationChain, async (req, res) => {

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }


    try { 
        const { name, email, password } = req.body

        if (!name || !email) {  return res.status(400).json({ errors: errors.array() }) }

        console.log(name)

        const result = await registerUser(name, email, password)

        res.status(200).json(result)

    }
    catch (error) { 
        console.error(error)
        
        if (error.message.startsWith("Validation failed:")) {
            return res.status(400).json({ "message": error.message })
        }
        
        if (error.message.includes("already exists")) {
            return res.status(409).json({ "message": error.message })
        }
        
        if (error.message === "Database operation failed" || error.message.includes("Database") || error.message.includes("connection") || error.message.includes("authentication")) {
            return res.status(500).json({ "message": "Database operation failed" })
        }
        
        return res.status(500).json({ message: "Internal server error" })
    }

})

module.exports = router


