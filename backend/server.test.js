// Import testing utilities
const request = require('supertest');
const app = require('./server');

// ---- Mocks ----
// We tell Jest to replace the entire db.js module with a fake version.
// This prevents any real database calls from being made during tests.
jest.mock('./db/db', () => ({
  // Mock the initializeDatabase function to do nothing but resolve successfully
  initializeDatabase: jest.fn().mockResolvedValue(true),
  // Mock the pool object
  pool: {
    getConnection: jest.fn().mockResolvedValue({
      query: jest.fn().mockResolvedValue([[]]), // Mock a successful, empty query
      release: jest.fn(),
    }),
  },
}));

/*
  NOTE: When you implement the real AI logic in your /api/design route,
  you will also need to mock the '@google/generative-ai' library here
  to avoid making actual API calls during tests. For example:

  jest.mock('@google/generative-ai', () => ({ ... }));
*/


// ---- Test Suite ----
describe('API Endpoints', () => {

  // Test suite for the /api/design endpoint
  describe('POST /api/design', () => {

    // Test case: A valid request should succeed
    it('should return a 200 OK status and a mock response body', async () => {
      const testData = {
        prompt: 'a chic, futuristic bodysuit',
        sessionId: 'test-session-id-12345'
      };

      // Use supertest to send a POST request to our app
      const response = await request(app)
        .post('/api/design')
        .send(testData);

      // Assertions
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('design_output');
      expect(response.body.design_output).toContain(testData.prompt);
    });

    // Test case: A request missing a prompt should still be handled
    it('should return a 200 OK status even if the prompt is missing', async () => {
        const testData = {
            sessionId: 'test-session-id-67890'
        };

        const response = await request(app)
            .post('/api/design')
            .send(testData);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('design_output');
    });
  });

  // Test suite for the frontend handler
  describe('GET /', () => {
    it('should return the main HTML file', async () => {
        const response = await request(app).get('/');
        expect(response.statusCode).toBe(200);
        expect(response.headers['content-type']).toMatch(/html/);
    });
  });

});
