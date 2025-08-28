const User = require("../models/user")
const Category = require("../models/category")
const UserPreference = require("../models/userPreference")
const { Op } = require('sequelize');


const getUserWithPreferences = async (user_id) => {
    try {
        const user = await User.findOne({ 
            where: { id: user_id },
            include: [{
                model: UserPreference,
                include: [{
                    model: Category
                }]
            }]
        });

        if (!user) {
            throw new Error("User not found")
        }

        return user.toJSON();
    } catch (error) {
        throw error
    }
}

const addUserPreference = async (user_id, categoryName, preference_level = 1) => {
    try {

        let category = await Category.findOne({
            where: { name: categoryName.toLowerCase() }
        });
        
        if (!category) {
            category = await Category.create({
                name: categoryName.toLowerCase()
            });
        }

        const newPreference = await UserPreference.create({
            user_id,
            category_id: category.id,
            preference_level
        });
        return newPreference;
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            throw new Error("Preference already exists for this user and category")
        }
        throw error
    }
}

const updateUserPreference = async (user_id, categoryName, new_preference_level) => {
    try {
        const category = await Category.findOne({
            where: { name: categoryName.toLowerCase() }
        });

        if (!category) {
            throw new Error("Category not found")
        }

        const result = await UserPreference.findOne({
            where: { 
                user_id, 
                category_id: category.id 
            }
        });

        if (!result) {
            throw new Error("Preference not found")
        }

        result.preference_level = new_preference_level;
        await result.save();
        return result;
    } catch (error) {
        throw error
    }
}


const removeUserPreference = async (user_id, categoryName) => {
    try {
        const category = await Category.findOne({
            where: { name: categoryName.toLowerCase() }
        });

        if (!category) {
            throw new Error("Category not found")
        }

        const result = await UserPreference.destroy({ 
            where: { 
                user_id, 
                category_id: category.id 
            }
        });
        return result > 0;
    } catch (error) {
        throw error
    }
}

const findUsersByPreference = async (categoryName, preference_level) => {
    try {
        const category = await Category.findOne({
            where: { name: categoryName.toLowerCase() }
        });

        if (!category) {
            throw new Error("Category not found")
        }

        const users = await User.findAll({
            include: [{
                model: UserPreference,
                where: {
                    category_id: category.id,
                    preference_level: preference_level
                },
                include: [{
                    model: Category
                }]
            }]
        });
        return users;
    } catch (error) {
        throw error
    }
}

const getUserPreferencesByCategory = async (user_id, categoryName) => {
    try {
        const category = await Category.findOne({
            where: { name: categoryName.toLowerCase() }
        });

        if (!category) {
            throw new Error("Category not found")
        }

        return await UserPreference.findAll({ 
            where: { 
                user_id: user_id, 
                category_id: category.id 
            },
            include: [{
                model: Category
            }]
        });
    } catch (error) {
        throw error
    }
}


const getUserEssentialPreferences = async (user_id) => {
    try {
        return await UserPreference.findAll({ 
            where: { user_id, preference_level: 5 },
            include: [{
                model: Category
            }]
        });
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
    getUserEssentialPreferences,

}
