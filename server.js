require('dotenv').config();
const express = require('express');
const path = require('path');
const createError = require('http-errors');
const logger = require('morgan');
const cors = require('cors');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const db = require('./configurations/db');

const userRoute = require('./routes/userRoute');
const companyRoute = require('./routes/companyRoute');
const companyTransactionRoute = require('./routes/companyTransactionRoute');
const pcRoute = require('./routes/pcRoute');
const pcTransactionRoute = require('./routes/pcTransactionRoute');
const dispatcherRoute = require('./routes/dispatcherRoute');
const dispatcherTransactionRoute = require('./routes/dispatcherTransactionRoute');

//initialize express
const app = express();

//default port
const port = process.env.PORT || 8000;

//middlewares
app.use(cors());
app.use(cookieParser());
app.use(logger('dev'));

if (process.env.NODE_ENV !== 'production') {
  app.use(
    session({
      saveUninitialized: false,
      resave: true,
      secret: process.env.SESSION_SECRET,
    })
  );
}

//form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//statics
app.use('/images', express.static(path.join(__dirname, '/images')));
app.use(express.static(path.join(__dirname, 'public')));

//routes
app.use('/user', userRoute);
app.use('/company', companyRoute);
app.use('/companyTransaction', companyTransactionRoute);
app.use('/pc', pcRoute);
app.use('/pcTransaction', pcTransactionRoute);
app.use('/dispatcher', dispatcherRoute);
app.use('/dispatcherTransaction', dispatcherTransactionRoute);

if (process.env.NODE_ENV === 'production') {
  app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
}

//error handlers
app.use((req, res, next) => {
  next(createError.NotFound());
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  // res.send({
  //   message: err.message,
  // });
  if (process.env.NODE_ENV === 'production') {
    res.json('An error has occured.Try again later');
  } else {
    res.send({
      error: {
        status: err.status || 500,
        message: err.message,
      },
    });
  }
});

db.then(() => {
  app.listen(port, () => console.log(`App listening on port ${port}!`));
}).catch((error) => console.log(error));
