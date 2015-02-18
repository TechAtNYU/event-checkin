var express = require('express');
var router = express.Router();
var request = require('request');

/* GET home page. */
router.post('/', function(req, res) {
	console.log(req.body.userid);
	request({
		url: "https://api.tnyu.org/v1.0/events/"+req.body.currentEvent,
		method: "POST",
		json: true,
		body: myJSONObject
	}, function (error, response, body){
		console.log(response);
	});
	res.end('{"success" : "Updated Successfully", "status" : 200}');
});

module.exports = router;