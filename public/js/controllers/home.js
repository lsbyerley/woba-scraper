
var homeCtrl = angular.module('homeCtrl', []);

homeCtrl.controller('homeCtrl', function($scope, $window, $auth) {

	$scope.hello = 'Hello YourAppName!';

	$scope.isAuthenticated = function() {
		return $auth.isAuthenticated();
	};

});