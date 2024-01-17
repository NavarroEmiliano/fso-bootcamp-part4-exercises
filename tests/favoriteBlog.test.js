const { favoriteBlog } = require('../utils/list_helper')
const helper = require('./test_helper')

describe('favorite', () => {
  test('must find the blog with the most likes', () => {
    const result = favoriteBlog(helper.initialBlogs)

    expect(result).toEqual({
      title: 'Canonical string reduction',
      author: 'Edsger W. Dijkstra',
      likes: 12
    })
  })
})
