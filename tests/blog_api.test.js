const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')

beforeEach(async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})
  const newUser = {
    username: 'BlogUser',
    name: 'Blog Name',
    password: 'BlogPassword'
  }
  await api.post('/api/users').send(newUser)
  const blogObjects = helper.initialBlogs.map(blog => new Blog(blog))
  const promiseArray = blogObjects.map(blog => blog.save())
  await Promise.all(promiseArray)
})

test('notes are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('all blogs are returned correctly', async () => {
  const response = await api.get('/api/blogs')

  expect(response.body).toHaveLength(helper.initialBlogs.length)
})

test('the unique identifier is called id', async () => {
  const response = await api.get('/api/blogs')

  expect(response.body[0].id).toBeDefined()
})

test('a valid blog can be added', async () => {
  const newBlog = {
    title: 'Title Test',
    author: 'Author Test',
    url: 'Url Test',
    likes: 10
  }
  const userLogin = {
    username: 'BlogUser',
    password: 'BlogPassword'
  }
  const response = await api.post('/api/login').send(userLogin)
  const token = response.body.token
  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

  const titles = blogsAtEnd.map(b => b.title)
  expect(titles).toContain('Title Test')
})

test('blog without likes saves the value as 0', async () => {
  const newBlog = {
    title: 'Without likes test',
    author: 'Without likes test',
    url: 'Without likes test'
  }
  const userLogin = {
    username: 'BlogUser',
    password: 'BlogPassword'
  }
  const responseUser = await api.post('/api/login').send(userLogin)
  const token = responseUser.body.token

  const response = await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
  expect(response.body.likes).toBe(0)
})

test('blog without title or url cant be added', async () => {
  const newBlog = {
    author: 'Without likes test',
    likes: 2
  }
  const userLogin = {
    username: 'BlogUser',
    password: 'BlogPassword'
  }
  const responseUser = await api.post('/api/login').send(userLogin)
  const token = responseUser.body.token

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(400)

  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
})

test('a blog can be deleted through its id', async () => {
  const newBlog = {
    title: 'Deleted',
    author: 'Deleted',
    url: 'Deleted',
    likes: 2
  }
  const userLogin = {
    username: 'BlogUser',
    password: 'BlogPassword'
  }
  const responseUser = await api.post('/api/login').send(userLogin)
  const token = responseUser.body.token
  const responseNewBlog = await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

  await api
    .delete(`/api/blogs/${responseNewBlog.body.id}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(204)

  const response = await api.get('/api/blogs')
  expect(response.body).toHaveLength(helper.initialBlogs.length)
})

test('a blog can be updated through its id', async () => {
  const newBlog = {
    title: 'Updated',
    author: 'Updated',
    url: 'Updated',
    likes: 2
  }
  const userLogin = {
    username: 'BlogUser',
    password: 'BlogPassword'
  }
  const responseUser = await api.post('/api/login').send(userLogin)
  const token = responseUser.body.token

  const responseNewBlog = await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  responseNewBlog.body.likes = 100

  const apiResponse = await api
    .put(`/api/blogs/${responseNewBlog.body.id}`)
    .set('Authorization', `Bearer ${token}`)
    .send(responseNewBlog.body)
  expect(apiResponse.body.likes).toBe(100)
})

test('a block without token cannot be added', async () => {
  const newBlog = {
    title: 'Without token',
    author: 'Without token',
    url: 'Without token',
    likes: 10
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(401)
    .expect('Content-Type', /application\/json/)
})

afterAll(() => {
  mongoose.connection.close()
})
