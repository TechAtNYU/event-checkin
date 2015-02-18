function CheckLogin(success, failed) {
	$.getJSON("https://api.tnyu.org/v1.0/people/me", function(data) {
		return success(data);
	})
	.fail(function() { 
		return failed();
	});
}

function IDPresent() {
	if(window.location.pathname.length != 1){
		return window.location.pathname.split("/")[1]
	}
	return -1;
}

function GetNextEvent() {
	$.getJSON("https://api.tnyu.org/v1.0/events/upcoming", function(data) {
		var todaysDate = new Date();
		var eventDate = moment().format(data["events"]["startDateTime"]);
		if(!moment(eventDate).isSame(moment(), 'day')){
			$('#no-event-happening').html('<p>No event happening today!</p>');
			$('#next-event-happening').html('Next Event: <a target="_blank" href="' + data["events"]["rsvpUrl"] + '">' + data["events"]["title"] + "</a>")
			$('#no-event-happening').show();
			$('#next-event-happening').show();
		} else {
			window.location.replace(document.URL+data["events"]["id"]);
		}
	});
}

function GetEventByID(ID) {
	$.getJSON("https://api.tnyu.org/v1.0/events/" + ID, function(data) {
		$('#event-happening').html('<h3>'+ data["events"]["title"] + '</h3><p class="lead">' + data["events"]["description"] + '</p>');
		
		CheckLogin(function(){
			$('#event-happening').append('<p><a class="btn btn-lg btn-success" href="#" role="button">Check in</a></p>');
		}, function(){
			$('#event-happening').append('<p><a class="btn btn-lg btn-success" href="https://api.tnyu.org/v1.0/auth/twitter?success='+window.location+'" role="button">Sign into your account</a></p>');
		});
		$('#event-happening').show();
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

$(document).ready(function() {
	CheckLogin(function(data) {
		$('#login').html('<a href="">Edit Profile</a>');
	}, function(){
		$('#login').html('<a href="https://api.tnyu.org/v1.0/auth/twitter?success='+window.location+'">Login</a>');
	});
	var currentID = IDPresent();
	if(currentID != -1){
		GetEventByID(currentID);
		return
	}
		GetNextEvent();
});