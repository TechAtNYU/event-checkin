'use strict';

angular
.module('app.controllers')
.controller('MainCtrl', function($scope, $location) {
	$scope.shared = false;
	if ($location.search() && $location.search().shared === 'true') {
		$scope.shared = true;
	}
})
.controller('EventCtrl', function($scope, $rootScope, $location, $stateParams, $state,
		$interval, Restangular) {

	$scope.signIn = function() {
		var url = 'https://api.tnyu.org/v2/auth/facebook?success=' +
			window.encodeURIComponent($location.absUrl());
		window.location = url;
	};

	$scope.signOutExternalService = function() {
		var eventUrl = [window.location.protocol, '//', window.location.host,
			window.location.pathname.toString().replace('thanks', 'show')]
			.join('');
		var url = 'https://api.tnyu.org/v2/auth/facebook/logOut?doExternalServiceLogout=true&success=' +
			encodeURIComponent(eventUrl);
		window.location = url;
	};

	Restangular.one('people/me')
		.get()
		.then(function() {
			// Check person in
			var resourceId = $stateParams.id;
			Restangular.one('events/' + resourceId + '/check-in')
				.get()
				.then(function() {
					$scope.thanks = true;
					if ($stateParams.config === 'true') {
						$scope.shared = true;
						$scope.signOutExternalService();
					} else {
						$scope.personal = true;
					}
				});
		})
		.catch(function(res) {
			var status = res.data.errors[0].status;
			if (status === '401') {
				$scope.signIn();
			}
		});
});
