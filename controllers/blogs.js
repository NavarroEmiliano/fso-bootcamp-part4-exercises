const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
  const { title, author, url, likes } = request.body
  const userToken = request.user

  if (!userToken || !userToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  if (!title || !url) {
    return response.status(400).json({ error: 'incomplete properties' })
  }

  const user = await User.findById(userToken.id)
  if (!user) {
    return response.status(404).json({ error: 'User not found' })
  }

  const blog = new Blog({
    title,
    author,
    url,
    likes,
    user: user._id
  })

  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()
  response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', async (request, response) => {
  const blogFound = await Blog.findById(request.params.id)
  const user = request.user
  if (!blogFound) {
    return response.status(404).json({ error: 'the blog does not exist' })
  }
  if (user.id !== blogFound.user.toString()) {
    return response
      .status(401)
      .json({ error: 'this user cannot delete this blog' })
  }
  await Blog.findByIdAndDelete(request.params.id)
  response.status(204).end()
})

blogsRouter.put('/:id', async (request, response, next) => {
  const body = request.body
  const user = request.user

  const blogFound = await Blog.findById(request.params.id)
  if (!blogFound) {
    return response.status(404).json({ error: 'the blog does not exist' })
  }
  if (user.id !== blogFound.user.toString()) {
    return response
      .status(401)
      .json({ error: 'this user cannot update this blog' })
  }
  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes
  }

  const updatedBlog = await Blog.findByIdAndUpdate(blogFound.id, blog, {
    new: true
  })

  response.json(updatedBlog)
})

module.exports = blogsRouter
