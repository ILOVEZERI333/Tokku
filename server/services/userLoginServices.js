const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const {v4: uuid4} = require("uuid")
const User = require("../models/user")


const authenticateUser = async (name, password) => {
    try {
        const user = await User.findOne({ name: name }).lean()

        if (!user) {
            throw new Error("Invalid username or password")
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid) {
            throw new Error("Invalid username or password")
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

        return {
            token,
            user: {
                userId: user.userId,
                name: user.name,
                email: user.email
            }
        }
    } catch (error) {
        throw error
    }
}


const registerUser = async (name, email, password) => {
    try {
        // 11 rounds Blowfish cipher system bts
        const hash = await bcrypt.hash(password, 11)
        const userId = uuid4()

        const user = new User({
            name: name,
            email: email,
            password: hash,
            userId
        })

        await user.save()
        return { message: "Success!" }
    } catch (error) {
        // MongoDB Duplicate Key Error
        if (error.code === 11000) {
            throw new Error("User already exists")
        }
        throw error
    }
}


const checkUserExists = async (name) => {
    try {
        const user = await User.findOne({ name: name })
        return !!user
    } catch (error) {
        throw error
    }
}


const checkEmailExists = async (email) => {
    try {
        const user = await User.findOne({ email: email })
        return !!user
    } catch (error) {
        throw error
    }
}

module.exports = {
    authenticateUser,
    registerUser,
    checkUserExists,
    checkEmailExists
}
