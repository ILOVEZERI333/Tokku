const User = require('./user');
const Category = require('./category');
const UserPreference = require('./userPreference');

// Define associations
User.hasMany(UserPreference, { foreignKey: 'user_id', sourceKey: 'id' });
Category.hasMany(UserPreference, { foreignKey: 'category_id', sourceKey: 'id' });

UserPreference.belongsTo(User, { foreignKey: 'user_id', targetKey: 'id' });
UserPreference.belongsTo(Category, { foreignKey: 'category_id', targetKey: 'id' });

module.exports = {
    User,
    Category,
    UserPreference
};
