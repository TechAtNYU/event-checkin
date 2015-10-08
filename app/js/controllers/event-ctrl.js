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
            for (var i = rsvpsData.length - 1; i >= 0; i--) {
                rsvpIds[rsvpsData[i].id] = true;
            };
            Restangular.one('people')
            .get()
            .then(function(data) {
                $scope.peopleData = data;
                for (var i = data.length - 1; i >= 0; i--) {
                    if (rsvpIds[data[i].id] === true){
                        allPeople.push(data[i].id);
                        $scope.idToPerson[data[i].id] = data[i].attributes.name;
                    }
                };
            });
		});

	function suggest_state(term) {
		var q = term.toLowerCase().trim();
		var results = [];
		for (var i = 0; i < allPeople.length && results.length < 10; i++) {
            var value = allPeople[i];
            var state = $scope.idToPerson[value];
			if (state.toLowerCase().indexOf(q) === 0)
				results.push({ label: state, value: value });
		}
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
                currentAttendees.push({"id": selected.value, "type": "people"});
                eventData['links']['attendees']['linkage'] = currentAttendees;
                console.log(eventData);
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