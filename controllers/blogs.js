const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
  const { title, author, url, likes } = request.body
  if (!title || !url) {
    return response.status(400).json({ error: 'incomplete properties' })
  }
  const allUsers = await User.find({})
  const index = Math.floor(Math.random() * allUsers.length)
  const userFound = allUsers[index]
  const blog = new Blog({
    title,
    author,
    url,
    likes,
    user: userFound._id
  })

  const savedBlog = await blog.save()
  userFound.blogs = userFound.blogs.concat(savedBlog._id)
  await userFound.save()
  response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', async (request, response) => {
  await Blog.findByIdAndDelete(request.params.id)
  response.status(204).end()
})

blogsRouter.put('/:id', async (request, response, next) => {
  const body = request.body

  const blog = {
    itle: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes
  }

  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, {
    new: true
  })

  response.json(updatedBlog)
})

module.exports = blogsRouter
