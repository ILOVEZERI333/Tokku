const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./user');
const Category = require('./category');

const UserPreference = sequelize.define('UserPreference', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
            model: User,
            key: 'id'
        }
    },
    category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
            model: Category,
            key: 'id'
        }
    },
    preference_level: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 5
        }
    }
}, {
    tableName: 'preferences',
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ['user_id', 'category_id']
        }
    ]
});

// Define associations
UserPreference.belongsTo(User, { foreignKey: 'user_id', targetKey: 'id' });
UserPreference.belongsTo(Category, { foreignKey: 'category_id', targetKey: 'id' });

User.hasOne(UserPreference, { foreignKey: 'user_id', sourceKey: 'id' });
Category.hasOne(UserPreference, { foreignKey: 'category_id', sourceKey: 'id' });

module.exports = UserPreference;
