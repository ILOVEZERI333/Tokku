const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./user');
const Category = require('./category');

const UserPreference = sequelize.define('UserPreference', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    category_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: Category,
            key: 'id'
        }
    },
    preferences_level: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    }
}, {
    tableName: 'preference',
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ['user_id', 'category_id']
        }
    ]
});

module.exports = UserPreference;
