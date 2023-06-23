require('dotenv').config();
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
const { Response } = require('./lib/http-status-codes.js');

// Global variables
global.mongoose = require('mongoose');
global.FUNC = require('./lib/functions.js');
global.validation = require('./lib/rules.js');
global.flash = require('connect-flash');
global._ = require('lodash');
global.fs = require('fs');
global.moment = require('moment');
global.session = require('express-session');
global.async = require('async');
global.expressFileupload = require('express-fileupload');

const MongoStore = require('connect-mongo')(session);

var app = express();
app.use(expressFileupload());

/** To disable console log form env */
if (process.env.SERVER_ENV == 'development') {
  mongoose.set('debug', true);
} else {
  mongoose.set('debug', true);
}

// Db Connection
mongoose
  .connect(
    'mongodb://admin:09HaitCut091121NowYG@3.128.137.19:27024/barber-app?authSource=admin',
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    }
  )
  .then(() => {
    console.log('Connected to DB');
  })
  .catch((err) => {
    console.log('Error connecting to DB', err);
  });

// Session
app.use(
  session({
    cookie: {
      maxAge: 60000000,
    },
    resave: false,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET,
    store: new MongoStore({
      mongooseConnection: mongoose.connection,
    }),
  })
);

app.use((req, res, next) => {
  console.log('res:: ', res);
  for (const method in Response) {
    if (Response.hasOwnProperty(method)) res[method] = Response[method];
  }
  next();
});

//routes
const authRouter = require('./routes/AuthController');
const userRouter = require('./routes/UserController');
const uploadRouter = require('./routes/UploadController');
const settingRouter = require('./routes/SettingController');
const pageRouter = require('./routes/PageController');
const pageBarberRouter = require('./routes/BarberPageController');
const barberRouter = require('./routes/BarberController');
const bookingRouter = require('./routes/BookingController');
const ReportRouter = require('./routes/ReportController');
const PaymentRouter = require('./routes/PaymentController');
const requestRouter = require('./routes/RequestController');

// view engine setup
const engine = require('ejs-mate');
app.engine('ejs', engine);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(flash());
app.use(function (req, res, next) {
  const current_url = req.originalUrl;
  const url_actions = current_url.split('/');
  res.locals.url_actions = current_url.split('/');
  res.locals.site_url = process.env.SITE_URL;
  res.locals.site_title = process.env.SITE_TITLE;
  res.locals.error_flash = req.flash('error')[0];
  res.locals.page_title = '';
  res.locals.success_flash = req.flash('success')[0];
  res.locals.controller = url_actions[0];
  res.locals.action = url_actions[1];
  res.locals.urlParams = url_actions[2];
  res.locals.currentUser = req.session.user || {};
  res.locals.currentYear = new Date().getFullYear();
  res.locals.dashboard = process.env.SITE_URL;
  res.locals.appName = process.env.SITE_TITLE;
  res.locals.logo = `${process.env.S3_URL}${process.env.SITE_LOGO}`;
  res.locals.appLang = ['en'];

  global.DM = require('./locale/en/message').Messages;
  return next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', authRouter);
app.use('/user', userRouter);
app.use('/setting', settingRouter);
app.use('/upload', uploadRouter);
app.use('/content', pageRouter);
app.use('/barber', barberRouter);
app.use('/pageBarber', pageBarberRouter);
app.use('/booking', bookingRouter);
app.use('/report', ReportRouter);
app.use('/report', ReportRouter);
app.use('/payment', PaymentRouter);
app.use('/request', requestRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  // next(createError(404));
  res.render('page_not_found');
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
