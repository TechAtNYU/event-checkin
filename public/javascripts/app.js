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
		var todaysDate = new Date();
		var eventDate = moment().format(data["events"]["startDateTime"]);
		if(!moment(eventDate).isSame(moment(), 'day')){
			$('#no-event-happening').html('<p>No event happening today!</p>');
			$('#no-event-happening').show();
		} else {
			window.location.replace(document.URL+data["events"]["id"]);
		}
	});
}

function Get10NextEvents() {
	$.getJSON("https://api.tnyu.org/v1.0/events", function(data) {
		
	});
}

function GetUpcomingEvents() {
	$.getJSON("https://api.tnyu.org/v1.0/events", function(data) {
		
	});
}

CheckLogin(function(data) {
	$('#login').html('<a href="">Edit Profile</a>');
}, function(){
	$('#login').html('<a href="https://api.tnyu.org/v1.0/auth/twitter">Login</a>');
});

GetNextEvent();