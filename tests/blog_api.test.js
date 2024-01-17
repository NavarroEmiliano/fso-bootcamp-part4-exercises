const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')

beforeEach(async () => {
  await Blog.deleteMany({})
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

  console.log(response.body[0])

  expect(response.body[0].id).toBeDefined()
})

test('a valid blog can be added', async () => {
  const newBlog = {
    title: 'Title Test',
    author: 'Author Test',
    url: 'Url Test',
    likes: 10
  }
  await api
    .post('/api/blogs')
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

  const response = await api.post('/api/blogs').send(newBlog)
  expect(response.body.likes).toBe(0)
})

test('blog without title or url cant be added', async () => {
  const newBlog = {
    author: 'Without likes test',
    likes: 2
  }

  await api.post('/api/blogs').send(newBlog).expect(400)

  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
})

test('a blog can be deleted through its id', async () => {
  const blogsAtStart = await helper.blogsInDb()
  const blogToDelete = blogsAtStart[blogsAtStart.length - 1].id
  await api.delete(`/api/blogs/${blogToDelete}`).expect(204)

  const response = await api.get('/api/blogs')
  expect(response.body).toHaveLength(helper.initialBlogs.length - 1)
})

test('a blog can be updated through its id', async () => {
  const allBlogs = await helper.blogsInDb()
  const blogToUpdate = allBlogs[0]

  blogToUpdate.likes = 100

  await api.put(`/api/blogs/${blogToUpdate.id}`).send(blogToUpdate)

  const allBlogs2 = await helper.blogsInDb()
  expect(allBlogs2[0].likes).toBe(100)
})

afterAll(() => {
  mongoose.connection.close()
})
