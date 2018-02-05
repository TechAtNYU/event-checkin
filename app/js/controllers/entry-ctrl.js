'use strict';

angular
	.module('app.controllers')
	.controller('EntryCtrl', function($scope, $stateParams, $sce, $q, $http, Restangular, $timeout) {

		//used when loading typeahead
		$scope.shared = $stateParams.config;
		$scope.dirty = {};
		$scope.idToPerson = {};
		var allPeople = [];

		// stored data to use throughout form
		$scope.dirty.nNumber = ""
		$scope.dirty.name = ""
		$scope.person = {
			attributes: {}
		};


		//booleans for opening up new parts of the form
		$scope.rsvpd = false;
		$scope.needName = false;
		$scope.needEmail = false;
		$scope.allEntered = false;

		$scope.findPersonNumber = function(number) {
			if (number.indexOf('=') > -1) {
				number = 'N' + number.substring(2, number.indexOf('='));
			}
			$scope.dirty.nNumber = number
			personExists('people?filter[simple][nNumber]=' + number, function() {
				$scope.needName = true;
			});
		}

		$scope.notAStudent = function() {
			$scope.needName = true;
		}

		$scope.findPersonName = function(name) {
			$scope.dirty.name = name;
			personExists('people?filter[simple][name]=' + name, function() {
				$scope.needEmail = true;
			});
		}

		$scope.findPersonEmail = function(email) {
			$scope.allEntered = true;
			personExists('people?filter[simple][contact.email]=' + email, function() {
				$scope.person.attributes.name = $scope.dirty.name
				createAccount($scope.dirty.name, $scope.dirty.email, $scope.dirty.nNumber).then(function(data) {
					$scope.person = data[0];
					rsvpPerson($scope.person.id);
				});
			});
		}

		$scope.addToMailingList = function(person) {
			var access_token = 'f234e56583e242b25e3f76a7fe4e4789ab98ed0c';
			var mailtrain_url = 'http://mailtrain.tnyu.org/api/subscribe/HJNc8AuSz'

			$http({
				method  : 'POST',
				crossDomain: true,
				url     : mailtrain_url + '?access_token=' + access_token,
				data:
					{
						'EMAIL': person.attributes.contact.email,
						'REQUIRE_CONFIRMATION': 'yes'
					}
			})
			.success(function(response) {
				alert('success! – ' + response.data.id)
			})
		};

		function personExists(url, elseCallback) {
			Restangular.one(url)
				.get()
				.then(function(data) {
					if (data.length > 0) {
						$scope.person = data[0]
						var p;
						if ($scope.person.attributes.nNumber != $scope.dirty.Number) {
							p = updatePerson($scope.dirty.nNumber)
						}
						$q.when(p, function() {
							rsvpPerson($scope.person.id);
						});
					} else {
						elseCallback()
					}
				});
		}

		function rsvpPerson(id) {
			// Add to checkin
			var eventData = [];
			// Adds the person as an attendee relationship to the event
			Restangular.one('events/' + $stateParams.id)
				.get()
				.then(function(data) {
					if (data && data.relationships && data.relationships.attendees && data.relationships.attendees.data) {
						Restangular.all('events/' + $stateParams.id + '/relationships/attendees')
							.post({
								id: id.toString(),
								type: 'people'
							})
							.then(function(post) {
								$scope.rsvpd = true;
								resetTimeout();
							});
					}
				});
		}

		//updates the person's nNumber record
		function updatePerson(number) {
			var personData = {
				type: "people",
				id: $scope.person.id,
				attributes: {}
			}

			if (number !== "") {
				personData.attributes.nNumber = number;
			}

			return Restangular.one('people/' + $scope.person.id)
				.patch(personData);
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
				_(rsvpsData).forEach(function(val) {
					rsvpIds[val.id] = true;
				}).value();

				// Converting Ids to names for typeahead.
				Restangular.one('people')
					.get()
					.then(function(data) {
						$scope.peopleData = data;
						_(data).forEach(function(val) {
							if (rsvpIds[val.id] === true) {
								allPeople.push(val.id);
								$scope.idToPerson[val.id] = val.attributes.name;
							}
						}).value();
					});
			});

		//autocomplete suggestions
		function suggestState(term) {
			if (term.indexOf(' ') === -1) {
				return [];
			}
			var q = term.toLowerCase().trim();
			var results = [];
			_(allPeople).forEach(function(val) {
				if (results.length > 10)
					return results;
				var state = $scope.idToPerson[val];
				if (state.toLowerCase().indexOf(q) === 0)
					results.push({
						label: state,
						value: val
					});
			}).value();
			return results;
		}

		$scope.autocomplete_options = {
			suggest: suggestState,
			on_select: function(selected) {
				$scope.person.attributes.name = selected.label;
				rsvpPerson(selected.value);
			}
		};

		function resetTimeout() {
			$timeout(reset, 10000);
		}

		function reset() {
			$scope.dirty = {}
			$scope.person = {
				attributes: {}
			};
			$scope.rsvpd = false;
			$scope.needName = false;
			$scope.needEmail = false;
			$scope.allEntered = false;
		}
	});
