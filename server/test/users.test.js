import request from 'supertest'
import crypto from 'node:crypto'
const api = `http://localhost:3000`

let userId = 0
const getRandomText = (len) => {
  return crypto.randomBytes(len).toString('hex')
}

const generateRandomUser = () => {
  const randomText = getRandomText(5)
  return {
    username: 'test'+randomText,
    password: 'test',
    name: 'TEST NAME',
    email: `test${randomText}@test.com`
  }
}

const postUser = generateRandomUser()

describe('POST /users', () => {
  it('should return 201 with user id and username', async () => {
    // get last id
    const res = await request(api)
      .get('/users')
      .expect(200)

    const lastId = res.body
      .map(e => e.id)
      .sort((a, b) => b - a)[0] + 1

    await request(api)
      .post('/users')
      .send(postUser)
      .expect(201, {
        id: lastId,
        username: postUser.username
      })

    userId = lastId + 1

    // add an extra user for next tests
    await request(api)
      .post('/users')
      .send(generateRandomUser())
      .expect(201)
  })

  it('should return 409 (user already exists)', (done) => {
    request(api)
      .post('/users')
      .send(postUser)
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
    const updateUser = generateRandomUser()
    updateUser.id = userId
    const res = await request(api)
      .put(`/users/${userId}`)
      .send(updateUser)
      .expect(200)

    delete updateUser.password
    expect(res.body).toEqual(updateUser)
  })

  it('should return 409 after trying to update a user with data of other user', async () => {
    await request(api)
      .put(`/users/${userId}`)
      .send(postUser)
      .expect(409, {
        detail: 'This username already exists'
      })
  })
})

describe('PATCH  /users/:id', () => {
  it('should return 200 with the updated user data', async () => {
    const patchRand = getRandomText(5)
    await request(api)
      .patch(`/users/${userId}`)
      .send({ username: patchRand })
      .expect(200,{ username: patchRand })

    await request(api)
      .patch(`/users/${userId}`)
      .send({ email: `email${patchRand}@test.com` })
      .expect(200,{ email: `email${patchRand}@test.com` })
  })

  it('should return 409 (username update)', async () => {
    await request(api)
      .patch(`/users/${userId}`)
      .send({
        username: postUser.username // user created in POST test
      })
      .expect(409,{
        detail: 'This username already exists'
      })
  })

  // Check if users are allowed to have same email
  it.skip('should return 409 (email update)', async () => {
    await request(api)
      .patch(`/users/${userId}`)
      .send({
        email: postUser.email // user created in POST test
      })
      .expect(409,{
        detail: 'Email already in use by another user'
      })
  })
})

describe('DELETE /users/:id', () => {
  it.skip('should return 204 and deactivate the user', async () => {
    // check if user is active
    const resTrue = await request(api)
      .get(`/users/${userId}`)
      .expect(200)

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
