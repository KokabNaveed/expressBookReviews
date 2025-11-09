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
  //Write your code here
  return res.status(300).json({ message: "Yet to be implemented" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
