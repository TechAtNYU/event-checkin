var express = require('express');
var router = express.Router();
var request = require('request');

/* GET home page. */
router.post('/', function(req, res) {
	console.log(req.body.userid);

	res.end('{"success" : "Updated Successfully", "status" : 200}');
});

module.exports = router;