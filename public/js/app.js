
// Declares the initial angular module "meanMapApp". Module grabs other controllers and services.
var app = angular.module('YourAppName', ['homeCtrl', 'ngRoute', 'satellizer'])

    // Configures Angular routing -- showing the relevant view and controller when needed.
    .config(function($routeProvider){

        // Join Team Control Panel
        $routeProvider.when('/', {
            controller: 'homeCtrl',
            templateUrl: '../views/home.html',
        })
        .otherwise('/');

    });