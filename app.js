var express     = require('express')
  , path        = require('path')
  , favicon     = require('serve-favicon')
  , logger      = require('morgan')
  , bodyParser  = require('body-parser')
  , debug       = require('debug')('signin')
  , router      = require('express-simple-router')
  , checkinController = require('./controllers/checkin');

var app = express(), port = process.env.PORT || 3000;

// config
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('port', port);
app.set('host', (app.get('env') === 'development' ? 'lvh.me:'+ port : 'checkin.techatnyu.org'));

//static stuff
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

//router
var checkinRouter = router(require('./config/routes.json'), app.get('host'));
app.use(checkinRouter.handle({'Checkin': checkinController}));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

app.listen(app.get('port'), function() {
  debug('Express server listening on port ' + port);
});