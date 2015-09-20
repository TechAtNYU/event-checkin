'use strict';

angular
.module('app.controllers')
.controller('EventsCtrl', function($scope, Restangular) {
	$scope.loadingPromise = Restangular.one('events/upcoming-publicly?page[limit]=10&sort=%2bstartDateTime')
		.get()
		.then(function(data) {
			$scope.events = data;
		});
});
