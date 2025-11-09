const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => { //returns boolean
  return users.some((user) => user.username === username);
}

const authenticatedUser = (username, password) => { //returns boolean
  const user = users.find((user) => user.username === username && user.password === password);
  return user !== undefined;
}

//only registered users can login
regd_users.post("/login", (req, res) => {

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and Password are required." });
  }

  if (!isValid(username)) {
    return res.status(403).json({ error: "Invalid username. User not found." });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(403).json({ error: "Invalid Password." });
  }

  let accessToken = jwt.sign(
    { username: username },
    "access",
    { expiresIn: 60 }
  );

  req.session.authorization = {
    accessToken,
    username
  };

  return res.status(200).json({
    message: "User successfully logged in!",
    token: accessToken
  });


});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {

  const review = req.query.review;
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;

  if (!review) {
    return res.status(400).json({ message: "Review text is required." });
  }

  if (!isbn) {
    return res.status(400).json({ message: "ISBN is required." });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found." });
  }

  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }

  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: "Review added/updated successfully!",
    reviews: books[isbn].reviews
  });

});

regd_users.delete("/auth/review/:isbn", (req, res) => {

  const isbn = req.params.isbn;
  const username = req.session.authorization.username;

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found." });
  }

  if (!books[isbn].reviews) {
    return res.status(404).json({ message: "No reviews found for this book." });
  }

  if (!books[isbn].reviews[username]) {
    return res.status(403).json({ message: "You have not posted any review for this book." });
  }

  // ✅ Delete the user's review only
  delete books[isbn].reviews[username];

  return res.status(200).json({
    message: "Your review has been deleted successfully.",
    reviews: books[isbn].reviews
  });
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
