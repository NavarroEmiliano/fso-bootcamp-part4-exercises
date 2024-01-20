const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const User = require('../models/user')

beforeEach(async () => {
  await User.deleteMany({})
  const newUser = {
    username: 'FirstUser',
    name: 'First User',
    password: 'TestPassword'
  }
  const user = new User(newUser)
  await user.save()
})

describe('user creation', () => {
  test('a user with correct fields is created successfully', async () => {
    const newUser = {
      username: 'TestUser',
      name: 'Test Name',
      password: 'TestPassword'
    }
    const usersAtStart = await helper.usersInDb()
    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()

    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)
  })

  test('a user without username should not be created', async () => {
    const newUser = {
      name: 'Test Name',
      password: 'TestPassword'
    }
    const usersAtStart = await helper.usersInDb()
    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body).toBe('incomplete data')

    const usersAtEnd = await helper.usersInDb()

    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test('a user without password should not be created', async () => {
    const newUser = {
      username: 'Test Name',
      name: 'Test Name'
    }
    const usersAtStart = await helper.usersInDb()
    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body).toBe('incomplete data')

    const usersAtEnd = await helper.usersInDb()

    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test('if a username is less than 3 characters it should not be created', async () => {
    const newUser = {
      username: 'Te',
      name: 'Test Name',
      password: 'PasswordTest'
    }
    const usersAtStart = await helper.usersInDb()
    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('User validation failed')

    console.log(result.body.error)

    const usersAtEnd = await helper.usersInDb()

    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test('if a password is less than 3 characters it should not be created', async () => {
    const newUser = {
      username: 'Test Name',
      name: 'Test Name',
      password: 'Pa'
    }
    const usersAtStart = await helper.usersInDb()
    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toBe(
      'the password must contain more than 2 characters'
    )

    const usersAtEnd = await helper.usersInDb()

    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test('if a username already exists, it should not be created', async () => {
    const newUser = {
      username: 'FirstUser',
      name: 'First User',
      password: 'TestPassword'
    }
    const usersAtStart = await helper.usersInDb()
    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(409)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toBe('user already exists')

    const usersAtEnd = await helper.usersInDb()

    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })
})

afterAll(() => {
  mongoose.connection.close()
})
