var request = require('request-promise');
var API_BASE_URL = "https://api.tnyu.org/v2/";

module.exports = {
  showEvents: function(req, res, next, urlFor) {
    request({
      url: API_BASE_URL + "events/public-check-in-eligible",
      json: true,
      rejectUnauthorized: false
    }, function(err, response, body) {
      res.render('showEvents', {events: body.data});
    });
  },

  showConfiguredEvent: function(req, res, next, urlFor) {
    request({
      url: API_BASE_URL + "events/" + req.params.event_id,
      json: true,
      rejectUnauthorized: false
    }, function(err, response, body) {
      res.render('showEvents', {events: body.data, fromConfig: true});
    });
  },

  checkin: function(req, res, next, urlFor) {
    res.render('checkin');
  },

  thanks: function(req, res, next, urlFor) {
    res.render('thanks');
  },

  configure: function(req, res, next, urlFor) {
    request({
      url: "https://api.tnyu.org/v2/events/next-10-publicly",
      json: true,
      rejectUnauthorized: false
    }, function(err, response, body) {
      var events = body.data instanceof Array ? body.data : [body.data];
      events.forEach(function(event) {
        event.checkInUrl = urlFor("showConfiguredEvent", {absolute: true, params: {event_id: event.id}});
      })

      res.render('configure', {events: events});
    });
  },

  number: function(req, res, next, urlFor) {
    request({
      url: API_BASE_URL + "events/" + req.params.event_id,
      json: true,
      rejectUnauthorized: false
    }, function(err, response, body) {
      var events = body.data instanceof Array ? body.data : [body.data];
      var attendeeNumber = 0;
      if (events[0] && events[0].links && events[0].links.attendees && events[0].links.attendees.linkage){
        attendeeNumber = events[0].links.attendees.linkage.length;
      }
      res.render('number', {data : {'attendees' : attendeeNumber}});
    });
  },
}
