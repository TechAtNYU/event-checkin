'use strict';

angular
.module('app.controllers')
.controller('MainCtrl', function($scope, $location) {
	$scope.shared = true;
	// if ($location.search() && $location.search().shared === 'true') {
	// 	$scope.shared = true;
	// }
});
