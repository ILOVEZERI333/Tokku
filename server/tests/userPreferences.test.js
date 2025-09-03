const User = require("../models/user");
const UserPreference = require("../models/userPreference");
const Category = require("../models/category");
const { connectDB, sequelize } = require("../config/db");
const {v4: uuid4} = require("uuid");

const request = require('supertest');
const express = require('express');

const userPreferencesRouter = require('../controllers/userPreferencesController');

// Connect to test database
beforeAll(async () => {
    await connectDB();
    // Import associations after database connection
    require("../models/associations");
});

// Clean up database after each test
afterEach(async () => {
    await UserPreference.destroy({ where: {} });
    await User.destroy({ where: {} });
});

// Close database connection after all tests
afterAll(async () => {
    await sequelize.close();
});

const app = express();
app.use(express.json());
app.use('/api', userPreferencesRouter);

describe('User Preferences Routes', () => {
  
  describe('POST /api/preferences', () => {
    it('should validate required fields', async () => {
      const noPayload = {}
      const response = await request(app)
        .post("/api/preferences")
        .send(noPayload)
        .expect(400)
      
      expect(response.body.errors).toBeDefined()
      expect(response.body.errors.length).toBeGreaterThan(0)
    });

    it('should create new preference', async () => {
    
      const testUser = await createTestUser();
      
      const preferenceData = {
        user_id: testUser.id,
        category: "romance",
        level: 3
      }

      const response = await request(app)
        .post("/api/preferences")
        .send(preferenceData)
        .expect(201)

      expect(response.body.category).toBe("romance")
      expect(response.body.level).toBe(3)
    });

    it('should return 409 for duplicate preference', async () => {
      const testUser = await createTestUser();
      
      const preferenceData = {
        user_id: testUser.id,
        category: "romance",
        level: 3
      }

      // Create first preference
      await request(app)
        .post("/api/preferences")
        .send(preferenceData)
        .expect(201)

      // Try to create duplicate
      const response = await request(app)
        .post("/api/preferences")
        .send(preferenceData)
        .expect(409)

      expect(response.body.message).toBe("Preference already exists for this user and category")
    });
  });

  describe('GET /api/preferences/:userId', () => {
    it('should return user preferences', async () => {
      const testUser = await createTestUser();
      
      // Create some preferences
      await request(app)
        .post("/api/preferences")
        .send({
          user_id: testUser.id,
          category: "romance",
          level: 3
        });

      await request(app)
        .post("/api/preferences")
        .send({
          user_id: testUser.id,
          category: "action",
          level: 5
        });

      const response = await request(app)
        .get(`/api/preferences/${testUser.id}`)
        .expect(200)

      expect(response.body.UserPreferences).toBeDefined()
      expect(response.body.UserPreferences.length).toBe(2)
    });

    it('should return 404 for non-existent user', async () => {
      const fakeUserId = 999999;
      
      const response = await request(app)
        .get(`/api/preferences/${fakeUserId}`)
        .expect(404)

      expect(response.body.message).toBe("User not found")
    });
  });

  describe('PUT /api/preferences/:userId/:category', () => {
    it('should update existing preference', async () => {
      const testUser = await createTestUser();
      
      await request(app)
        .post("/api/preferences")
        .send({
          user_id: testUser.id,
          category: "romance",
          level: 3
        });

      const updateData = {
        level: 5
      }

      const response = await request(app)
        .put(`/api/preferences/${testUser.id}/romance`)
        .send(updateData)
        .expect(200)

      expect(response.body.level).toBe(5)
    });

    it('should return 404 for non-existent preference', async () => {
      const testUser = await createTestUser();
      
      const response = await request(app)
        .put(`/api/preferences/${testUser.id}/nonexistent`)
        .send({ level: 5 })
        .expect(404)

      expect(response.body.message).toBe("Category not found")
    });
  });

  describe('DELETE /api/preferences/:userId/:category', () => {
    it('should delete preference', async () => {
      const testUser = await createTestUser();
      
      await request(app)
        .post("/api/preferences")
        .send({
          user_id: testUser.id,
          category: "romance",
          level: 3
        });

      const response = await request(app)
        .delete(`/api/preferences/${testUser.id}/romance`)
        .expect(200)

      expect(response.body.message).toBe("Preference deleted successfully")
    });

    it('should return 404 for non-existent preference', async () => {
      const testUser = await createTestUser();
      
      const response = await request(app)
        .delete(`/api/preferences/${testUser.id}/nonexistent`)
        .expect(404)

      expect(response.body.message).toBe("Category not found")
    });
  });
});

const createTestUser = async() => {
  const bcrypt = require("bcrypt")
  const hash = await bcrypt.hash("password123", 11)

  const user = await User.create({
    user_name: `testuser_${uuid4()}`,
    email: `test_${uuid4()}@example.com`,
    password: hash
  })

  return user
}
