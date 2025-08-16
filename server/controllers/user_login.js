import { validationResult, body } from "express-validator"
import connectDB from "../config/db"
import User from "../models/user"
import {v4 as uuid4} from "uuid"


const bcrypt = require("bcrypt")
const express = require("express")
const jwt = require("jsonwebtoken")

const router = express.Router()


const validiationChain = [
    body("username").isLength({ min: 3 }).withMessage("Username must be at least 3 characters long"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
]



// Login route
router.post("/login", validiationChain, async (req, res) => {
    const errors = validationResult(req)
    
    if (!errors.isEmpty()) { 
        return res.status(400).json({ errors: errors.array() })
    }
    
    try { 
        const { name, password } = req.body


        const user = await User.findOne({name: name}).lean()

        if (!user) {
            return res.status(404).json({"message": "Invalid username or password"})
        }


        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid) {
            return res.status(404).json({"message": "Invalid username or password"})
        }

        const payload = {
            userId: user.userId,
            name: user.name,
            email: user.email
        }

        const JWT_SECRET = process.env.JWT_SECRET
        

        const token = jwt.sign(payload, JWT_SECRET, { 
            expiresIn: '24h',
            algorithm: 'HS256'
        })


        res.status(200).json({
            message: "Login successful",
            token: token,
            user: {
                userId: user.userId,
                name: user.name,
                email: user.email
            }
        })

    }
    catch (error) { 
        console.error(error)
        res.status(500).json({ "message": "Internal server error" })
    }
})


router.post("/register", validiationChain, async (req, res) => {

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    try { 
        const { name, email, password } = req.body

        connection = connectDB()

            


        bcrypt.hash(password, 11, async (err, hash) => {
            if (err) throw err;

            const userExists = await User.findOne({name: name, email: email}).exec()

            if (userExists) {
                res.status(409).json({"message": "User with name or email already exists."})
            }

            const userId = uuid4()

            const user = new User({

                name: name,
                email:email,
                password: hash,
                userId

            })

            user.save()

            res.status(200).json({"message": "Success!"})
        })

    }
    catch (error) { 
        console.error(error)
        res.status(500).json({ message: "Internal server error" })
    }

})

module.exports = router


