const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and Password are required." });
  }

  const userExists = users.find((user) => user.username === username);

  if (userExists) {
    return res.status(409).json({ erroe: "Username already exists. Please choose another name." });
  }

  users.push({ username, password });

  return res.status(201).json({
    message: "User registered successfully!",
    user: { username }
  })
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {

  new Promise((resolve, reject) => {
    if (books)
       resolve(books);
    else 
      reject("No books found");
  })

    .then(data => res.send(JSON.stringify(data, null, 4)))

    .catch(err => res.status(500).json({ message: err }));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {

  const isbn = req.params.isbn;

  let book = books[isbn];

  return res.send(book);

});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {

  const author = decodeURIComponent(req.params.author).toLowerCase();

  let book = Object.values(books).filter(b => b.author.toLowerCase() === author);

  if (book)
    res.send(book);

  return res.status(404).json({ error: "No book is given by this author." })

});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {

  const title = decodeURIComponent(req.params.title).toLowerCase();

  let book = Object.values(books).filter(b => b.title.toLowerCase() === title);

  if (book)
    res.send(book);

  return res.status(404).json({ error: "No book exists with this title." })

});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {

  const isbn = req.params.isbn;

  let review = books[isbn].reviews;

  res.send(review);

});

module.exports.general = public_users;
