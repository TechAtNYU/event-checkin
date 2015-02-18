var express = require('express');
var router = express.Router();
var csrf = require('csurf');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { });
});

module.exports = router;