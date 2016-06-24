
var homeCtrl = angular.module('homeCtrl', []);

homeCtrl.controller('homeCtrl', function($scope, $http, $stateParams, WobaService, ScoreboardService) {

	$scope.loading 	     = true;
	$scope.sortType      = 'ab';   // set the default sort type
	$scope.sortReverse   = true;   // set the default sort order
	$scope.searchPlayers = '';     // set the default search/filter term
    $scope.selectedPosition = 'All';
    $scope.selectedGames = [];

    if ($stateParams.date) {
        var wobaUrl = '/api/scrape-woba?date='+$stateParams.date;
        var sbUrl = '/api/scoreboard?date='+$stateParams.date;
    } else {
        var wobaUrl = '/api/scrape-woba';
        var sbUrl = '/api/scoreboard';
    }

    if ($stateParams.date === 'usetestdata') {
        console.log('Using Test Data');
    } else {
        console.log('Getting Fresh Data');
    }

    // Get the wOBA data
    WobaService.getData(wobaUrl).then(function(data) {

        $scope.loading = false;
        $scope.players = data.players;
        $scope.game_count = data.game_count;
        $scope.lineup_count = data.lineup_count;
        $scope.games = data.games;
        $scope.date = data.date;

        angular.forEach($scope.games, function(game) {
            var id = game.game_id;
            $scope.selectedGames.push(id);
        });

        console.log(data);

    }).catch(function() {
        console.log('Error: ' + data);
    });

    // Get the Scoreboard data
    /*ScoreboardService.getData(sbUrl).then(function(data) {
        $scope.scoreboardGames = data;
        console.log($scope.scoreboardGames);
    }).catch(function() {
        console.log('Error: ' + data);
    });*/

    // toggle the selected games checkboxes
    $scope.toggleSelection = function(game_id) {

        if (game_id == 'SelectAll') {
            angular.forEach($scope.games, function(game) {
                var id = game.game_id;
                $scope.selectedGames.push(id);
            });
        } else if (game_id == 'DeselectAll') {
            $scope.selectedGames = [];
        } else {

            var index = $scope.selectedGames.indexOf(game_id);
            if (index > -1) {
                $scope.selectedGames.splice(index, 1);
            } else {
                $scope.selectedGames.push(game_id);
            }

        }

    };

    $scope.updateSort = function(sort,reverse) {
        $scope.sortType = sort;
        $scope.sortReverse = reverse;
    }

    // css class for green text in woba table
    $scope.wobaClass = function(woba) {

        if (woba >= .400) {
            return 'text-success';
        }else if (woba >= .370) {
            return 'text-warning'
        }

    };

    $scope.sortTextFormat = function(sort) {

        switch(sort) {
            case 'ab':
                return 'At Bats'; break;
            case 'hits':
                return 'Hits'; break;
            case 'hr':
                return 'Home Runs'; break;
            case 'rbi':
                return 'RBIs'; break;
            case 'avg':
                return 'Average'; break;
            case 'woba':
                return 'wOBA'; break;
            case 'salary':
                return 'Salary'; break;
            default: return sort;
        }

    };
    
});