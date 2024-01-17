const { mostLikes } = require('../utils/list_helper')
const helper = require('./test_helper')

describe('most likes', () => {
  test('must find the author with the most likes', () => {
    const result = mostLikes(helper.initialBlogs)

    expect(result).toEqual({ author: 'Edsger W. Dijkstra', likes: 17 })
  })
})
