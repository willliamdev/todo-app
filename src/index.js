const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid')


const app = express();

app.use(cors());
app.use(express.json());

const users = [];

// Mieddleware

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers
  const user = users.find(user => user.username === username)

  if (!user) {
    return response.status(400).json({ error: 'User not found!' })
  }
  request.user = user

  return next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  const userAlreadyExists = users.some((user) => user.username === username)

  if (userAlreadyExists) {
    return response.status(400).json({ error: 'User already exists!' })
  }

  const user = {
    id: uuidv4(),
    name: name,
    username: username,
    todos: []
  }

  users.push(user)

  return response.status(201).json(user)


});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request
  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { title, deadline } = request.body

  const todo = {
    id: uuidv4(),
    title: title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo)

  return response.status(201).json(todo)

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.query
  const { title, deadline } = request.body

  const todos = user.todos.map((todo) => {
    if (todo.id === id) {
      todo.title = title
      todo.deadline = new Date(deadline)
    }
    return todo

  });
  // const todo = user.todos.find((todo) => todo.id === id)

  user.todos = todos
  return response.send()

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.query

  const todos = user.todos.map((todo) => {
    if (todo.id === id) {
      todo.done = true
    }
    return todo
  })

  user.todos = todos

  return response.send()
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  // Complete aqui
});



// extra routes =========

app.get("/users", (resquest, response) => {
  return response.json(users)
})

module.exports = app;