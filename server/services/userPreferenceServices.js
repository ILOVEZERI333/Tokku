const User = require("../models/user")
const Category = require("../models/category")
const UserPreference = require("../models/userPreference")
const { Op } = require('sequelize');


const getUserWithPreferences = async (user_id) => {
    try {
        // Convert user_id to number for bigint compatibility
        const userId = parseInt(user_id, 10);
        
        if (isNaN(userId)) {
            throw new Error("Invalid user ID format");
        }
        
        const user = await User.findOne({ 
            where: { id: userId },
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
        console.error("Error in getUserWithPreferences:", {
            message: error.message,
            name: error.name,
            stack: error.stack
        });
        
        if (error.name === 'SequelizeDatabaseError') {
            throw new Error("Database operation failed")
        }
        throw error
    }
}

const addUserPreference = async (user_id, categoryName, preference_level = 1) => {
    try {
        // Convert user_id to number for bigint compatibility
        const userId = parseInt(user_id, 10);
        
        if (isNaN(userId)) {
            throw new Error("Invalid user ID format");
        }
        
        let category = await Category.findOne({
            where: { name: categoryName.toLowerCase() }
        });
        
        if (!category) {
            category = await Category.create({
                name: categoryName.toLowerCase()
            });
        }

        const newPreference = await UserPreference.create({
            user_id: userId,
            category_id: category.id,
            preferences_level: preference_level
        });
        
        // Return the preference with category name and correct field names
        return {
            id: newPreference.id,
            user_id: newPreference.user_id,
            category: category.name,
            level: newPreference.preferences_level
        };
    } catch (error) {
        console.error("Error in addUserPreference:", {
            message: error.message,
            name: error.name,
            stack: error.stack
        });

        if (error.name === 'SequelizeValidationError') {
            const validationErrors = error.errors.map(err => err.message).join(', ')
            throw new Error(`Validation failed: ${validationErrors}`)
        }

        if (error.name === 'SequelizeUniqueConstraintError') {
            throw new Error("Preference already exists for this user and category")
        }

        if (error.name === 'SequelizeForeignKeyConstraintError') {
            throw new Error("Invalid user or category reference")
        }

        if (error.name === 'SequelizeDatabaseError') {
            throw new Error("Database operation failed")
        }

        // Re-throw the original error for better debugging
        throw error
    }
}

const updateUserPreference = async (user_id, categoryName, new_preference_level) => {
    try {
        // Convert user_id to number for bigint compatibility
        const userId = parseInt(user_id, 10);
        
        if (isNaN(userId)) {
            throw new Error("Invalid user ID format");
        }
        
        const category = await Category.findOne({
            where: { name: categoryName.toLowerCase() }
        });

        if (!category) {
            throw new Error("Category not found")
        }

        const result = await UserPreference.findOne({
            where: { 
                user_id: userId, 
                category_id: category.id 
            }
        });

        if (!result) {
            throw new Error("Preference not found")
        }

        result.preferences_level = new_preference_level;
        await result.save();
        
        // Return the preference with category name and correct field names
        return {
            id: result.id,
            user_id: result.user_id,
            category: category.name,
            level: result.preferences_level
        };
    } catch (error) {
        if (error.name === 'SequelizeValidationError') {
            const validationErrors = error.errors.map(err => err.message).join(', ')
            throw new Error(`Validation failed: ${validationErrors}`)
        }

        if (error.name === 'SequelizeDatabaseError') {
            throw new Error("Database operation failed")
        }

        throw error
    }
}


const removeUserPreference = async (user_id, categoryName) => {
    try {
        // Convert user_id to number for bigint compatibility
        const userId = parseInt(user_id, 10);
        
        if (isNaN(userId)) {
            throw new Error("Invalid user ID format");
        }
        
        const category = await Category.findOne({
            where: { name: categoryName.toLowerCase() }
        });

        if (!category) {
            throw new Error("Category not found")
        }

        const result = await UserPreference.destroy({ 
            where: { 
                user_id: userId, 
                category_id: category.id 
            }
        });
        return result > 0;
    } catch (error) {
        if (error.name === 'SequelizeDatabaseError') {
            throw new Error("Database operation failed")
        }

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
                    preferences_level: preference_level
                },
                include: [{
                    model: Category
                }]
            }]
        });
        return users;
    } catch (error) {
        if (error.name === 'SequelizeDatabaseError') {
            throw new Error("Database operation failed")
        }

        throw error
    }
}

const getUserPreferencesByCategory = async (user_id, categoryName) => {
    try {
        // Convert user_id to number for bigint compatibility
        const userId = parseInt(user_id, 10);
        
        if (isNaN(userId)) {
            throw new Error("Invalid user ID format");
        }
        
        const category = await Category.findOne({
            where: { name: categoryName.toLowerCase() }
        });

        if (!category) {
            throw new Error("Category not found")
        }

        return await UserPreference.findAll({ 
            where: { 
                user_id: userId, 
                category_id: category.id 
            },
            include: [{
                model: Category
            }]
        });
    } catch (error) {
        if (error.name === 'SequelizeDatabaseError') {
            throw new Error("Database operation failed")
        }

        throw error
    }
}


const getUserEssentialPreferences = async (user_id) => {
    try {
        // Convert user_id to number for bigint compatibility
        const userId = parseInt(user_id, 10);
        
        if (isNaN(userId)) {
            throw new Error("Invalid user ID format");
        }
        
        return await UserPreference.findAll({ 
            where: { user_id: userId, preferences_level: 5 },
            include: [{
                model: Category
            }]
        });
    } catch (error) {
        if (error.name === 'SequelizeDatabaseError') {
            throw new Error("Database operation failed")
        }

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
