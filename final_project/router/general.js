const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Task 6: Register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  const userExists = users.some(user => user.username === username);
  if (userExists) {
    return res.status(409).json({ message: "Username already exists!" });
  }

  users.push({ "username": username, "password": password });
  return res.status(201).json({ message: "User successfully registered. Now you can login" });
});

// Task 10: Get the list of books available in the shop using Async-Await
public_users.get('/', async function (req, res) {
  try {
    const getBooks = async () => {
      return books;
    };
    const allBooks = await getBooks();
    return res.status(200).send(JSON.stringify(allBooks, null, 4));
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving books" });
  }
});

// Task 11: Get book details based on ISBN using Promises
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  
  const findByIsbn = new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject({ status: 404, message: "Book not found" });
    }
  });

  findByIsbn
    .then((book) => res.status(200).json(book))
    .catch((err) => res.status(err.status).json({ message: err.message }));
});
  
// Task 12: Get book details based on author using Async-Await
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author.toLowerCase();
  try {
    const getBooksByAuthor = async () => {
      let filteredBooks = {};
      Object.keys(books).forEach((key) => {
        if (books[key].author.toLowerCase() === author) {
          filteredBooks[key] = books[key];
        }
      });
      return filteredBooks;
    };
    
    const matchingBooks = await getBooksByAuthor();
    if (Object.keys(matchingBooks).length > 0) {
      return res.status(200).json(matchingBooks);
    } else {
      return res.status(404).json({ message: "Author not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error processing request" });
  }
});

// Task 13: Get all books based on title using Async-Await
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title.toLowerCase();
  try {
    const getBooksByTitle = async () => {
      let filteredBooks = {};
      Object.keys(books).forEach((key) => {
        if (books[key].title.toLowerCase() === title) {
          filteredBooks[key] = books[key];
        }
      });
      return filteredBooks;
    };

    const matchingBooks = await getBooksByTitle();
    if (Object.keys(matchingBooks).length > 0) {
      return res.status(200).json(matchingBooks);
    } else {
      return res.status(404).json({ message: "Title not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error processing request" });
  }
});

// Task 5: Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).json(books[isbn].reviews);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;