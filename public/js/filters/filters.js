
angular.module('wobaScraper.filters', [])

.filter('PositionFilter', function() {

	return function(players, pos) {

		var filtered = [];

		if (pos == 'All') {

			return players

		} else {

			angular.forEach(players, function(player) {

				if (player.pos == pos) {
					filtered.push(player);
				}

			});

			return filtered;

		}

	}

})

.filter('GameFilter', function() {

	return function(players, selectedGames) {

		var filtered = [];

		angular.forEach(players, function(player) {

			var index = selectedGames.indexOf(player.game_id);
			if (index > -1) {
				filtered.push(player);
			}

		});

		return filtered;

	}

});
