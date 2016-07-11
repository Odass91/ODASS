(function()
{
	var arena = angular.module("game", ['ngSanitize']);

	arena.controller('GameController', ['$http', '$location', function($http, $location)
	{
		this.player = {"name": "Anonyme", "loggedIn": false};
		this.quizz = {};
		this.turns = [];
		this.currentAnswer = -1; 	//-1 : not answered yet ; 0 : wrong answer ; 1 : correct answer
		this.gameStatus = 0; 		// 0 : intro ; 1 : game active ; 2 : scoring panel
		this.donnees = {};
        this.height = "600px";
        
		this.showSummary = false;
				
        this.quizzes = [
        	{"intitule": "Test David", "played": 1, "score": 5, "id": "TestDavid"}, 
        	{"intitule": "Etat d'Urgence", "played": 1, "score": 3, "id": "EtatDurgence"}, 
        	{"intitule": "Electro-sensibilité", "played": 0, "id": "linky"}
        ];
        
        // nom du quiz à récupérer en paramètre de l'URL
        
        // Recommendation parameters
        this.toContacts = [null, null];
        this.fromContact = "";
        
        // Logging state
        if (window.localStorage.odassLoggedIn)
        {
        	this.player.loggedIn = true;
        	this.player.name = window.localStorage.odassLoggedIn;
        }

        this.selectedQuiz = {"intitule": "Electro-sensibilité", "played": 0, "id": "linky"};
		
		this.selectQuiz = function(quiz)
		{
			this.selectedQuiz = quiz;
		}
		
		this.getArrayFromNumber = function(number)
		{
			return (new Array(number));
		}
		
		this.login = function()
		{
			this.player.name = $("#userNameInput").val();
			this.player.loggedIn = true;
			window.localStorage.odassLoggedIn = this.player.name;
		}
		
		this.logout = function()
		{
			this.player.name = "Anonyme"
			this.player.loggedIn = false;
			delete window.localStorage.odassLoggedIn;
		}
		
		this.loadQuiz = function(dismissModal)
		{
			var game = this;
			$http.post(" http://jeu.odass.org/api/getquizz/" + game.selectedQuiz.id, {"source": $location.absUrl()}).success(function(data)
			{
				game.donnees = data;
				
				game.href = data.donnees.jeu.href;
				
				/** Game metadata initialization */
				game.quizz.title = data.donnees.jeu.nom;
				game.quizz.uuid = data.donnees.jeu.uuid;
				game.quizz.description = data.donnees.jeu.presentation;
				game.quizz.questions = data.donnees.tours.carte.length;
				game.quizz.players = data.donnees.jeu.joueurs;
				game.quizz.averageScore = data.donnees.jeu.scoreMoyen;
				game.quizz.score = 0;

				/** Game data initialization */
				game.turns = data.donnees.tours.carte;
				game.turn = 0;
				game.card = game.turns[game.turn];
				game.showLongAnswer = false;

				/** Player initialization */
				game.player.classement = 0;
//				if (data.joueur)
//				{
//				        game.player.name = data.joueur;
//				        game.player.loggedIn = true;
//				}
//				else
//				{
//				        game.player.name = "Anonyme";
//				        game.player.loggedIn = false;
//				}
				$("#quizz-screen").modal();
				
				if (dismissModal)
				{
					$("#quizz-choice").modal('hide');
				}
			});
		};
		
		this.toggleSummary = function()
		{
			this.showSummary = ! this.showSummary;
		};
		
		this.toggleLongAnswer = function(card)
		{
			this.showLongAnswer = ! this.showLongAnswer;
			if (card && this.showLongAnswer)
			{
				this.currentDisplayedCard = card;
			}
			if (card && ! this.showLongAnswer)
			{
				this.currentDisplayedCard = null;
			}
		};
		
		this.nextTurn = function()
		{
			this.currentAnswer = -1;
			this.turn = (this.turn + 1) % this.quizz.questions;

			$http.post("http://jeu.odass.org/api/getresponsetour/", 
			{
                "uuid": this.quizz.uuid,
                "tourId":this.card.id,
				"reponseUtilisateur": this.card.reponseUtilisateur 
			}).success(function(data)
                        {
                        });

			this.card = this.turns[this.turn];
			this.showLongAnswer = false;

		};
		
		this.startQuizz = function()
		{
		};
		
		this.endQuizz = function()
		{
			var game = this;
			$http.post("http://jeu.odass.org/api/getresponsequizz/", game.donnees).success(function(data)
			{
			       game.quizz.message = data.message.commentaire;
			       game.player.classement = {};
			       game.player.classement.egal = data.message.classement.egal;
			       game.player.classement.avant = data.message.classement.avant;
			       game.player.classement.apres = data.message.classement.apres;
			       game.quizz.players = (parseInt(data.message.classement.egal) + parseInt(data.message.classement.avant) + parseInt(data.message.classement.apres));
			});
			$("#recap-modal").modal();
		};
		
		this.quit = function()
		{
			$("#recap-modal").modal('hide');
			$("#quizz-card").modal('hide');
			$("#result-success").modal('hide');
			$("#quizz-screen").modal('hide');
			$("#quizz-choice").modal('hide');
		};
		
		this.quitAndRedirect = function()
		{
			window.location.href = game.href;
		};
		
		this.replay = function()
		{
			$("#recap-modal").modal('hide');
			$("#quizz-card").modal('hide');
			$("#result-success").modal('hide');
			$("#quizz-screen").modal('hide');
			$("#quizz-choice").modal('show');
		};
		
		this.resetQuizz = function()
		{
			this.gameStatus = 0;
		};
		
		this.checkAnswer = function(card, answerIndex)
		{
			if (this.currentAnswer == -1)
			{
				this.currentAnswer = (card.reponse == answerIndex) ? 1 : 0;
				card.reponseUtilisateur = answerIndex;
				this.quizz.score += (card.reponse == answerIndex) ? 1 : 0;
			}
			
		};
		
		this.isCorrectAnswer = function(card, answerIndex)
		{
			return ((this.currentAnswer != -1) && (card.reponse == answerIndex));
		};
		
		this.obtainSuccessStatusClass = function()
		{
			if (this.currentAnswer == -1) return "";
			if (this.currentAnswer == 0) return "panel-danger";
			if (this.currentAnswer == 1) return "panel-success";
		};
		
		this.obtainCorrectEnonceFromCard = function(card)
		{
			var enonce = "";
			card.propositions.forEach(function(prop)
			{
				if (prop.id == card.reponse)
				{
					enonce = prop.enonce;
				}
			});
			return enonce;
		};
		
		this.obtainUserAnsweredEnonceFromCard = function(card)
		{
			var enonce = "";
			card.propositions.forEach(function(prop)
			{
				if (prop.id == card.reponseUtilisateur)
				{
					enonce = prop.enonce;
				}
			});
			return enonce;
		};
		
		this.addContactEmail = function()
		{
			this.toContacts.push("");
		};

		this.sendRecommendation = function()
		{
			var recoParameters = {
				"from": this.fromContact,
				"to": this.toContacts,
				"body": "Message personnalise"
			};
			console.log("send reco from:", this.fromContact, "to:", this.toContacts);
			
			$http.post("http://jeu.odass.org/api/sendrecommendation/", recoParameters).success(function(data)
            {
            });			
		};
		
		this.obtainScreenHeight = function()
        {
            var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
            var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
            
            return ("" + ( h / 2 )+ "px"); 
        };
		
	
	}]);
    
	
	arena.directive("quizzChoice", function(){return{restrict: 'E', templateUrl: 'quizz-choice.html'};});
	arena.directive("quizzScreen", function(){return{restrict: 'E', templateUrl: 'quizz-screen.html'};});
	arena.directive("card", function(){return{restrict: 'E', templateUrl: 'card.html'};});
	arena.directive("cardResult", function(){return{restrict: 'E', templateUrl: 'card-result.html'};});
	arena.directive("scoreScreen", function(){return{restrict: 'E', templateUrl: 'score-screen.html'};});
	arena.directive("recoPopup", function(){return{restrict: 'E', templateUrl: 'reco-popup.html'};});
	arena.directive("donatePopup", function(){return{restrict: 'E', templateUrl: 'donate-popup.html'};});
	arena.directive("loginPopup", function(){return{restrict: 'E', templateUrl: 'login-popup.html'};});
})();
