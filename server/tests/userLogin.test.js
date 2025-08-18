import User from "../models/user";
import connectDB from "../models/user"
import {v4 as uuid4} from "uuid"

const request = require('supertest');
const express = require('express');

const userLoginRouter = require('../controllers/userLogin');



connectDB()

const app = express();
app.use(express.json());
app.use('/api', userLoginRouter);

describe('User Login Routes', () => {
  
  describe('POST /api/login', () => {
    it('should reject empty usernames/passwords', async () => {
      const noPayload = {}


      await request(app)
      .post("/api/login")
      .send(noPayload)
      .expect(400)
      .expect(res => {
        expect(res.body.error).toBeDefined()
      })

    });

    it('should return 404 for non-existent user', async () => {
      
      const uniqueUsername = `testuser_${Date.now()}`

      const credentials = {name: uniqueUsername, password: "n"}

      const response = await request(app)
      .post("/api/login")
      .send(credentials)
      .expect(404)


      expect(response.body.error).toBe("Invalid username or password")

      await deleteTestUser(uniqueUsername)

    });

    it('should return 404 for invalid password', async () => {

      const testUser = {name:'testUser', email: "testUserEmail@gmail.com", password:'testPassword'}

      createTestUser(testUser)

      const response = await request(app)
      .post('/api/login')
      .send({name: testUser.name, password: 'wrong_password'})
      .expect(404)

      expect(response.body.error).toBe("Invalid username or password")

      deleteTestUser(testUser.name)

    });

    it('should return JWT token for valid credentials', async () => {

      const user = {name: "test", email:"test@gmail.com", password:"asd"}

      createTestUser(user)

      const response = await request(app)
      .post('/api/login')
      .send({name: user.name, password: user.password})
      .expect(200)


      expect(response.body).toHaveProperty('token')
      expect(response.body.token).toBeDefined()
      expect(typeof response.body.token).toBe('string')
      expect(response.body.token.length).toBeGreaterThan(0)

    });
  });

  describe('POST /api/register', () => {
    it('should validate required fields', async () => {

    });

    it('should return 409 for existing user', async () => {

    });

    it('should create new user successfully', async () => {

    });
  });
});


const createTestUser = async(user_name, email, password) => {
  const user = await User.findOne({name: user_name})

  if (user) {console.log('User already exists')}


  const newId = uuid4()

  const newUser = new User({
    name: user_name,
    email: email,
    password: password,
    user_id: newId
  })

  newUser.save()

  return True
}

const deleteTestUser = async(user_name) => {
  const user = await User.findOneAndDelete({name: user_name}).exec()
  .then(deletedUser => {
    if (deletedUser) {
      console.log('User deleted: ' + deletedUser)
      return True
    }
    else {
      console.log('User not found')
    }
  })
  .catch(err => {throw err})

}