const { sequelize } = require('../config/db');
const User = require('../models/user');
const Category = require('../models/category');
const UserPreference = require('../models/userPreference');

async function createTables() {
    try {
        console.log('Creating database tables...');
        
        await sequelize.sync(); 
        
        console.log('Database tables created successfully!');
        
        console.log('Creating sample data...');
        
        // Create categories first
        const romanceCategory = await Category.create({
            name: 'romance'
        });
        
        const actionCategory = await Category.create({
            name: 'action'
        });
        
        const comedyCategory = await Category.create({
            name: 'comedy'
        });
        
        const dramaCategory = await Category.create({
            name: 'drama'
        });
        
        // Create users
        const user1 = await User.create({
            user_name: 'testuser1',
            email: 'test1@example.com',
            mal_acc: 'user1_mal'
        });
        
        const user2 = await User.create({
            user_name: 'testuser2',
            email: 'test2@example.com',
            mal_acc: null
        });
        
        // Create preferences
        await UserPreference.create({
            user_id: user1.id,
            category_id: romanceCategory.id,
            preference_level: 3
        });
        
        await UserPreference.create({
            user_id: user1.id,
            category_id: actionCategory.id,
            preference_level: 5
        });
        
        await UserPreference.create({
            user_id: user2.id,
            category_id: comedyCategory.id,
            preference_level: 1
        });
        
        await UserPreference.create({
            user_id: user2.id,
            category_id: dramaCategory.id,
            preference_level: 4
        });
        

        console.log('Sample data created successfully!');
        
    } catch (error) {
        console.error('Error creating tables:', error);
        throw error;
    } finally {
        await sequelize.close();
    }
}

// Run migration if this file is executed directly
if (require.main === module) {
    createTables()
        .then(() => {
            console.log('Migration completed successfully!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Migration failed:', error);
            process.exit(1);
        });
}

module.exports = createTables;
