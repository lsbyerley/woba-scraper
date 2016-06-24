// Dependecies
var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');
var moment = require('moment');
var today = moment().format('YYYY-MM-DD');

// Opens App Routes
module.exports = function(app, config) {

	app.get('/api/scoreboard', function(req, res) {

		var scoreboard = [];

		if (req.query.date === 'usetestdata') {

			// read test data file
			fs.readFile('public/testdata/scoreboard-data.json', 'utf-8', parseScoreboardFile)

		} else {

			var sbDate,
				sbToday = moment().format('YYYYMMDD');

			if (req.query.date && moment(req.query.date,'YYYY-MM-DD',true).isValid() ) {
				var formatted = moment(req.query.date, 'YYYY-MM-DD').format('YYYYMMDD');
				sbDate = formatted;
			} else {
				sbDate = sbToday
			}
			var scoreboardUrl = 'http://api.espn.com/v1/sports/baseball/mlb/events?&dates='+sbDate+'&apikey=nh7hfbs5up83sffgt5bu2qzp';

			// make request for scoreboard games
			request(scoreboardUrl, parseScoreboardRequest);

		}

		function parseScoreboardFile(error, data) {
			if (error) throw error;
			data = JSON.parse(data);
			var events = data.sports[0].leagues[0].events;
			buildGameData(events);
			//saveScoreboardFile(data);
		}

		function parseScoreboardRequest(error, response, data) {
			if (error) throw error;
			data = JSON.parse(data);
			var events = data.sports[0].leagues[0].events;
			buildGameData(events);
			saveScoreboardFile(data);
		}

		function saveScoreboardFile(data) {
            var str = JSON.stringify(data);
            fs.writeFile('public/testdata/scoreboard-data.json', str, function(err) {
            	if (err) console.log(err);
            	console.log('Scoreboard File Saved!');
            });
		}

		function buildGameData(events) {

			for (var i = 0; i < events.length; i++) {

				var g           = events[i],
					home        = g.competitions[0].competitors[0],
                    away        = g.competitions[0].competitors[1],
                    home_record = home.team.record["summary"],
                    away_record = away.team.record["summary"],
                    status      = '',
                    status_id   = g.competitions[0].status["id"],
                    note        = '',
                    venue       = '',
                    city_state  = '',
                    home_winner = false,
                    away_winner = false,
                    time_valid  = g["timeValid"],
                    //game_date   = new Date(g["date"]),
                    game_date   = g["date"];

                if(status_id == 1){
                    if(time_valid){
                    	utcMoment = moment(game_date, moment.ISO_8601);
                    	status = utcMoment.format('h:mm a');
                    }else{
                        status = g.competitions[0].status["shortDetail"];
                    }
                }else{
                    status = g.competitions[0].status["shortDetail"];
                }

                if(g.venues[0]){
                    venue = g.venues[0]["name"]
                    city_state = g.venues[0]["city"]+', '+g.venues[0]["state"]
                }

                if(home["isWinner"]){home_winner = true;}
                if(away["isWinner"]){away_winner = true;}
                
                var away_team = {
                    "id"       : away.team["id"],
                    "nickname" : away.team["name"],
                    "score"    : away["score"],
                    "logo"     : "http://a.espncdn.com/combiner/i?img=/i/teamlogos/mlb/500/"+away.team["id"]+".png&w=70&h=70&transparent=true",
                    "winner"   : away_winner,
                    "record"   : away_record,
                    "pitcher"  : g.competitions[0].stats.awayStartingPitcher.athlete.shortName
                };

                var home_team = {
                    "id"       : home.team["id"],
                    "nickname" : home.team["name"],
                    "score"    : home["score"],
                    "logo"     : "http://a.espncdn.com/combiner/i?img=/i/teamlogos/mlb/500/"+home.team["id"]+".png&w=70&h=70&transparent=true",
                    "winner"   : home_winner,
                    "record"   : home_record,
                    "pitcher"  : g.competitions[0].stats.homeStartingPitcher.athlete.shortName,
                };

                var winning_pitcher = '';
                var losing_pitcher = '';
                if ( g.competitions[0].stats.winningPitcher && g.competitions[0].stats.losingPitcher ) {
                	winning_pitcher = g.competitions[0].stats.winningPitcher.athlete.shortName;
                	losing_pitcher = g.competitions[0].stats.losingPitcher.athlete.shortName;
                }

                var game = {
                    "home"       : home_team,
                    "away"       : away_team,
                    "status"     : status,
                    "status_id"  : status_id,
                    "note"       : note,
                    "venue"      : venue,
                    "city_state" : city_state,
                    "winning_pitcher" : winning_pitcher,
                    "losing_pitcher" : losing_pitcher
                }
                scoreboard.push(game)

			};

			res.send(scoreboard);

		};

	});

	app.get('/api/scrape-woba', function(req, res) {

		if (req.query.date === 'usetestdata') {

			fs.readFile('public/testdata/woba-data.json', (err, data) => {
				if (err) throw err;
				var json = JSON.parse(data);
				res.send(json);
			});

		} else {

			var date = (req.query.date && moment(req.query.date,'YYYY-MM-DD',true).isValid() ) ? req.query.date : today;
			var url = 'http://www.fantasyalarm.com/mlb/lineups?lineup_date='+date;

		    request(url, function(error, response, html){

		        if(!error){

		            var $ = cheerio.load(html),
		            	game_divs = $("div[id|='game']"),
		            	game_count = 0,
		            	lineup_count = 0,
		            	games = [];
		            	players = [];

		            // LOOP THROUGH EACH GAME DIV
		            game_divs.each(function(i, element) {

		            	var game = $(this),
		            		game_id = $(this).attr('id'),
		            		game_time = $(this).find('.lineup-background').find('.lineup-time').find('.row').find('a').text().trim(),
		            		lineups = game.find('table.table.stats-table.lineup-table.table-mlb'),
		            		pitchers = game.find('table.table.stats-table.lineup-table.table-gray'),
		            		teams = game.find('div.lineup-team-name');
		            		game_count += 1;

	            		var away_team = $(teams[0]),
	            			away_name = $(away_team).children().find('.lineup-team-name-lower').find('a').text(),
	            			away_name = away_name.trim(),
	            			away_logo = $(away_team).find('.pull-left').find('img').attr('src'),
	            			away_opp_pitcher = '-';

	            		var home_team = $(teams[1]),
	            			home_name = $(home_team).children().find('.lineup-team-name-lower').find('a').text(),
	            			home_name = home_name.trim(),
	            			home_logo = $(home_team).find('.pull-left').find('img').attr('src'),
	            			home_opp_pitcher = '-';

	            		// GET THE PITCHERS
	            		pitchers.each(function(i, element) {

		            		var pitcher_row = $(this).find('tbody tr'),
		            			pitcher_children = $(pitcher_row).children();

		            		var pitcher_name = pitcher_children.eq(0).find('a').text().trim();

		            		if (i === 1) {
		            			away_opp_pitcher = pitcher_name;
		            		} else {
		            			home_opp_pitcher = pitcher_name;
		            		}

		            	})

	            		var game = {
	            			"game_id": game_id,
	            			"game_time": game_time,
	            			"away_team": away_name,
	            			"away_logo": away_logo,
	            			"away_opp_pitcher": away_opp_pitcher,
	            			"home_team": home_name,
	            			"home_logo": home_logo,
	            			"home_opp_pitcher": home_opp_pitcher
	            		};
	            		games.push(game);

		            	// LOOP THROUGH BOTH GAMES IN THE GAME DIV
		            	lineups.each(function(i, element) {

		            		var lineup_rows = $(this).find('tbody tr');
		            			lineup_count += 1,
		            			is_home = (i === 0) ? false : true

		            		// LOOP THROUGH THE LINEUP <tr>
		            		lineup_rows.each(function(i, element) {

		            			// The <td> tags
		            			var children = $(this).children(),
		            				order = parseInt($(children[0]).text().trim()),
		            				pos = $(children[1]).text().trim(),
		            				name = $(children[2]).find('a').text().trim(),
		            				salary = $(children[9]).find('a').text().trim();

	            				var at_bats = ($(children[3]).text() === '-') ? 0 : parseInt($(children[3]).text().trim()),
	            				hits = ($(children[4]).text() === '-') ? 0 : parseInt($(children[4]).text().trim()),
	            				hr = ($(children[5]).text() === '-') ? 0 : parseInt($(children[5]).text().trim()),
	            				rbi = ($(children[6]).text() === '-') ? 0 : parseInt($(children[6]).text().trim()),
	            				avg = ($(children[7]).text() === '-') ? 0 : parseFloat($(children[7]).text().trim()).toFixed(3),
	            				woba = ($(children[8]).text() === '-') ? 0 : parseFloat($(children[8]).text().trim()).toFixed(3),
		            				

		            			salary = salary.replace('$','');
		            			salary = parseInt(salary);

		            			if (pos === "LF" || pos === "CF" || pos === "RF") {
		            				pos = "OF";
		            			}

		            			if (hits > 0) {

		            				var team_name = (is_home == true) ? home_name : away_name;
		            				var team_logo = (is_home == true) ? home_logo : away_logo;
		            				var opp_pitcher = (is_home == true) ? home_opp_pitcher : away_opp_pitcher;
			            			var lineup_spot = {
			            				"game_id": game_id,
			            				"team": team_name,
			            				"logo": team_logo,
			            				"order": order,
			            				"pos": pos,
			            				"name": name,
			            				"ab": at_bats,
			            				"hits": hits,
			            				"hr": hr,
			            				"rbi": rbi,
			            				"avg": avg,
			            				"woba": woba,
			            				"salary": salary,
			            				"opp_pitcher": opp_pitcher
			            			};

			            			players.push(lineup_spot);

			            		}

		            		});

		            	});	

		            });

		            data = {
		            	"date": date,
		            	"game_count": game_count,
		            	"lineup_count": lineup_count,
		            	"games": games,
		            	"players": players
		            }

		            // save data as json file
		            if (lineup_count > 0) {
			            var str = JSON.stringify(data);
			            fs.writeFile('public/testdata/woba-data.json', str, function(err) {
			            	if (err) console.log(err);
			            	console.log('Woba File Saved!');
			            });
			        }

		            res.send(data);

		        };

		    });

		}

	});

};