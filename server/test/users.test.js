const request = require('supertest')
const api = `http://localhost:3000`
const crypto = require('node:crypto')

const getRandomText = (length) => crypto.randomBytes(length).toString('hex')
const userTest = {
  username: 'test'+getRandomText(5),
  password: 'test',
  name: 'TEST NAME',
  email: 'test@test.com'
}
let userId = 0

describe('POST /users', () => {
  it('should return 201 with user id and username', async () => {
    // get last id
    const res = await request(api)
      .get('/users')
      .expect(200)
    const lastId = res.body
      .map(e => e.id)
      .sort((a, b) => b - a)[0]
    

    await request(api)
      .post('/users')
      .send(userTest)
      .expect(201, {
        id: lastId + 1,
        username: userTest.username
      })
    userId = lastId + 1
  })

  it('should return 409 (user already exists)', (done) => {
    request(api)
      .post('/users')
      .send(userTest)
      .expect(409, {
        detail: 'This username already exists'
      }, done)
  })
})

describe('GET  /users', () => {
  it('should return 200 with an array of users', async () => {
    const res = await request(api)
      .get('/users')
      .expect(200)

    expect(Array.isArray(res.body)).toBe(true)
    res.body.forEach((obj) => {
      expect(obj).toHaveProperty('id')
      expect(obj.id).toEqual(expect.any(Number))

      expect(obj).toHaveProperty('active')
      expect(obj.active).toEqual(expect.any(Boolean))

      expect(obj).toHaveProperty('username')
      expect(obj.username).toEqual(expect.any(String))

      expect(obj).toHaveProperty('name')
      // expect(obj.name).toEqual(expect.any(String))

      expect(obj).toHaveProperty('email')
      expect(obj.email).toEqual(expect.any(String))
    })
  })
})

describe('GET  /users/:id', () => {
  it('should return 200 with a user', async () => {
    const res = await request(api)
      .get(`/users/${userId}`)
      .expect(200)

    expect(res.body.id).toEqual(userId)
    expect(res.body.active).toEqual(expect.any(Boolean))
    expect(res.body.username).toEqual(expect.any(String))
    expect(res.body.name).toEqual(expect.any(String))
    expect(res.body.email).toEqual(expect.any(String))
  })
})

describe('PUT  /users/:id', () => {
  it('should return 200 with the updated user data', async () => {
    const userUpdate = {
      id: userId,
      username: 'test'+getRandomText(5),
      password: 'userupdated',
      name: 'NAME UPDATED',
      email: `updated${getRandomText(5)}@test.com`
    }
    const res = await request(api)
      .put(`/users/${userId}`)
      .send(userUpdate)
      .expect(200)

    delete userUpdate.password
    expect(res.body).toEqual(userUpdate)
  })
  
  it('should return 409 after trying to update a user with data of other user', async () => {
    const newUser = {
      username: 'test'+getRandomText(5),
      password: 'newusertest',
      name: 'NEW USER TEST',
      email: 'newtest@test.com'
    }
    // creates a new user
    await request(api)
      .post('/users')
      .send(newUser)
      .expect(201)

    await request(api)
      .put(`/users/${userId}`)
      .send(newUser)
      .expect(409, {
        detail: 'This username already exists'
      })
  })
})

describe('PATCH  /users/:id', () => {
})

describe('DELETE /users/:id', () => {
  it.skip('should return 204 and deactivate the user', async () => {
    // check if user is active
    const resTrue = await request(api)
      .get(`/users/${userId}`)
      .expect(200)

    // expect(resTrue.body.active).toEqual(userId)
    expect(resTrue.body.active).toEqual(true)

    await request(api)
      .delete(`/users/${userId}`)
      .expect(204)

    const resFalse = await request(api)
      .get(`/users/${userId}`)
      .expect(200)

    expect(resFalse.body.active).toEqual(false)
  })
})
