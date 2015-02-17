function CheckLogin(success, failed) {
	$.getJSON("https://api.tnyu.org/v1.0/people/me", function(data) {
		return success(data);
	})
	.fail(function() { 
		return failed();
	});
}

function GetNextEvent() {
	$.getJSON("https://api.tnyu.org/v1.0/events/upcoming", function(data) {
		return data;
	});
}

function Get10NextEvents() {
	$.getJSON("https://api.tnyu.org/v1.0/events", function(data) {
		return data;
	});
}

CheckLogin(function(data) {
	$('#login').html('<a href="">Edit Profile</a>');
}, function(){
	$('#login').html('<a href="https://api.tnyu.org/v1.0/auth/twitter">Login</a>');
});
