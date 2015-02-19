var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/checkin', function(req, res) {
  request({
    url: "https://api.tnyu.org/v1.0/events/"+req.body.currentEvent+"/attendees",
    method: "POST",
    json: true,
    "rejectUnauthorized": false,
    "headers":{
      "x-api-key": "E]PzXKhhH5PVBvSmKlKqSZXt$li5J4SjS't"
    },
    body: {
      "id": req.body.userid
    }
  }, function (error, response, body){
    console.log(error);
    if(!error){
      res.end('{"success" : "Updated Successfully", "status" : 200}');
    } else {
      res.end('{"failure" : "'+error+'", "status" : 400}');
    }
  });
});
app.use('/([A-Za-z0-9]+)?', function(req, res) {
  res.render('index');
});

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

module.exports = app;