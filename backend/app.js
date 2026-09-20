var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var cidadaosRouter = require('./routes/Cidadaos');
var denunciasRouter = require('./routes/Denuncias');
var gestaoRouter = require('./routes/Gestao');
var authRouter = require('./routes/Auth');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.json({ status: 'ok', servico: 'Urbaniza+ API' });
});

app.use('/login', authRouter);
app.use('/Cidadaos', cidadaosRouter);
app.use('/Denuncias', denunciasRouter);
app.use('/Gestao', gestaoRouter);

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message,
    stack: req.app.get('env') === 'development' ? err.stack : undefined,
  });
});

module.exports = app;
