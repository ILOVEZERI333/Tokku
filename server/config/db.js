const { Sequelize } = require('sequelize');
const { PostgresDialect } = require("@sequelize/postgres")
const dotenv = require("dotenv")

// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' ? './.env.production' : './.env.development'
dotenv.config({path: envFile})

const sequelize = new Sequelize(process.env.DATABASE_URL || 'postgresql://localhost:5432/', {
    dialect: PostgresDialect,
    database: 'postgres',
    user: 'optif',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

async function connectDB() { 
    try { 
        await sequelize.authenticate();
        console.log("Connected to PostgreSQL");
        
        //remove {alter:true} on PROD USE
        await sequelize.sync();
        console.log("Database synchronized");
        
        return sequelize;
    }
    catch (error) { 
        console.error("Database connection error:", error);
        throw error;
    }
}

module.exports = { connectDB, sequelize };