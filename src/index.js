const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

 const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find( (user) => user.username == username);

  if(!user) {
    return response.status(404).json({ error: "user not exists"});
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userCreate = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  const userAlreadyExists = users.some(user => user.username === username)

  if(userAlreadyExists) {
    return response.status(400).json({error: "user already exists!"});
  }

  users.push(userCreate);

  return response.status(201).json(userCreate);

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const todoCreate = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todoCreate);

  return response.status(201).json(todoCreate)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const todo = user.todos.some((todo) => todo.id === id);

  if(!todo){
    response.status(404).json({error: "id not found"})
  }

  user.todos.forEach(todo => {
    if(todo.id === id) {
      todo.title = title;
      todo.deadline = new Date(deadline);
      return response.json(todo);
    }    
  });


});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.some((todo) => todo.id === id);

  if(!todo){
    response.status(404).json({error: "id not found"})
  }

  user.todos.forEach(todo => {
    if(todo.id === id) {
      todo.done = true;
      return response.json(todo);
    } 
  });

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find((todo) => todo.id === id);

  if(!todo){
    response.status(404).json({error: "id not found"})
  }

  user.todos.splice(todo, 1);

  return response.status(204).send()

});

module.exports = app;