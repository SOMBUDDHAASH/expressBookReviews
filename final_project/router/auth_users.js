const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  // Returns true if username is valid and not already taken in our system array
  return username && !users.some(user => user.username === username);
}

const authenticatedUser = (username, password) => {
  // Returns true if username and password match our local memory records exactly
  return users.some(user => user.username === username && user.password === password);
}

// Task 7: Only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Validate that both parameters exist in the request body
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Verify against registration records
  if (authenticatedUser(username, password)) {
    // Generate an access token signed with our 'access' secret, valid for 1 hour
    let accessToken = jwt.sign({ data: username }, "access", { expiresIn: 60 * 60 });
    
    // Save the token and username into the current session object container
    req.session.authorization = {
      accessToken, username
    };
    
    return res.status(200).send("User successfully logged in");
  } else {
    return res.status(401).json({ message: "Invalid Login credentials" });
  }
});

// Task 8: Add or Modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const reviewText = req.query.review; // Pulls review payload via query parameters (?review=...)
  const username = req.user.data;      // Decoded and attached dynamically by our index.js middleware

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book with this ISBN not found" });
  }

  if (!reviewText) {
    return res.status(400).json({ message: "Review text cannot be empty" });
  }

  // Maps review context distinctly under the individual user's username key string
  // If the key already exists, JavaScript overwrites it (handles modifications automatically)
  books[isbn].reviews[username] = reviewText;
  
  return res.status(200).json({ 
    message: `The review for the book with ISBN ${isbn} has been successfully added/updated.`,
    reviews: books[isbn].reviews 
  });
});

// Task 9: Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.user.data; // Pulled from verified JWT session signature

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book with this ISBN not found" });
  }

  // Check if a review posted by this specific session user exists
  if (books[isbn].reviews[username]) {
    delete books[isbn].reviews[username];
    return res.status(200).json({ 
      message: `Reviews for ISBN ${isbn} posted by user [${username}] have been successfully deleted.` 
    });
  } else {
    return res.status(404).json({ message: "No review found under your username to delete." });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;