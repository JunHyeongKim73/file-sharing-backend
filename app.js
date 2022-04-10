var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var usersRouter = require('./routes/user/users');
var customersRouter = require('./routes/user/customers');
var sellersRouter = require('./routes/user/sellers');
var authRouter = require('./routes/auth/auth');
var fileRouter = require('./routes/file/files');
var fileCategoryRouter = require('./routes/file/file-categories');
var purchaseRouter = require('./routes/purchase/purchases');
var reviewRouter = require('./routes/review/reviews');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/users', usersRouter);
app.use('/customers', customersRouter);
app.use('/sellers', sellersRouter);
app.use('/auth', authRouter);
app.use('/files', fileRouter);
app.use('/files', reviewRouter);
app.use('/file-categories', fileCategoryRouter);
app.use('/purchases', purchaseRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  const data = {};
  // set locals, only providing error in development
  data['success'] = false;
  data['message'] = err.message;
  data['error'] = req.app.get('env') === 'development' ? err : {};
  // 오류 메세지를 응답으로 보낸다
  res.status(err.status || 500).json(data);
});

module.exports = app;
