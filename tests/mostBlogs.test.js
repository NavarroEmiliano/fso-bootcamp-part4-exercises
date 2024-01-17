const { mostBlogs } = require('../utils/list_helper')
const helper = require('./test_helper')

describe('most blogs', () => {
  test('must find the author with the most blogs', () => {
    const result = mostBlogs(helper.initialBlogs)

    expect(result).toEqual({ author: 'Robert C. Martin', blogs: 3 })
  })
})
