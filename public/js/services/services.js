
angular.module('wobaScraper.services', [])

.factory('WobaService', function($http) {

	return {

		getData: function(url) {

			return $http.get(url).then(function(response) {

				var data = response.data;
				return data;

			});

		}

	}

})

.factory('ScoreboardService', function($http) {

	return {

		getData: function(url) {
			
			return $http.get(url).then(function(response) {

				var data = response.data;
				return data;

			});

		}

	}

})

