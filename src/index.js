const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

let users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  if (!user) {
    return response.status(404).json({
      "error": "user not found"
    })
  }

  request.user = user;
  return next();
}

function checkExistsTodo(request, response, next){
  const { id } = request.params;
  const { user } = request;

  let todo = user.todos.find(todo => todo.id === id);

  if (!todo) {
    return response.status(404).json({
      error: 'TODO not found'
    })
  }
  
  request.todo = todo;
  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  if (users.some(user => user.username === username)) {
    return response.status(400).json({
      "error": "user already exists"
    })
  }

  const user = {
    id: uuidv4(), // precisa ser um uuid
    name: name,
    username: username,
    todos: []
  }

  users.push(user);
  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  const todos = user.todos;

  return response.json(todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const todo = {
    id: uuidv4(), // precisa ser um uuid
    title,
    done: false,
    deadline: new Date(deadline).toISOString(),
    created_at: new Date()
  }

  user.todos.push(todo);

  return response.status(201).json(todo)
});

app.put('/todos/:id', checksExistsUserAccount, checkExistsTodo, (request, response) => {
  const { title, deadline } = request.body;
  const { todo } = request;

  todo.title = title;
  todo.deadline = new Date(deadline).toISOString();

  return response.status(201).json(todo);

});

app.patch('/todos/:id/done', checksExistsUserAccount, checkExistsTodo, (request, response) => {
  const { todo } = request;

  todo.done = true;

  return response.status(201).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, checkExistsTodo, (request, response) => {
  const { todo, user } = request;
  const { id } = request.params;

  user.todos = user.todos.filter( todo => todo.id !== id);

  return response.status(204).send();

});

module.exports = app;