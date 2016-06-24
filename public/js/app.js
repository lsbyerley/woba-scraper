
// Declares the initial angular module "meanMapApp". Module grabs other controllers and services.
var app = angular.module('WobaScraper', ['homeCtrl', 'wobaScraper.services', 'wobaScraper.filters', 'ui.router', 'ngAnimate', 'ui.bootstrap', 'satellizer'])

    // Configures Angular routing -- showing the relevant view and controller when needed.
    .config(function($stateProvider, $urlRouterProvider, $compileProvider) {

        // via: https://medium.com/@hackupstate/improving-angular-performance-with-1-line-of-code-a1fb814a6476
        $compileProvider.debugInfoEnabled(false);

    	$urlRouterProvider.otherwise('/');

    	$stateProvider
    		.state('home', {
    			url: '/:date',
    			templateUrl: '../views/home.html',
    			controller: 'homeCtrl'
    		})
    });