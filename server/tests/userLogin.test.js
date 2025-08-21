const User = require("../models/user");
const connectDB = require("../config/db");
const {v4: uuid4} = require("uuid");

const request = require('supertest');
const express = require('express');

const userLoginRouter = require('../controllers/userLoginController');



connectDB()

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
        error.msg === "Password must be between 6 and 128 characters long"
      )).toBe(true)

      // Test password too long (more than 128 characters)
      const longPassword = "a".repeat(129)
      const longPasswordPayload = { name: "testuser", password: longPassword }
      const longPasswordResponse = await request(app)
        .post("/api/login")
        .send(longPasswordPayload)
        .expect(400)
      
      expect(longPasswordResponse.body.errors).toBeDefined()
      expect(longPasswordResponse.body.errors.some(error => 
        error.msg === "Password must be between 6 and 128 characters long"
      )).toBe(true)
    });






    it('should return 404 for non-existent user', async () => {
      
      const uniqueUsername = `testuser_${Date.now()}`

      const credentials = {name: uniqueUsername, password: "password123"}

      const response = await request(app)
      .post("/api/login")
      .send(credentials)
      .expect(404)


      expect(response.body.message).toBe("Invalid username or password")

      await deleteTestUser(uniqueUsername)

    });







    it('should return 404 for invalid password', async () => {

      const testUser = {name:'testUser', email: "testUserEmail@gmail.com", password:'testPassword'}

      await createTestUser(testUser.name, testUser.email, testUser.password)

      const response = await request(app)
      .post('/api/login')
      .send({name: testUser.name, password: 'wrong_password'})
      .expect(404)

      expect(response.body.message).toBe("Invalid username or password")

      await deleteTestUser(testUser.name)

    });






    it('should return JWT token for valid credentials', async () => {

      const user = {name: "test", email:"test@gmail.com", password:"password123"}

      await createTestUser(user.name, user.email, user.password)

      const response = await request(app)
      .post('/api/login')
      .send({name: user.name, password: user.password})
      .expect(200)



      expect(response.body).toHaveProperty('token')
      expect(response.body.token).toBeDefined()
      expect(typeof response.body.token).toBe('string')
      expect(response.body.token.length).toBeGreaterThan(0)


      await deleteTestUser(user.name)

    });
  });

  describe('POST /api/register', () => {
    it('should validate required fields', async () => {

      const emptyPayload = {}
      const emptyResponse = await request(app)
        .post("/api/register")
        .send(emptyPayload)
        .expect(400)
      
      expect(emptyResponse.body.errors).toBeDefined()
      expect(emptyResponse.body.errors.length).toBeGreaterThan(0)

      // Test empty name
      const emptyNamePayload = { name: "", email: "test@example.com", password: "password123" }
      const emptyNameResponse = await request(app)
        .post("/api/register")
        .send(emptyNamePayload)
        .expect(400)
      
      expect(emptyNameResponse.body.errors).toBeDefined()
      expect(emptyNameResponse.body.errors.some(error => error.msg === "Name is required")).toBe(true)

      // Test empty password
      const emptyPasswordPayload = { name: "testuser", email: "test@example.com", password: "" }
      const emptyPasswordResponse = await request(app)
        .post("/api/register")
        .send(emptyPasswordPayload)
        .expect(400)
      
      expect(emptyPasswordResponse.body.errors).toBeDefined()
      expect(emptyPasswordResponse.body.errors.some(error => error.msg === "Password is required")).toBe(true)

      // Test empty email
      const emptyEmailPayload = { name: "testuser", email: "", password: "password123" }
      const emptyEmailResponse = await request(app)
        .post("/api/register")
        .send(emptyEmailPayload)
        .expect(400)
      
      expect(emptyEmailResponse.body.errors).toBeDefined()
    });

    it('should validate name length constraints', async () => {
      // Test name too short (less than 3 characters)
      const shortNamePayload = { name: "ab", email: "test@example.com", password: "password123" }
      const shortNameResponse = await request(app)
        .post("/api/register")
        .send(shortNamePayload)
        .expect(400)
      
      expect(shortNameResponse.body.errors).toBeDefined()
      expect(shortNameResponse.body.errors.some(error => 
        error.msg === "Name must be between 3 and 50 characters long"
      )).toBe(true)

      // Test name too long (more than 50 characters)
      const longName = "a".repeat(51)
      const longNamePayload = { name: longName, email: "test@example.com", password: "password123" }
      const longNameResponse = await request(app)
        .post("/api/register")
        .send(longNamePayload)
        .expect(400)
      
      expect(longNameResponse.body.errors).toBeDefined()
      expect(longNameResponse.body.errors.some(error => 
        error.msg === "Name must be between 3 and 50 characters long"
      )).toBe(true)
    });

    it('should validate password length constraints', async () => {
      // Test password too short (less than 6 characters)
      const shortPasswordPayload = { name: "testuser", email: "test@example.com", password: "12345" }
      const shortPasswordResponse = await request(app)
        .post("/api/register")
        .send(shortPasswordPayload)
        .expect(400)
      
      expect(shortPasswordResponse.body.errors).toBeDefined()
      expect(shortPasswordResponse.body.errors.some(error => 
        error.msg === "Password must be between 6 and 128 characters long"
      )).toBe(true)

      // Test password too long (more than 128 characters)
      const longPassword = "a".repeat(129)
      const longPasswordPayload = { name: "testuser", email: "test@example.com", password: longPassword }
      const longPasswordResponse = await request(app)
        .post("/api/register")
        .send(longPasswordPayload)
        .expect(400)
      
      expect(longPasswordResponse.body.errors).toBeDefined()
      expect(longPasswordResponse.body.errors.some(error => 
        error.msg === "Password must be between 6 and 128 characters long"
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
      expect(createdUser.userId).toBeDefined()

      // Clean up
      await deleteTestUser(uniqueUsername)
    });
  });
});


const createTestUser = async(user_name, email, password) => {
  const user = await User.findOne({name: user_name})

  if (user) {console.log('User already exists')}

  const bcrypt = require("bcrypt")
  const hash = await bcrypt.hash(password, 11)

  const newId = uuid4()

  const newUser = new User({
    name: user_name,
    email: email,
    password: hash,
    userId: newId
  })

  await newUser.save()

  return true
}

const deleteTestUser = async(user_name) => {

  try{
  const deletedUser = await User.findOneAndDelete({name: user_name}).exec()

    if (deletedUser) {
      console.log('User deleted: ' + deletedUser)
      return true
    }
    else {
      console.log('User not found')
    }
  } catch (err) {
    throw err
  }

 

}

const findUser = async(user_name) => {
  try {
    const user = await User.findOne({name: user_name}).exec()
    return user
  } catch (err) {
    console.error('Error finding user:', err)
    throw err
  }
}