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
    return response.status(404).json({ error: 'User not found!' })
  }
  request.user = user

  return next()
}


function checksIfTodoExists(request, response, next) {
  const { id } = request.params
  const { user } = request

  const todo = user.todos.find(todo => todo.id === id)

  if (!todo) {
    return response.status(404).json({ error: 'Todo not found!' })
  }
  request.id = id

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

app.put('/todos/:id', checksExistsUserAccount, checksIfTodoExists, (request, response) => {
  const { user, id } = request
  const { title, deadline } = request.body

  const todo = user.todos.find(todo => todo.id === id)
  todo.title = title
  todo.deadline = new Date(deadline)
  return response.json(todo)

});

app.patch('/todos/:id/done', checksExistsUserAccount, checksIfTodoExists, (request, response) => {
  const { user, id } = request
  const todo = user.todos.find(todo => todo.id === id)
  todo.done = true
  return response.json(todo)
});



app.delete('/todos/:id', checksExistsUserAccount, checksIfTodoExists, (request, response) => {

  const { user, id } = request

  const todoIndex = user.todos.findIndex((todo) => {
    return todo.id === id
  })
  const indexNotFound = todoIndex === - 1

  if (indexNotFound) {
    return response.status(404).json({ error: "Todo not Found" })
  }

  user.todos.splice(todoIndex, 1)

  return response.status(204).send()
});


module.exports = app;