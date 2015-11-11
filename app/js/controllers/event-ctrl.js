'use strict';

angular
.module('app.controllers')
.controller('EventCtrl', function($scope, $stateParams, $sce, $q, Restangular) {
	$scope.shared = $stateParams.config;
	$scope.dirty = {};
	$scope.idToPerson = {};
	var allPeople = [];

	$scope.loadingPromise = Restangular.one('events/' + $stateParams.id)
	.get()
	.then(function(data) {
		$scope.events = data;
		var rsvpIds = {};
		var rsvpsData = data && data.links && data.links.rsvps && data.links.rsvps.linkage;
		_(rsvpsData).forEach(function (val) {
			rsvpIds[val.id] = true;
		}).value();

		// Converting Ids to names for typeahead.
		Restangular.one('people')
		.get()
		.then(function(data) {
			$scope.peopleData = data;
			_(data).forEach(function (val) {
				if (rsvpIds[val.id] === true){
					allPeople.push(val.id);
					$scope.idToPerson[val.id] = val.attributes.name;
				}
			}).value();
		});
	});

	function suggest_state(term) {
		var q = term.toLowerCase().trim();
		var results = [];
		_(allPeople).forEach(function (val) {
			if (results.length > 10)
				return results;
			var state = $scope.idToPerson[val];
			if (state.toLowerCase().indexOf(q) === 0)
				results.push({ label: state, value: val });
		}).value();
		return results;
	}

	function rsvp_person(selected) {
		// Add to checkin
		var eventData = {};
		eventData['type'] = 'events';
		eventData['id'] = $stateParams.id;
		eventData['links'] = {};
		eventData['links']['attendees'] = {};

		Restangular.one('events/' + $stateParams.id)
		.get()
		.then(function(data) {
			if (data && data.links && data.links.attendees && data.links.attendees.linkage) {
				var currentAttendees = data && data.links && data.links.attendees && data.links.attendees.linkage;
				currentAttendees.push({
					"id": selected.value,
					"type": "people"
				});
				eventData['links']['attendees']['linkage'] = currentAttendees;
				Restangular.one('events/' + $stateParams.id)
				.patch(eventData)
				.then(function(){
					// Clear
					$scope.dirty.selected_tag = undefined;
					$scope.dirty = {};
				});
			}
		});
	}

	$scope.autocomplete_options = {
		suggest: suggest_state,
		on_select: rsvp_person
	};
});