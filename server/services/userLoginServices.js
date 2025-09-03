const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const {v4: uuid4} = require("uuid")
const { Op } = require('sequelize')
const User = require("../models/user")


const authenticateUser = async (name, password) => {
    try {
        const user = await User.findOne({ 
            where: { user_name: name },
            raw: true 
        });

        if (!user) {
            throw new Error("User not found")
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid) {
            throw new Error("Invalid password")
        }

        const payload = {
            userId: user.id,
            user_name: user.user_name,
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
                id: user.id,
                user_name: user.user_name,
                email: user.email
            }
        }
    } catch (error) {
        throw error
    }
}


const registerUser = async (name, email, password) => {
    try {
        // Check if user already exists
        const existingUser = await User.findOne({
            where: {
                [Op.or]: [
                    { user_name: name },
                    { email: email }
                ]
            }
        });

        if (existingUser) {
            throw new Error("User already exists")
        }

        // 11 rounds Blowfish cipher system bts
        const hash = await bcrypt.hash(password, 11)

        await User.create({
            user_name: name,
            email: email,
            password: hash
        })

        return { message: "Success!" }
    } catch (error) {

        if (error.name === 'SequelizeValidationError') {
            const validationErrors = error.errors.map(err => err.message).join(', ')
            throw new Error(`Validation failed: ${validationErrors}`)
        }

        if (error.name === 'SequelizeUniqueConstraintError') {
            throw new Error("User already exists")
        }

        throw error
    }
}


const checkUserExists = async (name) => {
    try {
        const user = await User.findOne({ where: { user_name: name } })
        return !!user
    } catch (error) {
        throw error
    }
}


const checkEmailExists = async (email) => {
    try {
        const user = await User.findOne({ where: { email: email } })
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
