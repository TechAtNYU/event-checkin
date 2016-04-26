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
				url: '/:id/:config/checkin',
				templateUrl: 'partials/checkin.html',
				controller: 'CheckinCtrl'
			})
			.state('entry', {
				url: '/entry/:id/:config',
				templateUrl: 'partials/entry.html',
				controller: 'EntryCtrl'
			});
	});