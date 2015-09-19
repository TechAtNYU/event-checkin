'use strict';

angular.module('app')
.config(function($stateProvider, $urlRouterProvider) {
	$urlRouterProvider.otherwise('/');
	$stateProvider
		.state('index', {
	url: '/',
	templateUrl: 'partials/events.html',
	controller: 'MainCtrl'
		})
		.state('checkin', {
	url: '/checkin/:id',
	templateUrl: 'partials/checkin.html',
	controller: 'EventCtrl'
		});
});
