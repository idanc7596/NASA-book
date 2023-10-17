const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');

// load the routes
const loginRouter = require('./routes/login');
const usersRouter = require('./routes/users');
const feedRouter = require('./routes/feed');
const apiRouter = require('./routes/api');
const userSessionRouter = require('./routes/userSession');

//load error controller
const errorController = require('./controllers/error');
//load middleware authenticator
const auth = require('./middlewares/auth');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// enable session
app.use(session({
    secret:"somesecretkey",
    resave: false, // Force save of session for each request
    saveUninitialized: false, // Save a session that is new, but has not been modified
    cookie: {maxAge: 10*60*1000 } // milliseconds!
}));


app.use('/userSession', userSessionRouter);
app.use('/api', auth.disconnected);
app.use('/api', apiRouter);
app.use('/feed', auth.notLoggedIn);
app.use('/feed', feedRouter);
app.use('/users', auth.loggedIn);
app.use('/users', usersRouter);
app.use('/', auth.loggedIn);
app.use('/', loginRouter);

// error handling
app.use(errorController.get404);

module.exports = app;
