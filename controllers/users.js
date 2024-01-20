const usersRouter = require('express').Router()
const User = require('../models/user')
const bcrypt = require('bcrypt')

usersRouter.get('/', async (request, response) => {
  const users = await User.find({})
  response.json(users)
})

usersRouter.post('/', async (request, response, next) => {
  try {
    const { body } = request

    if (!body.username || !body.password) {
      return response.status(400).json('incomplete data')
    }

    if (body.password.length < 3) {
      return response
        .status(400)
        .json({ error: 'the password must contain more than 2 characters' })
    }

    const findUser = await User.find({ username: body.username })

    if (findUser.length) {
      return response.status(409).json({ error: 'user already exists' })
    }
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(body.password, saltRounds)

    const user = new User({
      username: body.username,
      name: body.name,
      passwordHash
    })
    const savedUser = await user.save()
    response.json(savedUser)
  } catch (error) {
    next(error)
  }
})

module.exports = usersRouter
