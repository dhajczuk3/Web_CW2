const express = require('express');
const session = require('express-session');
const app = express();
require('dotenv').config();

const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.use(express.urlencoded({
    extended: true
}));

// Use session middleware
app.use(session({
    secret: process.env.SESSION_SECRET, // Set a secret string for session encryption
    resave: false,
    saveUninitialized: true
}));



const path = require('path');
const public = path.join(__dirname, 'public');
app.use(express.static(public));

app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));

const mustache = require('mustache-express');
app.engine('mustache', mustache());
app.set('view engine', 'mustache');

const stockRoutes = require('./routes/stockRoutes');
const userRoutes = require('./routes/userRoutes');
const infoRoutes = require('./routes/infoRoutes');

app.use(stockRoutes);
app.use(userRoutes);
app.use(infoRoutes);

app.listen(process.env.PORT || 3000, () => {
    console.log('Server started. Ctrl^c to quit.');
});

// Error handling for unmatched routes and server errors
app.use(function(req, res) {
  res.status(404);
  res.type('text/plain');
  res.send('404 Not found.');
});

app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500);
  res.type('text/plain');
  res.send('Internal Server Error.');
});
