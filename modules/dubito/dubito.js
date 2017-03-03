(function()
{
	var odass = angular.module("odass").controller('DubitoController', ['$http', '$location', '$scope', function($http, $location, $scope)
	{
		var odass_app = $scope.$parent.odass;
		var dubito = this;
		$scope.$on('initModule', function(event, args)
		{
			//console.log("DUBITO> receiving message", args.message);
			if (args.message == "dubito")
			{
				dubito.init();
				delete odass_app.moduleQueue["dubito"];
			}
			if (args.options)
            {
                
            }
		});
		
		this.init = function()
		{
			this.player = {"name": "Anonyme", "loggedIn": false};
			this.quiz = {};
			this.turns = [];
			this.currentAnswer = -1; 	//-1 : not answered yet ; 0 : wrong answer ; 1 : correct answer
			this.gameStatus = 0; 		// 0 : intro ; 1 : game active ; 2 : scoring panel
			this.donnees = {};
	        this.height = "600px";
	        
			this.showSummary = false;
			
            this.fetchQuizzes();
	        
	        // Recommendation parameters
	        this.toContacts = [];
	        this.toContact = "";
	        this.fromContact = "";

	        this.selectedQuiz = {};
	        
	        this.computeGraph();
		};
        
        this.switchDemoMode = function(mode)
        {
            if (mode == 'play')
            {
                this.mode = ['dubito'];
            }
            if (mode == 'create')
            {
                this.mode = ['wizard'];   
            }
            if (mode == 'full')
            {
                this.mode = ['wizard', 'dubito'];   
            }
        };
		
		this.fetchQuizzes = function(contexte)
        {
            var that = this;
            if (contexte)
            {
                that = contexte;
            }
            that.quizzes = [];
	        $http.get(odass_app.hostname + "/dubito/quiz/list").
		    success(function(data, status) 
		    {
		    	if (data)
		    	{
					that.quizzes = [];
                    Object.keys(data).forEach(function(quiz_uuid)
                    {
                        that.quizzes.push({"jeu": {"nom": data[quiz_uuid], "uuid": quiz_uuid}});
                    }, that);
		    	}
		    }).
		    error(function(data, status) 
		    {
		    	console.log("Erreur lors de la recuperation du fichier json", data);
		    });
            
	        window.setTimeout(that.fetchQuizzes, 5000, that);
        }
		
		this.selectQuiz = function(quiz_uuid)
		{
			this.selectedQuiz = quiz_uuid;
		}
		
		this.getArrayFromNumber = function(number)
		{
			return (new Array(number));
		}
		
		
		this.fetchJSONQuiz = function(uuid)
		{
			var dubito = this;
			$http.get("data/library/quiz-" + uuid + ".json").
		    success(function(data, status) 
		    {
                dubito.initQuiz(data);
		    	
		    }).
		    error(function(data, status) 
		    {
		    	console.log("Erreur lors de la recuperation du fichier json");
		    });
		};
        
        this.initQuiz = function(data)
        {            
			var dubito = this;
            dubito.href = data.jeu.href;
            
            /** Game metadata initialization */
            dubito.quiz.title = data.jeu.nom;
            dubito.quiz.uuid = data.jeu.uuid;
            dubito.quiz.description = data.jeu.presentation;
            dubito.quiz.questions = data.jeu.tours.length;
            dubito.quiz.players = data.jeu.joueurs;
            dubito.quiz.averageScore = data.jeu.scoreMoyen;
            dubito.quiz.score = 0;
            dubito.quiz.theme = data.jeu.theme;
            
            /** Game data initialization */
            dubito.turns = data.jeu.tours;
            dubito.turn = 0;
            dubito.card = dubito.turns[dubito.turn];
            dubito.showLongAnswer = false;

            /** Player initialization */
            dubito.player.classement = 0;
            
            $("#quiz-screen").modal();
        };
        
		this.loadQuiz = function(dismissModal)
		{
			this.fetchJSONQuiz(this.selectedQuiz);
            
            if (dismissModal)
            {
                $("#quiz-choice").modal('hide');
            }
            
		};
        
        this.loadQuizFromSymfony = function()
        {
            
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
			this.turn = (this.turn + 1) % this.quiz.questions;
			this.hasAnswered = false;
			$http.post(odass_app.hostname + "/api/getresponsetour/", 
			{
                "uuid": this.quiz.uuid,
                "tourId":this.card.id,
				"reponseUtilisateur": this.card.reponseUtilisateur 
			}).success(function(data)
            {
            });

			this.card = this.turns[this.turn];
			this.showLongAnswer = false;

		};
		
		this.startQuiz = function()
		{
		};
		
		this.endQuiz = function()
		{
			var dubito = this;
			$http.post(odass_app.hostname + "/api/getresponsequizz/", dubito.donnees).success(function(data)
			{
			       dubito.quiz.message = data.message.commentaire;
			       dubito.player.classement = {};
			       dubito.player.classement.egal = data.message.classement.egal;
			       dubito.player.classement.avant = data.message.classement.avant;
			       dubito.player.classement.apres = data.message.classement.apres;
			       dubito.quiz.players = (parseInt(data.message.classement.egal) + parseInt(data.message.classement.avant) + parseInt(data.message.classement.apres));
			});
			$("#recap-modal").modal();
		};
		
		this.quit = function()
		{
			$("#recap-modal").modal('hide');
			$("#quiz-card").modal('hide');
			$("#result-success").modal('hide');
			$("#quiz-screen").modal('hide');
			$("#quiz-choice").modal('hide');
		};
		
		this.quitAndRedirect = function()
		{
			window.location.href = dubito.href;
		};
		
		this.replay = function()
		{
			$("#recap-modal").modal('hide');
			$("#quiz-card").modal('hide');
			$("#result-success").modal('hide');
			$("#quiz-screen").modal('hide');
			$("#quiz-choice").modal('show');
		};
		
		this.resetquiz = function()
		{
			this.gameStatus = 0;
		};
		
		this.checkAnswer = function(card, answerIndex)
		{
			if (this.currentAnswer == -1)
			{
				this.currentAnswer = (card.reponse == answerIndex) ? 1 : 0;
				card.reponseUtilisateur = answerIndex;
				this.quiz.score += (card.reponse == answerIndex) ? 1 : 0;
			}
			this.hasAnswered = true;
			
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
            if (card.propositions)
            {
                card.propositions.forEach(function(prop)
                {
                    if (prop.id == card.reponse)
                    {
                        enonce = prop.enonce;
                    }
                });
            }
            if (card.choix)
            {
                card.choix.forEach(function(prop)
                {
                    if (prop.id == card.reponse)
                    {
                        enonce = prop.intitule;
                    }
                });
            }
			return enonce;
		};
		
		this.obtainUserAnsweredEnonceFromCard = function(card)
		{
			var enonce = "";
			if (card.propositions)
            {
                card.propositions.forEach(function(prop)
                {
                    if (prop.id == card.reponseUtilisateur)
                    {
                        enonce = prop.enonce;
                    }
                });
            }
            if (card.choix)
            {
                card.choix.forEach(function(prop)
                {
                    if (prop.id == card.reponseUtilisateur)
                    {
                        enonce = prop.intitule;
                    }
                });
            }
			return enonce;
		};
		
		this.addContactEmail = function()
		{
			this.toContacts.push(this.toContact);
			this.toContact = ""; 
		};
		
		this.removeContact = function(supprIndex)
		{
			this.toContacts.splice(supprIndex, 1);
		};

		this.sendRecommendation = function()
		{
			var recoParameters = {
				"from": this.fromContact,
				"to": this.toContacts,
				"body": "Message personnalise"
			};
			this.displayRecommandation = false;
			$http.post(odass_app.hostname + "/api/sendrecommendation/", recoParameters).success(function(data)
            {
            });			
		};
		
		this.obtainScreenHeight = function()
        {
            var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
            var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
            
            return ("" + ( h / 2 )+ "px"); 
        };
        
        this.computeGraph = function()
        {
        	if (window.localStorage.odassLoggedIn)
        	{
        		var data = 
        		[
					{
						value: 300,
						color:"#622626",
						highlight: "#B53E3E",
						label: "Red"
					},
					{
						value: 50,
						color: "#266226",
						highlight: "#65B53E",
						label: "Green"
					},
					{
						value: 100,
						color: "#25262C",
						highlight: "#3D3E3D",
						label: "Blue"
					}
        		];

        		if (document.getElementById("myChart"))
	        	{
        			var countries = document.getElementById("myChart").getContext("2d");
    	        	new Chart(countries).Pie(data, {});
	        	}
        	}
        }
	}]);
	

	odass.directive("quizChoice", function(){return{restrict: 'E', templateUrl: 'modules/dubito/quiz-choice.html'};});
	odass.directive("quizScreen", function(){return{restrict: 'E', templateUrl: 'modules/dubito/quiz-screen.html'};});
	odass.directive("card", function(){return{restrict: 'E', templateUrl: 'modules/dubito/card.html'};});
	odass.directive("cardResult", function(){return{restrict: 'E', templateUrl: 'modules/dubito/card-result.html'};});
	odass.directive("scoreScreen", function(){return{restrict: 'E', templateUrl: 'modules/dubito/score-screen.html'};});
	
})();
