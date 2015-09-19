'use strict';

angular
.module('app.controllers')
.controller('MainCtrl', function() {
})
.controller('EventCtrl', function($scope, $rootScope, $location, $stateParams, $state,
		$interval, Restangular) {

	$scope.signIn = function() {
		var url = 'https://api.tnyu.org/v2/auth/facebook?success=' +
			window.encodeURIComponent($location.absUrl());
		window.location = url;
	};

	$scope.signOut = function() {
		var url = 'https://api.tnyu.org/v2/auth/facebook/logout?doExternalServiceLogout=true&success=' +
			window.encodeURIComponent('http://google.com/');
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
				});
		})
		.catch(function(res) {
		   var status = res.data.errors[0].status;
			if (status === '401') {
				$scope.signIn();
			}
		});
});
