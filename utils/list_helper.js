const dummy = blogs => {
  return 1
}

const totalLikes = blogs => {
  const onlyLikes = blogs.map(blog => blog.likes)
  return blogs.length === 0 ? 0 : onlyLikes.reduce((acc, cur) => acc + cur, 0)
}

const favoriteBlog = blogs => {
  let mostLikes = blogs[0]

  for (let i = 0; i < blogs.length; i++) {
    if (blogs[i].likes >= mostLikes.likes) {
      mostLikes = blogs[i]
    }
  }
  return {
    title: mostLikes.title,
    author: mostLikes.author,
    likes: mostLikes.likes
  }
}

const mostBlogs = blogs => {
  const counter = {}

  blogs.forEach(blog => {
    counter[blog.author] = (counter[blog.author] || 0) + 1
  })

  let mostBlogsAuthor
  let maxNumber = -Infinity

  for (const author in counter) {
    const actualNumber = counter[author]

    if (actualNumber > maxNumber) {
      mostBlogsAuthor = author
      maxNumber = actualNumber
    }
  }
  return {
    author: mostBlogsAuthor,
    blogs: maxNumber
  }
}

const mostLikes = blogs => {
  const counter = {}

  blogs.forEach(blog => {
    counter[blog.author] = (counter[blog.author] || 0) + blog.likes
  })

  let mostLikesAuthor
  let maxNumber = -Infinity

  for (const author in counter) {
    const actualNumber = counter[author]

    if (actualNumber > maxNumber) {
      mostLikesAuthor = author
      maxNumber = actualNumber
    }
  }
  return {
    author: mostLikesAuthor,
    likes: maxNumber
  }
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}
