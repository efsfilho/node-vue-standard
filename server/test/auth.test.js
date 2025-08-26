import request from 'supertest'
import crypto from 'node:crypto'
const api = `http://localhost:3000`

const getRandomText = (len) => {
  return crypto.randomBytes(len).toString('hex')
}

const generateRandomUser = () => {
  const randomText = getRandomText(3)
  return {
    username: 'test'+randomText,
    password: 'test'+randomText,
    name: 'TEST NAME',
    email: `test${randomText}@test.com`
  }
}

describe('POST /signup - When a user/password is sent(Must be a new user)', () => {
  it('responds with redirect to / after signup', async () => {
    const user = generateRandomUser()
    const res = await request(api)
      .post('/signup')
      .send(user)
    expect(res.statusCode).toEqual(302)
    expect(res.text).toEqual('Found. Redirecting to /')
  });

  it('responds with 400 (payload check))', async () => {
    await request(api)
      .post('/signup')
      .send({
        ascxzss: 'test',
        reywrqw: 'test'
      })
      .expect(400, {
        detail: 'Bad Request'
      })
  });

  it('responds with 400 (user length check)', async () => {
    const user = generateRandomUser()
    user.username = getRandomText(3).slice(0,3)
    await request(api)
      .post('/signup')
      .send({
        username: user.username, // invalid user length
        password: user.password,
        email: user.email
      })
      .expect(400, {
        detail: 'Invalid username. Please try again.'
      })
  });

  it('responds with 400 (password length check)', async () => {
    await request(api)
      .post('/signup')
      .send({
        username: 'aaaa',
        password: 'test'  // invalid password length
      })
      .expect(400, {
        detail: 'Password must be longer than 6 characters.'
      })
  });
});

describe('POST /login', () => {
  it('responds with 401 (wrong user/pass)', async () => {
    await request(api)
      .post('/login')
      .send({
        username: 'tdfd',
        password: 'maslfuw'
      })
      .expect(401, {
        title: 'Authentication failed',
        detail: 'Incorrect username or password'
      })
  });

  it('responds with 200', async () => {
    const user = generateRandomUser()
    const res = await request(api)
      .post('/signup')
      .send(user)
    expect(res.statusCode).toEqual(302)
    expect(res.text).toEqual('Found. Redirecting to /')

    await request(api)
      .post('/login')
      .send({
        username: user.username,
        password: user.password
      })
      .expect(200)
  });
});

describe('POST /logout', () => {
  it('should redirect to /login', async () => {
    const res = await request(api)
      .post('/logout')
    expect(res.statusCode).toEqual(302);
    expect(res.redirect).toEqual(true);
    expect(res.header.location).toEqual("/login");
  });
})

describe('GET /is-authenticated', () => {
  it('should redirect to /login (unauthorized user)', async () => {
    const res = await request(api)
      .get('/is-authenticated')
    expect(res.statusCode).toBe(302)
    expect(res.redirect).toEqual(true)
    expect(res.header.location).toEqual("/login")
  });

  it('responds with 200 (user logged)', async () => {
    const user = generateRandomUser()
    // create a new user
    await request(api)
      .post('/signup')
      .send(user)
      .expect(302)

    const loggedAgent = request.agent(api)
    await loggedAgent
      .post('/login')
      .send(user)
      .expect(200)
  
    await loggedAgent
      .get('/is-authenticated')
      .expect(200, {
        message: 'protected'
      })
  });
});

describe('Authentication', () => {
  it('should allow and deny acess of a user', async () => {
    // Step -1 Check if is authenticated
    const step1 = await request(api)
      .get('/is-authenticated')
    expect(step1.statusCode).toBe(302)
    expect(step1.redirect).toEqual(true)
    expect(step1.header.location).toEqual("/login")

    const loggedAgent = request.agent(api)
    
    const user = generateRandomUser()
    // create a new user
    await request(api)
      .post('/signup')
      .send(user)
      .expect(302)

    // Step 2 - Log in
    await loggedAgent
      .post('/login')
      .send(user)
      .expect(200);

    // Step 3 - Check user auth permission
    await loggedAgent
      .get('/is-authenticated')
      .expect(200, {
        message: 'protected'
      })

    // Step 4 - Log out
    const step4 = await loggedAgent.post('/logout')
    expect(step4.statusCode).toEqual(302);
    expect(step4.redirect).toEqual(true);
    expect(step4.header.location).toEqual("/login");

    // Step 5 - Check unauthorized
    const step5 = await loggedAgent.get('/is-authenticated')
    expect(step5.statusCode).toBe(302)
    expect(step5.redirect).toEqual(true)
    expect(step5.header.location).toEqual("/login")
  });
})

