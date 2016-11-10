'use strict';

angular
.module('app.controllers')
.controller('EntryCtrl', function($scope, $stateParams, $sce, $q, Restangular, $timeout) {

	var allPeople = [];

	//used when loading typeahead
	$scope.shared = $stateParams.config;
	$scope.idToPerson = {};

	$scope.rsvps;

	$scope.seatCount = 0;
	$scope.totalCheckins = 0;
	$scope.totalRsvps = 0;
	$scope.checkinsFromRSVP = 0;

	reset();
	
	$scope.validateNNumber = function(number) {
		var re = /N[0-9]{8}$/;
		return re.test(number);
	}

	$scope.validateFullName = function(name) {
		var re = /[A-Z][a-z]*\s[A-Z][a-z]*/;
		return re.test(name);	
	}

	$scope.validateEmail = function(email) {
		var re = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;
		return re.test(email);
	}


	$scope.findPersonNumber = function(number) {
		$scope.nFailValidation = false;
		if (number.indexOf('=') > -1) {
			number = 'N' + number.substring(2, number.indexOf('='));
		}
		else if (number.indexOf('N') < 0) {
			number = 'N' + number;
		}

		$scope.dirty.nNumber = number

		if (!$scope.validateNNumber(number)) {
			$scope.nFailValidation = true;
			return;
		}

		personExists('people?filter[simple][nNumber]=' + number, function() {
			$scope.needName = true;
			$scope.canReset = true;
			$timeout(()=>{
				angular.element('#nameField').focus();
			}, 1);
		});
	}

	$scope.notAStudent = function() { 
		$scope.dirty.nNumber = ""
		$scope.nyuStudent = !$scope.nyuStudent;
		if ($scope.nyuStudent) {
			$scope.needId = true;
			$scope.needName = false;
		}
		else {
			$scope.needId = false;
			$scope.needName = true;
		}
	}

	$scope.findPersonName = function(name) {
		$scope.nameFailValidation = false;
		$scope.dirty.name = name;
		if (!$scope.validateFullName(name)) {
			$scope.nameFailValidation = true;
			return;
		}
		personExists('people?filter[simple][name]=' + name, function() {
			$scope.needEmail = true;
			$scope.canReset = true;
			$timeout(()=>{
				angular.element('#emailField').focus();
			}, 1);

		});
	}

	$scope.findPersonEmail = function(email) {
		$scope.emailFailValidation = false;

		if (!$scope.validateEmail(email)) {
			$scope.emailFailValidation = true;
			return;
		}

		$scope.allEntered = true;

		if ($scope.person.attributes.name) {
			updatePerson(null, email, checkEmail);
			return;
		}

		personExists('people?filter[simple][contact.email]=' + email, function() {
			$scope.readyForNew = true;
			$scope.checking = true;
			$scope.allEntered = false;
		});
	}

	$scope.submission = function() {
		$scope.person.attributes.name = $scope.dirty.name;
		createAccount($scope.dirty.name, $scope.dirty.email, $scope.dirty.nNumber).then(function(data) {
			$scope.person = data[0];
			$scope.alerts.push('New Account created');
				checkAndRsvp($scope.person.id);
		});
	}

	$scope.resetFields = function() {
		reset();
		$timeout(()=>{
			angular.element('#idField').focus();
		}, 1);
	}

	function personExists(url, elseCallback) {
		Restangular.one(url)
		.get()
		.then(function(data) {
			var person;
			if (data.length > 0) {
				person = data[0];
			}
			if (data.attributes) {
				person = data;
			}

			if (person) {
				$scope.person = person
				var p;
				if ($scope.dirty.nNumber && $scope.person.attributes.nNumber != $scope.dirty.nNumber) {
					p = updatePerson($scope.dirty.nNumber, "", checkEmail);
				}
				else {
					checkEmail($scope.person);
				}
			}
			else {
				elseCallback()
			}
		});
	}

	function checkEmail(person) {
		if (person.attributes.contact && person.attributes.contact.email && person.attributes.contact.email !== '') {
			$scope.checking = true;
			checkAndRsvp(person.id)
		}
		else {
			$scope.needEmail = true;
		}
	}

	function checkAndRsvp(id) {
		if($scope.rsvps[id]) {
			$scope.checkinsFromRSVP += 1;
			checkinPerson(id);
		}
		else {
			$scope.alerts.push('Person has not RSVPd, override or reset');
			$scope.needsRsvpOverride = true;
		}
	}

	$scope.override = function () {
		$scope.needsRsvpOverride = false;
		checkinPerson($scope.person.id);
	}

	function checkinPerson(id) {
		$scope.totalCheckins += 1;
		// Add to checkin
		var eventData = [];
		// Adds the person as an attendee relationship to the event
		Restangular.one('events/' + $stateParams.id)
		.get()
		.then(function(data) {
			if (data && data.relationships && data.relationships.attendees && data.relationships.attendees.data) {
				Restangular.all('events/' + $stateParams.id + '/relationships/attendees')
				.post({id: id.toString(), type:'people'} )
				.then(function(post){
					$scope.checkedIn = true;
					resetTimeout();
				});
			}
		});
	}

	

	//updates the person's nNumber record
	function updatePerson(number, email, callback) {
		var personData = {
			type: "people",
			id: $scope.person.id,
			attributes: {
			}
		}

		if (email && email !== "") {
			personData.attributes = {
				'contact.email':email
			};
		}

		if (number && number !== "") {
			personData.attributes.nNumber = number;
		}

		return Restangular.one('people/' + $scope.person.id)
		.patch(personData)
		.then(function(data) {
			callback(data);
		});
	}

	function createAccount(name, email, number) {
		var person = {
			type: "people",
			attributes: {
				name: name,
				"contact.email": email
			}
		}
		if (number !== "") {
			person.attributes.nNumber = number;
		}
		return Restangular.all('people')
		.post(person)
	}

	// loads the typeahead
	$scope.loadingPromise = Restangular.one('events/' + $stateParams.id)
	.get()
	.then(function(data) {
		$scope.events = data;
		var rsvpIds = {};
		var rsvpsData = data && data.relationships && data.relationships.rsvps && data.relationships.rsvps.data;
		var checkins = data && data.relationships && data.relationships.attendees && data.relationships.attendees.data;
		$scope.totalRsvps = rsvpsData.length;
		_(rsvpsData).forEach(function (val) {
			rsvpIds[val.id] = true;
			var index = _.findIndex(checkins, function(current, index) {
				return current.id == val.id 
			});
			if (index != -1) {
				$scope.checkinsFromRSVP += 1;
			}
		}).value();

		$scope.rsvps = rsvpIds;
		$scope.totalCheckins = checkins.length;

		var venueId = data && data.relationships && data.relationships.venue && data.relationships.venue.data && data.relationships.venue.data.id;

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
		Restangular.one('venues/' + venueId)
		.get()
		.then(function(data) {
			if (data && data.attributes && data.attributes.seats) {
				$scope.seatCount = data.attributes.seats
			}
		});
	});

	//autocomplete suggestions
	function suggestState(term) {
		if (term.indexOf(' ') === -1) {
			return [];
		}
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

	$scope.autocomplete_options = {
		suggest: suggestState,
		on_select: function(selected) {
			$scope.person.attributes.name = selected.label;
			$scope.dirty.value = selected.label;
			personExists('people/' + selected.value);
		}
	};

	function resetTimeout() {
		$scope.alerts = [];
		$timeout(reset, 2000);
	}

	function reset() {
		$scope.checkedIn = false;

		// Clears form data
		$scope.dirty = {}
		$scope.dirty.nNumber = ""
		$scope.dirty.name = ""
		$scope.dirty.email = ""

		// Clears record data
		$scope.person = {attributes:{}};

		// Opens up new parts of the form as needed
		$scope.needId = true;
		$scope.needName = false;
		$scope.needEmail = false;

		// Disables the fields as processing is done
		$scope.allEntered = false;

		// Toggle for ID field
		$scope.nyuStudent = true;		
		
		// Display error messages if the fields don't validate
		$scope.nFailValidation = false;
		$scope.nameFailValidation = false;
		$scope.emailFailValidation = false;

		// The override for someone who has not rsvp'd
		$scope.needsRsvpOverride = false;

		// Enables the reset switch after certain actions
		$scope.canReset = false;

		// Shows the submit button for creating a new account
		$scope.readyForNew = false;

		// Alert messages
		$scope.alerts = [];

		// Checking or nah
		$scope.checking = false;
	}
});