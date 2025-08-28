const User = require("../models/user");
const { connectDB, sequelize } = require("../config/db");
const {v4: uuid4} = require("uuid");

const request = require('supertest');
const express = require('express');

const userLoginRouter = require('../controllers/userLoginController');

// Connect to test database
beforeAll(async () => {
    await connectDB();
});

// Clean up database after each test
afterEach(async () => {
    await User.destroy({ where: {} });
});

// Close database connection after all tests
afterAll(async () => {
    await sequelize.close();
});

const app = express();
app.use(express.json());
app.use('/api', userLoginRouter);

describe('User Login Routes', () => {
  
  describe('POST /api/login', () => {




    
    it('should reject empty usernames/passwords', async () => {

      const noPayload = {}
      const emptyResponse = await request(app)
        .post("/api/login")
        .send(noPayload)
        .expect(400)
      
      expect(emptyResponse.body.errors).toBeDefined()
      expect(emptyResponse.body.errors.length).toBeGreaterThan(0)

      const emptyNamePayload = { name: "", password: "asdasdasd" }
      const emptyNameResponse = await request(app)
        .post("/api/login")
        .send(emptyNamePayload)
        .expect(400)
      
      expect(emptyNameResponse.body.errors).toBeDefined()
      expect(emptyNameResponse.body.errors.some(error => error.msg === "Name is required")).toBe(true)

      // Test empty password
      const emptyPasswordPayload = { name: "testuser", password: "" }
      const emptyPasswordResponse = await request(app)
        .post("/api/login")
        .send(emptyPasswordPayload)
        .expect(400)
      
      expect(emptyPasswordResponse.body.errors).toBeDefined()
      expect(emptyPasswordResponse.body.errors.some(error => error.msg === "Password is required")).toBe(true)
    });






    
    it('should validate name length constraints for login', async () => {
      // Test name too short (less than 3 characters)
      const shortNamePayload = { name: "ab", password: "asdasdasd" }
      const shortNameResponse = await request(app)
        .post("/api/login")
        .send(shortNamePayload)
        .expect(400)
      
      expect(shortNameResponse.body.errors).toBeDefined()
      expect(shortNameResponse.body.errors.some(error => 
        error.msg === "Name must be between 3 and 50 characters long"
      )).toBe(true)

      // Test name too long (more than 50 characters)
      const longName = "a".repeat(51)
      const longNamePayload = { name: longName, password: "asdasdasd" }
      const longNameResponse = await request(app)
        .post("/api/login")
        .send(longNamePayload)
        .expect(400)
      
      expect(longNameResponse.body.errors).toBeDefined()
      expect(longNameResponse.body.errors.some(error => 
        error.msg === "Name must be between 3 and 50 characters long"
      )).toBe(true)
    });






    
    it('should validate password length constraints for login', async () => {
      // Test password too short (less than 6 characters)
      const shortPasswordPayload = { name: "testuser", password: "12345" }
      const shortPasswordResponse = await request(app)
        .post("/api/login")
        .send(shortPasswordPayload)
        .expect(400)
      
      expect(shortPasswordResponse.body.errors).toBeDefined()
      expect(shortPasswordResponse.body.errors.some(error => 
        error.msg === "Password must be at least 6 characters long"
      )).toBe(true)
    });






    it('should return 404 for non-existent user', async () => {
      
      const uniqueUsername = `testuser_${Date.now()}`

      const credentials = {name: uniqueUsername, password: "password123"}

      const response = await request(app)
        .post("/api/login")
        .send(invalidCredentials)
        .expect(401)
      
      expect(response.body.message).toBe("Invalid username or password")
    });


    
    
    it('should authenticate valid user', async () => {
      const testUser = {name: "testuser", email:"test@example.com", password:"password123"} 
      await createTestUser(testUser.name, testUser.email, testUser.password)

      const response = await request(app)
        .post("/api/login")
        .send({ name: testUser.name, password: testUser.password })
        .expect(200)
      
      expect(response.body.token).toBeDefined()
      expect(response.body.user).toBeDefined()
      expect(response.body.user.name).toBe(testUser.name)
      expect(response.body.user.email).toBe(testUser.email)
      expect(response.body.user.userId).toBeDefined()

      await deleteTestUser(testUser.name)
    });
  });

  describe('POST /api/register', () => {
    it('should validate required fields for registration', async () => {
      const noPayload = {}
      const response = await request(app)
        .post('/api/register')
        .send(noPayload)
        .expect(400)
      
      expect(response.body.errors).toBeDefined()
      expect(response.body.errors.length).toBeGreaterThan(0)
    });

    it('should validate name length constraints for registration', async () => {
      const shortNamePayload = { name: "ab", email: "test@example.com", password: "password123" }
      const response = await request(app)
        .post('/api/register')
        .send(shortNamePayload)
        .expect(400)
      
      expect(response.body.errors).toBeDefined()
      expect(response.body.errors.some(error => 
        error.msg === "Name must be between 3 and 50 characters long"
      )).toBe(true)
    });

    it('should validate email format', async () => {
      const invalidEmailPayload = { name: "testuser", email: "invalid-email", password: "password123" }
      const response = await request(app)
        .post('/api/register')
        .send(invalidEmailPayload)
        .expect(400)
      
      expect(response.body.errors).toBeDefined()
      expect(response.body.errors.some(error => 
        error.msg === "Please provide a valid email address"
      )).toBe(true)
    });

    it('should validate password length for registration', async () => {
      const shortPasswordPayload = { name: "testuser", email: "test@example.com", password: "12345" }
      const response = await request(app)
        .post('/api/register')
        .send(shortPasswordPayload)
        .expect(400)
      
      expect(response.body.errors).toBeDefined()
      expect(response.body.errors.some(error => 
        error.msg === "Password must be at least 6 characters long"
      )).toBe(true)
    });

    it('should return 409 for existing user', async () => { 
      const testUser = {name: "test", email:"test@example.com", password:"password123"} 
      await createTestUser(testUser.name, testUser.email, testUser.password)

      const response = await request(app)
        .post('/api/register')
        .send(testUser)
        .expect(409)

      expect(response.body.message).toBe("User already exists")

      await deleteTestUser(testUser.name)
    }); 

    it('should create new user successfully', async () => {
      const uniqueUsername = `testuser_${uuid4()}`
      const uniqueEmail = `test_${uuid4()}@example.com`
      
      const newUser = {
        name: uniqueUsername,
        email: uniqueEmail,
        password: "password123"
      }

      const response = await request(app)
        .post('/api/register')
        .send(newUser)
        .expect(200)

      expect(response.body.message).toBe("Success!")

      // Verify user was actually created in database
      const createdUser = await findUser(uniqueUsername)
      expect(createdUser).toBeDefined()
      expect(createdUser.name).toBe(uniqueUsername)
      expect(createdUser.email).toBe(uniqueEmail)
      expect(createdUser.password).toBeDefined()
      expect(createdUser.user_id).toBeDefined()

      // Clean up
      await deleteTestUser(uniqueUsername)
    });
  });
});

const createTestUser = async(user_name, email, password) => {
  const user = await User.findOne({ where: { name: user_name } })

  if (user) {
    console.log('User already exists')
    return
  }

  const bcrypt = require("bcrypt")
  const hash = await bcrypt.hash(password, 11)

  const newId = uuid4()

  await User.create({
    name: user_name,
    email: email,
    password: hash,
    user_id: newId
  })

  return true
}

const deleteTestUser = async(user_name) => {
  try {
    const deletedUser = await User.destroy({ where: { name: user_name } })

    if (deletedUser) {
      console.log('User deleted: ' + user_name)
      return true
    } else {
      console.log('User not found')
    }
  } catch (err) {
    throw err
  }
}

const findUser = async(user_name) => {
  try {
    const user = await User.findOne({ where: { name: user_name } })
    return user
  } catch (err) {
    console.error('Error finding user:', err)
    throw err
  }
}