const request = require('supertest');
const app = 'http://localhost:3000'

const TEST_USERNAME = 'tester'
const TEST_PASSWORD = 'fP44qr'

describe('POST /signup - When a user/password is sent(Must be a new user)', () => {
  // // First, check if the user 'test' already exists
  it.skip('responds with redirect to / after signup', async () => {
    const r = await request(app)
      .post('/signup')
      .send({
        username: TEST_USERNAME,
        password: TEST_PASSWORD
      })
    expect(r.statusCode).toEqual(302);
    expect(r.text).toEqual('Found. Redirecting to /');
  });

  it('responds with 400 (payload check))', async () => {
    const r = await request(app)
      .post('/signup')
      .send({
        ascxzss: 'test',
        reywrqw: 'test'
      })
    expect(r.statusCode).toEqual(400);
    expect(r.body.detail).toEqual('Bad Request');
  });

  it('responds with 400 (user length check)', async () => {
    const r = await request(app)
      .post('/signup')
      .send({
        username: 'tes', // invalid user length
        password: 'test'
      })
    expect(r.statusCode).toEqual(400);
    expect(r.body.detail).toEqual('Invalid username. Please try again.');
  });

  it('responds with 400 (password length check)', async () => {
    const r = await request(app)
      .post('/signup')
      .send({
        username: 'aaaa',
        password: 'test'  // invalid password length
      })
    expect(r.statusCode).toEqual(400);
    expect(r.body.detail).toEqual('Password must be longer than 6 characters.');
  });
});

describe('POST /login', () => {
  it('responds with 401 (wrong user)', async () => {
    const r = await request(app)
      .post('/login')
      .send({
        username: 'tdfd',
        password: 'maslfuw'
      })
      expect(r.statusCode).toEqual(401);
      expect(r.body.title).toEqual('Authentication failed')
      expect(r.body.detail).toEqual('Incorrect username or password')
  });

  it('responds with 200', async () => {
    const r = await request(app)
      .post('/login')
      .send({
        username: TEST_USERNAME,
        password: TEST_PASSWORD
      })
    try {
      expect(r.statusCode).toEqual(200);
    } catch (err) {
      err.message = err.message+ '\n\nCHECK USER/PASSWORD'
      throw err
    }
  });
});

describe('POST /logout', () => {
  it('should redirect to /login', async () => {
    const r = await request(app)
      .post('/logout')
    expect(r.statusCode).toEqual(302);
    expect(r.redirect).toEqual(true);
    expect(r.header.location).toEqual("/login");
  });
})

describe('GET /is-authenticated', () => {
  it('should redirect to /login (unauthorized user)', async () => {
    const r = await request(app)
      .get('/is-authenticated')
    expect(r.statusCode).toBe(302)
    expect(r.redirect).toEqual(true)
    expect(r.header.location).toEqual("/login")
  });

  it('responds with 200 (user logged)', async () => {
    const loggedAgent = request.agent(app)
    const a = await loggedAgent.post('/login')
      .send({
        username: TEST_USERNAME,
        password: TEST_PASSWORD
      })
    try {
      expect(a.statusCode).toEqual(200);
      // expect(a.redirect).toEqual(true);
      // expect(a.header.location).toEqual("/");
  
      const b = await loggedAgent.get('/is-authenticated')
      expect(b.statusCode).toBe(200)
      expect(b.body.message).toEqual("protected");
    } catch (err) {
      err.message = err.message+ '\n\nCHECK USER/PASSWORD'
      throw err
    }
  });
});

describe('Authentication', () => {
  it('should allow and deny acess of a user', async () => {
    // Check if is authenticated
    const r = await request(app)
      .get('/is-authenticated')
    expect(r.statusCode).toBe(302)
    expect(r.redirect).toEqual(true)
    expect(r.header.location).toEqual("/login")

    // Log in
    const loggedAgent = request.agent(app)
    const a = await loggedAgent.post('/login')
      .send({
        username: TEST_USERNAME,
        password: TEST_PASSWORD
      })
    try {
      expect(a.statusCode).toEqual(200);
      // expect(a.redirect).toEqual(true);
      // expect(a.header.location).toEqual("/");
    } catch (err) {
      err.message = err.message+ '\n\nCHECK USER/PASSWORD'
      throw err
    }

    // Check user auth permission
    const b = await loggedAgent.get('/is-authenticated')
    expect(b.statusCode).toBe(200)
    expect(b.body.message).toEqual("protected");

    // log out
    const c = await loggedAgent.post('/logout')
    expect(c.statusCode).toEqual(302);
    expect(c.redirect).toEqual(true);
    expect(c.header.location).toEqual("/login");

    const d = await loggedAgent.get('/is-authenticated')
    expect(d.statusCode).toBe(302)
    expect(d.redirect).toEqual(true)
    expect(d.header.location).toEqual("/login")
  });
})

