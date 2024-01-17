const { totalLikes } = require('../utils/list_helper')
const helper = require('./test_helper')

describe('total likes', () => {
  const listWithOneBlog = [
    {
      _id: '65a20b911851978233f8d832',
      title: 'Funcionando',
      author: 'Funcionando',
      url: 'Funcionando',
      likes: 3,
      __v: 0
    }
  ]

  test('of empty list is zero', () => {
    const arr = []

    expect(totalLikes(arr)).toBe(0)
  })

  test('when list has only one blog equals the likes of that', () => {
    const result = totalLikes(listWithOneBlog)

    expect(result).toBe(3)
  })

  test('of a bigger list is calculated right', () => {
    const result = totalLikes(helper.initialBlogs)

    expect(result).toBe(36)
  })
})
