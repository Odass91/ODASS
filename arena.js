(function()
{
	var arena = angular.module("game", []);

	arena.controller('GameController', function()
	{
		this.player = player;
		this.quizz = quizz;
		this.turn = turn;
	});
	
	var player = 
	{
		"name": "Kobal",
		"score": 2500
		"twitter": "lord_kobal"
	}
	
	var quizz = 
	{
		"turn": 1
	}
	
	var turn = 
	{
		"question": "WTF ?",
		"choices": ["obiwan", "pancake", "giant rodent", "mothership"]
	}

})();
