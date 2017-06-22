var Chapitre = function(data)
{
	
};
var Experience = function(data)
{
	this.displayed = true;
}

var Guide = function(id, groupement_id)
{
	this.id = id;
	this.gcid = groupement_id;
};

Guide.prototype.nom = "";
Guide.prototype.description = "";

Guide.prototype.setup = function(data)
{
	this.thesaurus = new Thesaurus().setup(data.thesaurus);
	this.idees = new Array();
	data.idees.forEach(function(idee)
	{
		var idee = new Idee().setup(idee);
	}, this);
};


var Idee = function(data)
{
	this.displayed = true;
	this.experiences = [];
};

Idee.prototype.setup = function(data)
{
	this.id = data.id;
	this.chapter_id = data.parent;
	this.titre = data.titre;
	this.description = data.description;
	this.descriptionLongue = data.descriptionLongue;
	this.experiences = new Array();
	data.experiences.forEach(function(experience)
	{
		
	}, this);
};
var Partie = function (data)
{
	this.chapitres = [];
};
var Thesaurus = function(data)
{
	this.parties = [];
};
(function()
{
	var odass = angular.module("odass", ['ngSanitize', 'html5.sortable', 'rzModule', 'ui.tree', 'xeditable', 'slick', 'ngFileUpload']);
	
	odass.config(['$httpProvider', function($httpProvider) 
	{
		  
        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
	}]);
    
    odass.config(function ($locationProvider)
    {
        $locationProvider.html5Mode(false).hashPrefix("!");
    });
	
	angular.module("odass").controller('OdassController', ['$http', '$location', '$scope','Upload', function($http, $location, $scope, Upload)
	{
		this.backgrounds = 
		[
		 	"vitrine-background.jpg", 
			"vitrine-background-1.jpg",
			"vitrine-background-2.jpg",
			"vitrine-background-3.jpg",
			"vitrine-background-4.jpg",
			"vitrine-background-5.jpg",
			"vitrine-background-6.jpg",
			"vitrine-background-7.jpg",
			"vitrine-background-8.jpg",
			"vitrine-background-9.jpg"
		];
		
		this.backgroundindex = 0;
		
		this.changeBackground = function()
		{
			this.backgroundindex++;

			if (this.backgroundindex == this.backgrounds.length)
			{
				this.backgroundindex = 0;
			}
			$("#page-accueil").css("background-image", "url('images/" + this.backgrounds[this.backgroundindex] + "')");
		}
		
		
		this.init = function()
		{
			this.api_hostname = "http://perso.odass.org";
            if (window.location.hostname.match("odass.org"))
            {
                this.node_hostname = "http://node.odass.org";
            }
            else
            {
                this.node_hostname = "http://127.0.0.1:8080";
            }
			this.user = {"name": "", "modules": ["dashboard", "dubito"]};
			this.module = "page-accueil";
			
			this.debug = (window.location.search.match("debug=true")) ? true : false;
			
			this.moduleQueue = {};
			
			this.config = 
			{
				"google.maps.key": "AIzaSyBhHyThm-0LHPSoC2umkTwWNwDZyMom2Oc"
			};
			
			this.changeModule("page-accueil");
            
			if (window.location.href.match("index-cac"))
			{
				this.user.loggedIn = true;
				this.user.name = "cac";
				this.changeModule("annuaire");
			}
			else
            {
            }
            
            /* DEMO */
            if(window.location.search.match("quiz="))
            {
				this.switchToDubitoDemoMode();
            }
            
            if (! this.user.loggedIn)
			{
				$('#menu-odass-site a#' + this.module + '-item').tab('show');
			}
			else
			{
				$('#menu-odass-backoffice a#' + this.module + '-item').tab('show');
			}
			/*DEBUG mode*/
            
			/**/
		};
		
        this.switchToDubitoDemoMode = function(force)
        {
            this.user.loggedIn = true;
            this.user.name = "demo";
            var options = {"mode": "dubito"};
            if (window.location.search.match("quiz="))
            {
                var quizuuid = window.location.search.split("quiz=");
                quizuuid = quizuuid[1];
                options["quizuuid"] = quizuuid;
            }
            options.mode = "full";
            this.changeModule("dubito", options);
        }
		
		this.debugAPIcall = function()
		{
			var parameters = JSON.parse($("#form-data").val());
			var serverUrl = $("#form-action").val();
			var odass = this;
			
			console.log("debugAPIcall", parameters, serverUrl);
			
			$http.post(serverUrl, parameters).success(function(data)
            {
				odass.callbackSuccessData = "[SUCCESS] Donnees reçues : " + data;
            }).error(function(data)
            {
				odass.callbackFailureData = "[ERROR] Donnees reçues : " + data;
            });	
			
		};
		
		this.login = function()
		{
			this.user.name = $("#userNameInput").val();
			var password = $("#passwordField").val();	
            
            
            if (this.debug)
            {
                this.user.loggedIn = true;
                this.user.name = "david";
                this.user.modules = ["dashboard", "dubito", "wizard"];
                this.changeModule("dubito");
                
                $("#login-popup").modal('hide');
                
                return;
            }
            
            
			var odass = this;
			$http.post(odass.api_hostname + "/api/apilogin", 
			{
				"login": odass.user.name,
				"motdepasse": password
			}).then(
			/**   SERVER ANSWER  */
			function(response)
			{
				if (response.data.message.Statut == "OK")
				{
					odass.user.loggedIn = true;
					odass.user.modules = ["dashboard", "dubito", "wizard"];
					odass.changeModule("dashboard");
					$("#login-popup").modal('hide');
				}
				else
				{					
					switch (response.data.message.Statut)
					{
						case "ERREUR_LOGIN_INCONNU": 
							odass.loginFeedback = "Erreur de connexion : login inconnu.";
							break;
						case "ERREUR_MOTDEPASSE_INCORRECT": 
							odass.loginFeedback = "Erreur de connexion : mot de passe incorrect.";
							break;
						default: 
							odass.loginFeedback = response.data.message.Message
							break;
					}
				}
			},
			/**   SERVER ERROR */
			function(data)
			{
				if (data.status == 404)
				{
					odass.loginFeedback = "Erreur serveur : page non trouvée.";
				}
				if (data.status == 500)
				{
					odass.loginFeedback = "Erreur serveur : exception sur le serveur";
				}
				odass.loginFeedback = data;
			});
		};
		
		
		
		this.logout = function()
		{
			this.user.name = "Anonyme"
			this.user.loggedIn = false;
			this.changeModule("page-accueil");
		};
		
		this.isModule = function(module)
		{
			return (this.module == module);
		};
		
		this.changeModule = function(module, options)
		{
			this.module = module;
			
			if (! this.user.loggedIn)
			{
				$('#menu-odass-site a#' + this.module + '-item').tab('show');
			}
			else
			{
				$('#menu-odass-backoffice a#' + this.module + '-item').tab('show');
			}
			
			if (module != "page-accueil")
            {
                this.initModule(options);
            }
		};
		
		this.initModule = function(options)
		{
			if (! this.moduleQueue[this.module])
			{
				this.moduleQueue[this.module] = true;
			}
			
			if (this.module == "dubito")
			{
				this.moduleQueue["wizard"] = true;
				//console.log("ODASS> broadcast message : ", "wizard");
				$scope.$broadcast('initModule', {"message": "wizard", "options": options});
			}
			//console.log("ODASS> broadcast message : ", this.module);
			$scope.$broadcast('initModule', {"message": this.module, "options": options});
			
			window.setTimeout(this.waitForModulesInit, 500, this, options);
		};
		
		this.waitForModulesInit = function(contexte, options)
		{
			//console.log("WINDOW> waiting for tomorrow ", contexte.moduleQueue);
			if (contexte.moduleQueue && Object.keys(contexte.moduleQueue).length > 0)
			{
				for (key in contexte.moduleQueue)
				{
					$scope.$broadcast('initModule', {"message": key, "options": options});
				}
				window.setTimeout(contexte.waitForModulesInit, 500, contexte, options);
			}
		};
		
		$('#menu-odass-site a, #menu-odass-backoffice a').click(function (e) 
		{
			  e.preventDefault();
			  $(this).tab('show');
		});
		
		this.init();
		
	}]);
	

	odass.directive("pageAccueil", function(){return{restrict: 'E', templateUrl: 'src/app/modules/site/index-odass.html'};});
	odass.directive("pageOutils", function(){return{restrict: 'E', templateUrl: 'src/app/modules/site/outils.html'};});
	odass.directive("pagePartenaires", function(){return{restrict: 'E', templateUrl: 'src/app/modules/site/partenaires.html'};});
	odass.directive("pageServices", function(){return{restrict: 'E', templateUrl: 'src/app/modules/site/services.html'};});
	odass.directive("navbarLoggedOff", function(){return{restrict: 'E', templateUrl: 'src/app/modules/site/navbar.html'};});
	odass.directive("debug", function(){return{restrict: 'E', templateUrl: 'src/app/modules/site/debug.html'};});


	odass.directive("dashboard", function(){return{restrict: 'E', templateUrl: 'src/app/backoffice/dashboard.html'};});
	odass.directive("navbarLoggedIn", function(){return{restrict: 'E', templateUrl: 'src/app/backoffice/navbar.html'};});
	
	
	odass.directive("dubito", function(){return{restrict: 'E', templateUrl: 'src/app/modules/dubito/dubito.html'};});
	odass.directive("wizard", function(){return{restrict: 'E', templateUrl: 'src/app/modules/dubito-wizard/wizard.html'};});
	
	odass.directive("reperto", function(){return{restrict: 'E', templateUrl: 'src/app/modules/reperto/reperto.html'};});

	odass.directive("petitio", function(){return{restrict: 'E', templateUrl: 'src/app/modules/petitio/petitio.html'};});
	
	odass.directive("recoPopup", function(){return{restrict: 'E', templateUrl: 'src/app/backoffice/reco-popup.html'};});
	odass.directive("donatePopup", function(){return{restrict: 'E', templateUrl: 'src/app/backoffice/donate-popup.html'};});
	odass.directive("loginPopup", function(){return{restrict: 'E', templateUrl: 'src/app/backoffice/login-popup.html'};});
	odass.directive("ethiquePopup", function(){return{restrict: 'E', templateUrl: 'src/app/modules/site/ethique-odass.html'};});
	odass.directive("cguPopup", function(){return{restrict: 'E', templateUrl: 'src/app/modules/site/cgu.html'};});
	odass.directive("contactPopup", function(){return{restrict: 'E', templateUrl: 'src/app/modules/site/contact.html'};});
	odass.directive("mentionsLegalesPopup", function(){return{restrict: 'E', templateUrl: 'src/app/modules/site/mentions-legales.html'};});
})();

$(document).ready(function (){
    $("#page-accueil-item").click(function (){
        $('html, body').animate({
            scrollTop: $("body").offset().top
        }, 2000);
    });
    $("#page-outils-item").click(function (){
        $('html, body').animate({
            scrollTop: $("#page-outils").offset().top
        }, 2000);
    });
    $("#page-services-item").click(function (){
        $('html, body').animate({
            scrollTop: $("#page-services").offset().top
        }, 2000);
    });
});

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
			$http.post(odass.hostname + "/api/getquizz/" + game.selectedQuiz.id, {"source": $location.absUrl()}).success(function(data)
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

			$http.post(odass.hostname + "/api/getresponsetour/", 
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
			$http.post(odass.hostname + "/api/getresponsequizz/", game.donnees).success(function(data)
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
			
			$http.post(odass.hostname + "/api/sendrecommendation/", recoParameters).success(function(data)
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
                dubito.switchDemoMode(args.options);
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
        
        
        
        this.obtainCSSforCard = function(quiz, target)
        {
            var cssString = "";
            if (quiz && quiz.theme)
            {
                
                var root = quiz.theme[target];
                if (root.color)
                {
                    cssString += "color:" + root.color + ";";   
                }
                if (root.backgroundColor)
                {
                    cssString += "background-color:" + root.backgroundColor + ";";   
                }
                if (root.imagehref)
                {
                    cssString += "background-image:url('" + root.imagehref + "');"; 
                    cssString += "background-size:cover;";   
                    cssString += "background-repeat:no-repeat;";   
                }
                
                
                return cssString;
            }
        };
        this.switchDemoMode = function(options)
        {
            if (options.mode == 'play')
            {
                this.mode = ['dubito'];
            }
            if (options.mode == 'create')
            {
                this.mode = ['wizard'];   
            }
            if (options.mode == 'full')
            {
                this.mode = ['wizard', 'dubito'];   
            }
            if (options.quizuuid)
            {
                this.loadQuiz(false, options.quizuuid);
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
	        $http.get(odass_app.node_hostname + "/dubito/quiz/list").
		    success(function(data, status) 
		    {
		    	if (data)
		    	{
					that.quizzes = []; 
                    that.quizzesIndex = {};
                    
                    Object.keys(data).forEach(function(quiz_uuid)
                    {
                        var nom = data[quiz_uuid].nom;
                        var scoreList = data[quiz_uuid].score;
                        var averageScore = 0;
                        
                        if (scoreList.length > 0)
                        {
                            scoreList.forEach(function(score)
                            {
                                averageScore += score;
                            }, this);
                            averageScore = averageScore / scoreList.length;
                        }
                        
                        
                        var status = data[quiz_uuid].status;
                        var audience = data[quiz_uuid].audience;
                        var uuid = quiz_uuid;
                        if (status == "live")
                        {
                            that.quizzes.push({"jeu": {"nom": nom, "uuid": quiz_uuid, "score": 0, "audience": audience, "averageScore": averageScore}});
                        }
                        that.quizzesIndex[uuid] = {"nom": nom, "uuid": quiz_uuid, "score": 0, "audience": audience, "averageScore": averageScore};
                        
                    }, that);
		    	}
		    }).
		    error(function(data, status) 
		    {
		    	console.log("Erreur lors de la recuperation du fichier json", data);
		    });
            $('[data-toggle="popover"]').popover();
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
            if (!uuid)
            {
                    return;
            }
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
            dubito.quiz.score = 0;
            dubito.quiz.theme = data.jeu.theme;
            dubito.quiz.conclusion = data.jeu.conclusion;
            
            dubito.quiz.audience = dubito.quizzesIndex[data.jeu.uuid].audience;
            dubito.quiz.averageScore = dubito.quizzesIndex[data.jeu.uuid].averageScore;
            
            /** Game data initialization */
            dubito.turns = data.jeu.tours;
            dubito.turn = 0;
            dubito.card = dubito.turns[dubito.turn];
			dubito.card.currentAnswer = -1;
            
            /** Player initialization */
            dubito.player.classement = 0;
	        
	        // Recommendation parameters
	        dubito.toContacts = [];
	        dubito.toContact = "";
	        dubito.fromContact = "";
            
            
            dubito.displayRecommandation = false;
            dubito.showLongAnswer = false;
            dubito.hasAnswered = false;
            
            $("#quiz-screen").modal();
        };
        
		this.loadQuiz = function(dismissModal, quizuuid)
		{
            var id = quizuuid ? quizuuid : this.selectedQuiz;
			this.fetchJSONQuiz(id);
            
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
			$http.post(odass_app.api_hostname + "/api/getresponsetour/", 
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
			/*$http.post(odass_app.api_hostname + "/api/getresponsequizz/", dubito.donnees).success(function(data)
			{
			       dubito.quiz.message = data.message.commentaire;
			       dubito.player.classement = {};
			       dubito.player.classement.egal = data.message.classement.egal;
			       dubito.player.classement.avant = data.message.classement.avant;
			       dubito.player.classement.apres = data.message.classement.apres;
			       dubito.quiz.players = (parseInt(data.message.classement.egal) + parseInt(data.message.classement.avant) + parseInt(data.message.classement.apres));
			});*/
            
            
            $http.post(odass_app.node_hostname + "/dubito/play/end", {"uuid": dubito.quiz.uuid, "score": dubito.quiz.score}).then(
				/**   SERVER ANSWER  */
				function(response)
				{
                    dubito.fetchQuizzes();
				},
				function (response)
				{
					console.log("Error serveur");
				}
			);
            
            
            if (dubito.quiz.score > 10)
            {
                dubito.quiz.message = dubito.quiz.conclusion.good;
            }
            else if (dubito.quiz.score > 4)
            {
                dubito.quiz.message = dubito.quiz.conclusion.average;
            }
            else
            {
                dubito.quiz.message = dubito.quiz.conclusion.poor;
            }
            
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
            var dubito = this;
            
            var contactList = dubito.toContact.replace(/,/g, " ");
            contactList = contactList.split(" ");
            contactList.forEach(function(contact)
            {
                if (! contact.match(/ +/) && dubito.toContacts.indexOf(contact) == -1)
                {
                    dubito.toContacts.push(contact);
                }
            }, dubito);
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
			$http.post(odass_app.api_hostname + "/api/sendrecommendation/", recoParameters).success(function(data)
            {
            });		
            
            this.displayRecommandation = false;
		};
        
        
        /* CSS FUNCTIONS */
        this.obtainCSSClassFromScore = function()
        {
            if (this.quiz)
            {
                if (this.quiz.score > 10)
                {
                    return "alert-success";
                }
                else if (this.quiz.score > 4)
                {
                    return "alert-warning";
                }
                else
                {
                    return "alert-danger";
                }
                return "alert-default";
            }
            return "alert-default";
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
	

	odass.directive("quizChoice", function(){return{restrict: 'E', templateUrl: 'src/app/modules/dubito/quiz-choice.html'};});
	odass.directive("quizScreen", function(){return{restrict: 'E', templateUrl: 'src/app/modules/dubito/quiz-screen.html'};});
	odass.directive("card", function(){return{restrict: 'E', templateUrl: 'src/app/modules/dubito/card.html'};});
	odass.directive("cardResult", function(){return{restrict: 'E', templateUrl: 'src/app/modules/dubito/card-result.html'};});
	odass.directive("scoreScreen", function(){return{restrict: 'E', templateUrl: 'src/app/modules/dubito/score-screen.html'};});
	
})();

(function()
{
	var odass = angular.module("odass").controller('WizardController', ['$http', '$location', '$scope','Upload', function($http, $location, $scope, Upload)
	{
		var odass_app = $scope.$parent.odass;
		var dubitowizard = this;
        this.cartesOrdonnees = [];
		
		$scope.$on('initModule', function(event, args)
		{
			//console.log("WIZARD> receiving message", args.message);
			if (args.message == "wizard")
			{
				dubitowizard.init();
				delete odass_app.moduleQueue["wizard"];
			}
		});
		
		this.init = function()
		{
			/** GET FAKE DATA */
			var wizard = this;
			this.step = 0;
			this._debugTmpId = 1;
			
			this.refreshGameList();
			this.refreshCardLibrary();
			
			
			/** DATA STRUCTURE */
			this.quiz = null;
			this.sortableOptions = 
			{
				"stop": function(list, dropped_index)
				{
					wizard.updateQuizOnNode();
				}	
			};
            
            
			this.config = 
			{
                "quiz": {"categories": ["santé", "écologie", "politique", "société", "international", "droit", "culture"]},
                "slider":
                {
                    "opacity":
                    {
                        floor: 0,
                        ceil: 100,
                        step: 10,     
                        showTicks: true,
                        showTicksValues: true,
                        onChange: function () 
                        {
                            //wizard.opacity.change = this.brouillon.quiz.value * 10;
                        },
                    }
                }
            }
			this.brouillon = {"quiz":{"jeu":{"cartesOrdonnees": []}}};
			this.mode = "create";
            
            setTimeout(function()
            {
                $('[data-toggle="popover"]').popover();
                
                $('#theme-navigation a').click(function (e) 
                {
            	  e.preventDefault()
            	  $(this).tab('show');
                })
            }, 1000);
		};
		
		this.refreshCardLibrary = function()
        {
            this.library = [];
            var wizard = this;
			$http.get("data/card-list.json").
		    success(function(data, status) 
		    {
                wizard.library = [];
                
                Object.keys(data).forEach(function(cardId)
                {
                    if (data[cardId].id)
                    {
                        wizard.library.push(data[cardId]);
                    }
                });
		    	
		    	wizard.categorieMap = {};
		    	
		    	["santé", "écologie", "politique", "société", "international", "droit", "culture"].forEach(function(categorie)
		    	{
		    		var cartes = JSON.search(wizard.library, '//*[categorie/text()="' + categorie + '"]');
		    		wizard.categorieMap[categorie] = cartes.length;
		    	}, this);
		    	
		    }).
		    error(function(data, status) 
		    {
		    	console.log("Erreur lors de la recuperation du fichier json");
		    });  
        };
		
		/** Methods */
        this.refreshGameList = function()
        {
            var wizard = this;
            $http.get(odass_app.node_hostname + "/dubito/quiz/list").
		    success(function(data, status) 
		    {
		    	wizard.availableQuiz = [];
		    	Object.keys(data).forEach(function(quiz_uuid)
		    	{
                    var nom = data[quiz_uuid].nom;
                    var score = data[quiz_uuid].score;
                    var status = data[quiz_uuid].status;
                    var audience = data[quiz_uuid].audience;
                    var cartes = data[quiz_uuid].cartes;
                    var longueur = data[quiz_uuid].longueur;
                    var uuid = quiz_uuid;
		    		wizard.availableQuiz.push({"nom": nom, "uuid": uuid, "score": score, "audience": audience, "status": status, "cartes": cartes, "longueur":longueur});
		    	}, this);
                
                console.log(wizard.availableQuiz);
		    }).
		    error(function(data, status) 
		    {
		    	console.log("Erreur lors de la recuperation du fichier json");
		    });
            $('[data-toggle="popover"]').popover();
        };
		
		this.selectQuiz = function()
		{
			$("#edit-quiz-choice").modal();
		};
		
		this.editQuiz = function(quizuuid)
		{
			this.orderedQuizList = [];
			this.orderedQuizMap = {};
			console.log(quizuuid);
			if (! quizuuid) 
			{
				this.brouillon.quiz = this.selectedQuiz;
				this.setupOrder();
			}
			else
			{
				this.fetchJSONQuiz(quizuuid);
			}
			
			console.log(this.brouillon.quiz);
			
            this.mode = "edit";
			this.step = 0;
			$("#quiz-dashboard").modal();
		};
		
		this.fetchJSONQuiz = function(uuid)
		{
			var wizard = this;
			$http.get("data/library/quiz-" + uuid + ".json").
		    success(function(data, status) 
		    {
		    	wizard.brouillon.quiz = data;
                console.log(data);
		    	wizard.setupOrder();
                if (wizard.brouillon.quiz.jeu.uuid && wizard.brouillon.quiz.jeu.uuid != "")
                {
                    wizard.step = 1;
                }
                if (wizard.brouillon.quiz.jeu.cartes.length == wizard.brouillon.quiz.jeu.longueur)
                {
                    wizard.step = 2;
                }
		    }).
		    error(function(data, status) 
		    {
		    	console.log("Erreur lors de la recuperation du fichier json");
		    });
		};
        
        this.publishQuiz = function(quiz)
        {
            this.fetchJSONQuiz(quiz.uuid);
            
            var wizard = this;
            window.setTimeout(function()
            {
            	console.log("publishing...");
                quiz.status = "live";
                wizard.brouillon.quiz.jeu.status = "live";
                wizard.updateQuizOnNode();
                wizard.refreshGameList();
            }, 500);
        };
		
        this.obtainShareLink = function(quiz)
        {
            return ("http://" + window.location.hostname + "/?quiz=" + quiz.uuid);
        };
        
		this.createQuiz = function()
		{
			$("#quiz-dashboard").modal();
			
			this.orderedQuizList = [];
			this.orderedQuizMap = {};
			this.step = 0;
			this.brouillon.quiz = 
			{
				"jeu": 
				{
					"nom":"",
                    "status": "draft",
					"uuid":"",
					"presentation":"",
                    "categorie": "",
                    "mot-clefs": [],
					"conclusion": {"good": "", "average": "", "poor": ""},
					"href":"",
					"source":"",
					"encrypt":"",
					"longueur": 12,
					"cartesOrdonnees":
					[
						
					],
					"cartes":
					[
					 	
					],
                    "theme":
                    {
                        "header":
                        {
                            "color": "rgba(0,0,0,0.6)",
                            "backgroundColor": "rgba(0,0,15,0.1)",
                            "imagehref":"data/upload/card-header-default.png"
                        },
                        
                        "body":
                        {
                            "color": "rgba(0,0,0,0.6)",
                            "backgroundColor": "rgba(0,0,15,0.1)",
                            "imagehref":"data/upload/card-body-default.png",
                            "opacity": 50
                        }
                    }
                    
				},
				"tours":
				{
				}
				
			};
			
		};
		
        
        
		this.initArrayFromMissingCards = function()
		{
			var length = 0;
			if (this.brouillon && this.brouillon.quiz && this.brouillon.quiz.jeu && this.brouillon.quiz.jeu.longueur)
			{
				length = this.brouillon.quiz.jeu.longueur - (this.brouillon.quiz.jeu.cartes ? this.brouillon.quiz.jeu.cartes.length : 0 );
			}
			return (new Array(length));
		};
		
		this.setupOptions = function()
		{
			$("#quiz-type").modal("hide");
			$("#quiz-library").modal();
		};
		
		this.setupCategory = function()
		{
			$("#quiz-dashboard").modal();
			$("#quiz-library").modal("hide");
		};
        
        this.isCompleteQuiz = function(quiz)
        {
            return (quiz.jeu.longueur == quiz.jeu.cartes.length);
        };
		
		this.initNewCard = function()
		{
			this.brouillon.carte = 
			{
				"id": "",
				"intitule": 
				{
                    "texte": "Intitulé de la question ?",
                    "image": "data/upload/card-body-default.png",
                    "video": ""
                },
				"choix":
				[
				 	{
				 		"id": "1",
				 		"intitule": "Reponse 1."
				 	},
				 	{
				 		"id": "2",
				 		"intitule": "Reponse 2."
				 	},
				 	{
				 		"id": "3",
				 		"intitule": "Reponse 3."
				 	},
				 	{
				 		"id": "4",
				 		"intitule": "Reponse 4."
				 	}
				],
				"reponse": "1",
				"reponseCourte": "Explication courte",
				"reponseLongue": "Explication longue",
				"references": [],
                "categorie": "",
                "theme":
                {
                    "header":
                    {
                        "backgroundColor": "rgba(0,56,15,0.4)",
                        "color": "rgba(0,0,0,1)",
                        "animation":""
                    },
                    "imagehref":"data/upload/card-body-default.png",
                }
			};
			
			this.createCardOnNode();
		};
		
		this.selectCorrectAnswer = function(carte, choix)
		{
			carte.reponse = choix;
		};
		
		this.addCard = function()
		{			
			this.initNewCard();
			
			this.brouillon.quiz.jeu.cartes.push(this.brouillon.carte);
			this.brouillon.quiz.cardIndex = this.brouillon.quiz.jeu.cartes.length - 1;
			
            this.setupOrder();
			this.updateQuizOnNode();
			
		};
		
		
		/*** LIBRARY  ******/
		
		
		this.openLibrary = function()
		{
			$("#wizard-library").modal();
			$("#quiz-dashboard").modal("hide");
			this.refreshCardLibrary();
		};
		
		this.closeLibrary = function()
		{
			$("#wizard-library").modal("hide");
			$("#quiz-dashboard").modal();
		};
		
		this.loadCard = function()
		{
			this.library.forEach(function(carte)
			{
				if (carte.selected)
				{
					delete carte.selected;
					if (this.brouillon.quiz.jeu.cartes.length < this.brouillon.quiz.jeu.longueur)
					{
						this.brouillon.quiz.jeu.cartes.push(carte);
					}
				}
			}, this);
            
			this.setupOrder();
            this.updateQuizOnNode();
            
			$("#wizard-library").modal("hide");
			$("#quiz-dashboard").modal();
		};
		
		this.displayCardsMatchingCategory = function(categorie)
		{
			this.library.forEach(function(carte)
			{
                if (categorie)
                {
                    if (carte.categorie == categorie)
                    {
                        delete carte.hidden;
                    }
                    else
                    {
                        carte.hidden = true;
                    }
                }
                else
                {
                    delete carte.hidden;
                }
			}, this);
		}
		
		/*** FIN LIBRARY ****/
		

		this.previousCard = function()
		{
            this.saveCard(this.brouillon.quiz.cardIndex);
			if (this.brouillon.quiz.cardIndex > 0)
			{
				this.brouillon.quiz.cardIndex--;
			}
			
			this.brouillon.carte = this.brouillon.quiz.jeu.cartes[this.brouillon.quiz.cardIndex];
		};
		
		this.nextCard = function()
		{
            this.saveCard(this.brouillon.quiz.cardIndex);
            if (this.brouillon.quiz.cardIndex < this.brouillon.quiz.jeu.longueur)
            {
                this.brouillon.quiz.cardIndex++;
                this.brouillon.carte = this.brouillon.quiz.jeu.cartes[this.brouillon.quiz.cardIndex];
            }
                
		};

        this.saveCard = function(index, leave)
        {
            this.brouillon.quiz.jeu.cartes[index] = this.brouillon.carte;
            if (leave)
            {
                $("#quiz-dashboard").modal();
                $("#wizard-quiz-card").modal("hide");
            }
			this.updateCardOnNode();
        };
        
		this.editCard = function(options)
		{
			/** Save old one or make the popup appear */
			
			$("#quiz-dashboard").modal("hide");
			$("#quiz-order").modal("hide");
			$("#wizard-quiz-card").modal();
			
			if (this.brouillon.quiz.jeu.cartes.length == 0)
			{
				this.initNewCard();
				this.brouillon.quiz.jeu.cartes.push(this.brouillon.carte);
				this.brouillon.quiz.cardIndex = 0;
			}
			else
			{
				if (options.index != undefined)
				{
					this.brouillon.quiz.cardIndex = options.index;
					this.brouillon.carte = this.brouillon.quiz.jeu.cartes[options.index];
				}
				
				if (options.id != undefined)
				{
					var index = -1;
				
					this.brouillon.quiz.jeu.cartes.forEach(function (carte)
					{
						index = (carte.id == options.id) ? this.brouillon.quiz.jeu.cartes.indexOf(carte) : index;
					}, this);
					
					if (index != -1)
					{
						this.editCard({"index": index});
					}
				}
			}
			
			this.updateQuizOnNode();
		};

		this.deleteSelectedCards = function()
		{
			this.brouillon.quiz.jeu.cartesOrdonnees.forEach(function(carte)
			{
				if (carte.selected)
				{
					this.deleteCardWithId(carte.id);
				}
			}, this);
			
			this.setupOrder();
		};

		
		this.deleteCardWithId = function(id)
		{
			var index = 0;
			var selectedCard = null;
			var selectedIndex = 0;
		
			this.brouillon.quiz.jeu.cartes.forEach(function(carte)
			{
				if (carte.id == id)
				{
					selectedCard = carte;
					selectedIndex = index;
				}
				index++;
			});
			
			if (selectedCard)
			{
				this.deleteCardWithIndex(selectedIndex);
				
			}
			else
			{
				
			}
			
			this.updateQuizOnNode();
		};
		
		this.deleteCardWithIndex = function(index)
		{
			if (! index)
			{
				index = this.brouillon.quiz.cardIndex;
			}
			var deletedIndex = index;
			var deletedCardId = this.brouillon.quiz.jeu.cartes[this.brouillon.quiz.cardIndex].id;
			if (this.brouillon.quiz.cardIndex == 0)
			{
				this.brouillon.carte = this.brouillon.quiz.jeu.cartes[1];
			}
			else
			{
				this.brouillon.quiz.cardIndex--;
				this.brouillon.carte = this.brouillon.quiz.jeu.cartes[this.brouillon.quiz.cardIndex];
			}
			this.brouillon.quiz.jeu.cartes.splice(deletedIndex, 1);
			
			//this.deleteCardOnServer(deletedCardId);
			this.updateQuizOnNode();
			
		};
		
		this.setupEnding = function()
		{
//			var clonedCard = jQuery.extend(true, {}, this.brouillon.carte);
//			this.brouillon.quiz.cartes.push(clonedCard);
//			this.brouillon.quiz.cardIndex++;
			
			$("#quiz-ending").modal();
			$("#wizard-quiz-card").modal("hide");
		};
		
		this.setupOrder = function()
		{
			if (! this.brouillon.quiz)
			{
				this.createQuiz();
			}
			
			this.brouillon.quiz.jeu.cartesOrdonnees = [];
			
			var wizard = this;
			
			this.brouillon.quiz.jeu.cartes.forEach(function(carte)
			{
				var clonedCard = jQuery.extend(true, {}, carte);
				wizard.brouillon.quiz.jeu.cartesOrdonnees.push(carte);
			});
            
            if (this.brouillon.quiz.jeu.cartes.length == this.brouillon.quiz.jeu.longueur)
			{
				this.step = 2;
			}
			
//			$("#quiz-ending").modal("hide");
//			$("#quiz-order").modal();
		};
		
		this.returnToTitleScreen = function()
		{
            this.refreshGameList();
			$("#quiz-type").modal("hide");
			$("#quiz-library").modal("hide");
			$("#wizard-quiz-card").modal("hide");
			$("#quiz-ending").modal("hide");
			$("#quiz-order").modal("hide");
			
			$("#quiz-dashboard").modal();
		}
		
		this.upload = function(file, target)
        {
            var wizard = this;
            Upload.upload(
            {
                url: odass_app.node_hostname + '/wizard/quiz/upload',
                data: {file: file, 'uuid': wizard.brouillon.quiz.jeu.uuid}
            }).then(function (resp) 
            {
                console.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ', resp.data );
                if (target == 'card')
                {
                    wizard.brouillon.carte.intitule.image = resp.data;
                }
                else
                {
                    wizard.brouillon.quiz.jeu.theme[target].imagehref = resp.data;
                }
                wizard.updateQuizOnNode();
            }, function (resp) 
            {
                console.log('Error status: ' + resp.status);
            }, function (evt) 
            {
                var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
            });
        };
		
		this.leave = function()
		{
            this.refreshGameList();
			$("#quiz-type").modal("hide");
			$("#quiz-library").modal("hide");
			$("#quiz-dashboard").modal("hide");
			$("#wizard-quiz-card").modal("hide");
			$("#quiz-ending").modal("hide");
			$("#quiz-order").modal("hide");
		};

		
		this.saveAndQuit = function()
		{
			var wizard = this;
			
			/*$http.post(odass_app.api_hostname + "/api/updatequiz/" + wizard.brouillon.quiz.id, wizard.brouillon.quiz).success(function(data)
			{
				//
			});*/
			this.leave();
		};
		
		$('#ordering-tabs a').click(function (e) 
		{
		  e.preventDefault()
		  $(this).tab('show')
		});
		
		this.addKeyword = function()
		{
			var keyword = $("#add-keyword").val();
			if (this.brouillon.quiz.jeu.keywords.indexOf(keyword) == -1)
			{
				this.brouillon.quiz.jeu.keywords.push(keyword);
			}
		};
		
		this.removeKeyword = function(keyword)
		{
			if (this.brouillon.quiz.jeu.keywords.indexOf(keyword) != -1)
			{
				var index = this.brouillon.quiz.jeu.keywords.indexOf(keyword);
				this.brouillon.quiz.jeu.keywords.splice(index, 1);
			}
		};
		
		this.addReference = function()
		{
			var reference = $("#add-reference").val();
			if (this.brouillon.carte.references.indexOf(reference) == -1)
			{
				this.brouillon.carte.references.push(reference);
			}
		};
		
		this.removeReference = function(reference)
		{
			if (this.brouillon.carte.references.indexOf(reference) != -1)
			{
				var index = this.brouillon.carte.references.indexOf(reference);
				this.brouillon.carte.references.splice(index, 1);
			}
		};
		
		
		/** ORDERING */
		this.toggleAnchor = function(carte)
		{
			carte.anchored = !carte.anchored;
			this.updateQuizOnNode();
		}
		
		this.updateOrder = function()
		{
			/** Ordre de création */
			for (var i=0; i < this.brouillon.quiz.jeu.cartes.length - 1; i++)
			{
				var currentCarte = this.brouillon.quiz.jeu.cartes[i];
				var nextCarte = (i < this.brouillon.quiz.jeu.cartes.length - 1) ? this.brouillon.quiz.jeu.cartes[i + 1] : null;
				currentCarte.questionSuivante = nextCarte ? nextCarte.id : "#";
				
			}
			
			/** Gestion des contraintes */
			
			this.brouillon.quiz.jeu.ordonnancement = [[]];
			var currentPushIndex = 0;
			
			for (var i=0; i < this.brouillon.quiz.jeu.cartesOrdonnees.length; i++)
			{
				var currentCarte = this.brouillon.quiz.jeu.cartesOrdonnees[i];
				
				if (currentCarte.anchored)
				{
					this.brouillon.quiz.jeu.ordonnancement.push(currentCarte);
					this.brouillon.quiz.jeu.ordonnancement.push([]);
					currentPushIndex += 2;
				}
				else
				{
					this.brouillon.quiz.jeu.ordonnancement[currentPushIndex].push(currentCarte);
				}
			}
			
			this.cartesOrdonnees = this.brouillon.quiz.jeu.cartesOrdonnees;
            this.brouillon.quiz.jeu.tours = [];
			this.brouillon.quiz.jeu.cartesOrdonnees.forEach(function(carte)
            {
                this.brouillon.quiz.jeu.tours.push(carte);
            }, this);
		};
		
		this.log = function(message)
		{
			alert(message);
		};
		
		/** COMMUNICATION AVEC LE SERVEUR NODE */
        
		this.createQuizOnNode = function(name)
		{
            if (this.brouillon.quiz.jeu.uuid && this.brouillon.quiz.jeu.uuid != "")
            {
                this.updateQuizOnNode();
            }
			else
            {
                var wizard = this;
                wizard.brouillon.quiz.jeu.nom = name ? name : wizard.brouillon.quiz.jeu.nom;
                $http.post(odass_app.node_hostname + "/wizard/quiz/creer", {"quiz": wizard.brouillon.quiz}).then
                (
                    /**   SERVER ANSWER  */
                    function(res)
                    {
                        wizard.step = 1;
                        wizard.refreshGameList();
                        wizard.brouillon.quiz.jeu.uuid = res.data;
                    },
                    function (response)
                    {
                        console.log("Error serveur");
                    }
                );
            }
		};
      
		this.updateQuizOnNode = function(description)
		{
			var wizard = this;
			if (description)
            {
                wizard.brouillon.quiz.jeu.presentation = description;
            }
			this.updateOrder();
			$http.post(odass_app.node_hostname + "/wizard/quiz/update", {"quiz": wizard.brouillon.quiz}).then(
				/**   SERVER ANSWER  */
				function(response)
				{
                    wizard.refreshGameList();
					//console.log("Modification du quiz, reponse du serveur : ", response);
				},
				function (response)
				{
					console.log("Error serveur");
				}
			);
		};
        
        this.deleteQuizOnNode = function(uuid)
		{
			var wizard = this;
			$http.get(odass_app.node_hostname + "/wizard/quiz/delete/" + uuid).then(
				/**   SERVER ANSWER  */
				function(response)
				{
                    wizard.refreshGameList();
					//console.log("Suppression du quiz, reponse du serveur : ", response);
				},
				function (response)
				{
					console.log("Error serveur");
				}
			);
		};
        
        this.createCardOnNode = function()
		{
			var wizard = this;
			$http.get(odass_app.node_hostname + "/wizard/card/creer").then
			(
				/**   SERVER ANSWER  */
				function(response)
				{
                    //console.log("reponse de creation carte : ", response);
                    wizard.brouillon.carte.id = response.data;
                },
				function (response)
				{
					console.log("Error serveur");
				}
			);
		};
        
		this.updateCardOnNode = function()
		{
			var wizard = this;
			
			$http.post(odass_app.node_hostname + "/wizard/card/update", {"carte": wizard.brouillon.carte}).then(
				/**   SERVER ANSWER  */
				function(response)
				{
					//console.log("Mise à jour d'une carte, reponse du serveur : ", response);
                    wizard.updateQuizOnNode();
				},
				function (response)
				{
					console.log("Error serveur");
				}
			);
		};
		
		/** COMMUNICATION AVEC LE SERVEUR SYMFONY */
	
		this.createQuizOnSymfony = function(name)
		{
			
			var wizard = this;
			var quizname = name ? name : wizard.brouillon.quiz.jeu.name;
			$http.post(odass_app.api_hostname + "/api/creerquiz", {"nom": quizname}).then(
				/**   SERVER ANSWER  */
				function(data)
				{					
					/** GESTION DE LA REPONSE */
					if (data.data.response.donnees.id && !isNaN(parseInt(data.data.response.donnees.id)))
					{
						wizard.brouillon.quiz.id = parseInt(data.data.response.donnees.id);
						wizard.step = 1;
					}
					//wizard.step = 1;
				},
				function (response)
				{
					console.log("Error serveur");
				}
			);
		};
		
		this.updateQuizOnSymfony = function()
		{
			var wizard = this;
			
			this.updateOrder();

			console.log(this.brouillon.quiz);
			
			$http.post(odass_app.api_hostname + "/api/modifierquiz", wizard.brouillon.quiz.jeu).then(
				/**   SERVER ANSWER  */
				function(response)
				{
					console.log("Modification du quiz, reponse du serveur : ", response);
					/** GESTION DE LA REPONSE */
					if (data.data.response.donnees.id && !isNaN(data.data.response.donnees.id))
					{
						wizard.brouillon.quiz.jeu.uuid = data.data.response.donnees.uuid;
						wizard.step = 1;
					}
				},
				function (response)
				{
					console.log("Error serveur");
				}
			);
		};
		
		this.createCardOnSymfony = function()
		{
			var wizard = this;
			
			$http.post(odass_app.api_hostname + "/api/creercarte", {"id": wizard.brouillon.quiz.id}).then(
				/**   SERVER ANSWER  */
				function(response)
				{
					console.log("Creation d'une carte du quiz, reponse du serveur : ", response);
					wizard.brouillon.carte.id = response.donnees.id;
				},
				function (response)
				{
					console.log("Error serveur");
					wizard.brouillon.carte.id = wizard._debugTmpId;
					wizard._debugTmpId++;
				}
			);
		};
		
		this.updateCardOnSymfony = function()
		{
			var wizard = this;
			
			$http.post(odass_app.hostname + "/api/modifiercarte", wizard.brouillon.carte).then(
				/**   SERVER ANSWER  */
				function(response)
				{
					console.log("Modification d'une carte, reponse du serveur : ", response);
				},
				function (response)
				{
					console.log("Error serveur");
				}
			);
		};
		
		this.deleteCardOnSymfony = function(index)
		{
			var wizard = this;
			var cardId = index ? index : wizard.brouillon.carte.id;
			
			$http.post(odass_app.api_hostname + "/api/supprimercarte", {"id": cardId}).then(
				/**   SERVER ANSWER  */
				function(response)
				{
					console.log("Suppression d'une carte du quiz, reponse du serveur : ", response);
				},
				function (response)
				{
					console.log("Error serveur");
				}
			);
		};
		
		this.deleteQuizOnServer = function(index)
		{
			var wizard = this;
			var quizId = index ? index : wizard.brouillon.quiz.id;
			
			$http.post(odass_app.api_hostname + "/api/supprimerquiz", {"id": quizId}).then(
				/**   SERVER ANSWER  */
				function(response)
				{
					console.log("Suppression d'un quiz, reponse du serveur : ", response);
				},
				function (response)
				{
					console.log("Error serveur");
				}
			);
		};
	
	}]);

	odass.directive("editQuiz", function(){return{restrict: 'E', templateUrl: 'src/app/modules/dubito-wizard/quiz-choice.html'};});
	odass.directive("quizType", function(){return{restrict: 'E', templateUrl: 'src/app/modules/dubito-wizard/quiz-type.html'};});
	odass.directive("quizLibrary", function(){return{restrict: 'E', templateUrl: 'src/app/modules/dubito-wizard/quiz-library.html'};});
	odass.directive("quizDashboard", function(){return{restrict: 'E', templateUrl: 'src/app/modules/dubito-wizard/quiz-dashboard.html'};});
	odass.directive("quizCard", function(){return{restrict: 'E', templateUrl: 'src/app/modules/dubito-wizard/quiz-card.html'};});
	odass.directive("quizEnding", function(){return{restrict: 'E', templateUrl: 'src/app/modules/dubito-wizard/quiz-ending.html'};});
	odass.directive("quizOrder", function(){return{restrict: 'E', templateUrl: 'src/app/modules/dubito-wizard/quiz-order.html'};});
	odass.directive("quizTheme", function(){return{restrict: 'E', templateUrl: 'src/app/modules/dubito-wizard/quiz-theme.html'};});
})();

(function()
{
	
	/** 
	 * */
	var odass = angular.module("odass").controller('RepertoController', ['$http', '$location', "$scope", function($http, $location, $scope)
	{
		var reperto = this;
		
		var odass_app = $scope.$parent.odass;
		
		$scope.$on('initModule', function(event, args)
		{
			if (args.message == "annuaire")
			{
				reperto.init();
                delete odass_app.moduleQueue["annuaire"];
			}
		});
		
		
		$("body").css("background", "url('images/background-ricepaper_v3.png')");		
		
		this.reinit= function()
		{
			this.navigationmode = "tree";  // map | tree | print
			
			this.filteredInitiativeList = [];
			this.savedInitiativeList = {};
			this.savedInitiativeList.length = 0;
			this.panierInitiatives = [];

            this.userFilter = "";
            
			this.display.idees = this.idees;
			this.cache.idees = this.idees;
	    	
	    	this.display.section = null;
	    	this.display.chapitre = null;
	    	
	    	this.display.breadcrumb = {};
	    	
	    	this.display.pager = {"index": 0, "offset": 6};
	    	this.display.pager.pagerItems = new Array(Math.ceil(this.display.idees.length / 6));
	    	
		};
		
		
		this.init = function()
		{
			/** INITIALISATION */

			this.display = {};
            this.userFilter = "";
            
            
			this.navigationmode = "tree";  // map | tree | print
			
			var guideid = "14";
			var gdcid = "";
			
			if (window.location.search.indexOf("guideid") != -1)
			{
				var guideidvalue = window.location.search.split("guideid=")[1];
				guideidvalue = guideidvalue.split("&")[0];
				guideid = guideidvalue;
			}
			if (window.location.search.indexOf("gdcid") != -1)
			{
				var guideidvalue = window.location.search.split("gdcid=")[1];
				guideidvalue = guideidvalue.split("&")[0];
				gdcid = guideidvalue;
			}
			var modetest = false;
			if (window.location.search.indexOf("modetest") != -1)
			{
				var modetestvalue = window.location.search.split("modetest=")[1];
				modetestvalue = modetestvalue.split("&")[0];
				modetest = modetestvalue;
			}
			
			this.guide = new Guide(guideid, gdcid);
			
			
			this.modeTest = modetest;
			this.emailContact = "contact@odass.org";
			
			this.loadIntroduction();
			
			this.filteredActions = [];
			
			this.filter = "";
			
			this.markerMap = {};

			this.activeFilters = [];
			
            this.cache = {};
			
			this.showSummary = false;
			
			this.loadThesaurus();
			
			this.filteredInitiativeList = [];
			this.savedInitiativeList = {};
			this.savedInitiativeList.length = 0;
			this.panierInitiatives = [];
            
            var that = this;
           
            window.setTimeout(function()
            {
                that.reduceIntro();
            }, 5000);
            
            this.mail = 
            {
	            "guideid": "",
	            "gdcid": "",
            
                "contact": 
                {
                    "nom": "",
                    "prenom": "",
                    "mail": "",
                    "tel": ""
                },
                "soumissionneur": 
                {
                    "nom": "",
                    "prenom": "",
                    "mail": "",
                    "tel": ""
                },
                "experience": 
                {
                    "titre": "",
                    "cp": "",
                    "ville": "",
                    "description": "",
                    "portee": "",
                    "reference": {"nom": "", "href": ""},
                    "engagement": "oui"
                }
            };
            
            this.comment = 
            {
        		"guideid": "",
	            "gdcid": "",
        		"titreexperience": "",
        		"contact": 
                {
                    "nom": "",
                    "prenom": "",
                    "mail": "",
                    "tel": ""
                },
                "commentaire":""
            }
        };
        
        this.changeNavigationMode = function(mode)
        {
                this.navigationmode = mode;
                if (mode == 'map')
                {
                    this.refreshMap();
                }
                if (mode == 'tree')
                {
                    //
                }
        }
		
		this.loadIntroduction = function()
		{
			var reperto = this;
			
			$http.get(odass_app.api_hostname + "/api/getjsonintroduction/14").
		    success(function(data, status) 
		    {
		    	if (data)
		    	{
					reperto.display = {};
		    		reperto.display.introduction = {};
		    		reperto.display.introduction.titre = data.titre;
			    	reperto.display.introduction.contenu = data.introduction;
			    	
                    $("#introduction-titre").html(data.titre);
                    $("#introduction-contenu").html(data.introduction);
						
		    	}
		    }).
		    error(function(data, status) 
		    {
		    	console.log("Erreur lors de la recuperation du fichier json");
		    });
		};
        
        this.reduceIntro = function()
        {            
            this.intro_reduced = true;
            $("#guide-intro .panel-body").addClass("animate-disappear");
            $("#guide-intro .panel-body").removeClass("animate-appear");
        }
        
		
		this.expandIntro = function()
        {
            delete this.intro_reduced;
            $("#guide-intro .panel-body").addClass("animate-appear");
            $("#guide-intro .panel-body").removeClass("animate-disappear");
            
        };
        
		
		this.isExpanded = function(id)
		{
			return ($("#" + id).parents(".panel").find(".panel-collapse").hasClass("collapse"));
		};
		
		
		this.toggleExpandedZone = function(id)
		{
			var target=$("#" + id).parents(".panel").find(".panel-collapse");
			
			if (target.hasClass("collapse"))
			{
				target.removeClass("collapse");
			}
			else
			{
				target.addClass("collapse");
			}
		};
        
        this.previousExperience = function(id, n)
        {
            var left =  parseInt($("#" + id).css("left"));
            var width =  Math.ceil(($("#" + id).width()) / n);
            if ((Math.abs(left) + width) < ($("#" + id).width()))
            {
                $("#" + id).animate( {left: "+=" + width}, 1000, function() {});
            }
            else
            {
                $("#" + id).animate( {left: "0"}, 1000, function() {});
            }
        };
        
        this.nextExperience = function(id, n)
        {
            var left =  parseInt($("#" + id).css("left"));
            var width =  Math.ceil(($("#" + id).width()) / n);
            if ((Math.abs(left) + width) < ($("#" + id).width()))
            {
                $("#" + id).animate( {left: "-=" + width}, 1000, function() {});
            }
            else
            {
                $("#" + id).animate( {left: "0"}, 1000, function() {});
            }
        };
                                    
        this.toggleDetails = function(id, item)
        {
            if ($("#" + item + "-" + id + ".info-block").hasClass("active"))
            {
                $(".info-block.active").removeClass("active");
                $(".footer-tab.active").removeClass("active");
            }
            else
            {
                $(".info-block.active").removeClass("active");
                $("#" + item + "-" + id + ".info-block").addClass("active");
                $("#tab-" + item + "-" + id + ".footer-tab").addClass("active");
            }
        }
                                    
		
		this.isPaginationVisible = function(index)
		{
			if (! this.display)
			{
				this.display = {};
			}
			if (! this.display.pager)
			{
				this.display.pager = {"index": 0, "offset": 6};
			}
			var isVisible = (index >= this.display.pager.index && index < (this.display.pager.index + this.display.pager.offset));
			
			return isVisible;
		};
		
		this.setPagerIndex = function(index)
		{
			if (!this.display.pager)
			{
				this.display.pager = {"index": 0, "offset": 6};
			}
			this.display.pager.index = index * this.display.pager.offset;
			
			var startindex = this.display.pager.index;
			var endindex = Math.max(this.display.pager.index + this.display.pager.offset, this.display.idees.length - 1);
			
			for (var index = startindex; index < endindex; index++)
			{
				this.obtainExperiencesForIdea(this.display.idees[index]);
			}
			
		};
		
		this.associateIdeasAndSections = function()
		{
			this.sectionByChapterId = {};
			reperto.thesaurus.nodes.forEach(function(section)
			{
				section.nodes.forEach(function(chapter)
				{
					this.sectionByChapterId[chapter.id] = section;
				}, this);
			}, this);
		};
        
        this.updateCSSClasses = function()
        {
            this.cssClasses = {};
            this.markerIcons = {};
            this.cssColors = {};
            
            this.availableMarkerIcons = ["marker-e34cb8.png", "marker-00aadd.png", "marker-ffc932.png", "marker-5db026.png"];
            this.availableClasses = ["PARTIE_D", "PARTIE_A", "PARTIE_B", "PARTIE_C"];
            this.availableColors = ["rgba(244,118,182,0.9)", "rgba(90,180,243,0.9)", "#ffe188", "rgba(154,202,85,0.9)"];

            
            this.thesaurus.nodes.forEach(function(PARTIE)
            {
                if (! this.cssClasses[PARTIE.id])
                {
                    this.cssClasses[PARTIE.id] = this.availableClasses.pop();
                    this.markerIcons[this.cssClasses[PARTIE.id]] = this.availableMarkerIcons.pop();
                    this.cssColors[this.cssClasses[PARTIE.id]] = this.availableColors.pop();
                }
            }, this);
            
        };
		
		this.loadThesaurus = function()
		{
			var reperto = this;

			$http.get(odass_app.api_hostname + "/api/getjsonthesaurus/14").
		    success(function(data, status) 
		    {
                reperto.markerCount = 0;
		    	
                reperto.thesaurus = data.thesaurus;
		    	reperto.idees = data.idees;
		    	
                reperto.availableFilters = [];
		    	reperto.matchedFilters = [];
		    	reperto.activeFilters = [];
                reperto.matchedExperiences = {};
                
		    	reperto.display.breadcrumb = {};
		    	
		    	if (!reperto.display.pager)
		    	{
		    		reperto.display.pager = {"index": 0, "offset": 6};
		    		reperto.display.pager.pagerItems = new Array(Math.ceil(reperto.display.idees.length / 6));
		    	}

		    	reperto.guide_is_loaded = true;
		    	reperto.setPagerIndex(0);
                
                
                /****
                console.log(reperto.display.idees[0].experiences);
                //reperto.obtainExperiencesForIdea(reperto.display.idees[0]);
                console.log(reperto.display.idees[0].experiences);
                ****/
                
                if (reperto.navigationmode == 'map')
                {
                    reperto.setupMap();
                    reperto.refreshMap(100);
                }
                
                reperto.setupPrint();
                
                
                reperto.updateCSSClasses();
                window.setTimeout(function()
                {
                    $('[data-toggle="tooltip"]').tooltip();
                }, 500);
		    	
		    }).
		    error(function(data, status) 
		    {
		    	console.log("Erreur lors de la recuperation du fichier json")
		    });
			
		};
		
        
        /***********************************************************************
         * FILTER FUNCTIONS
         */
        this.addToAvailableFilter = function(filter)    //filter: {"category": titi, "label": toto}
        {
            var finder = function(element)
            {
                return (element.label.toLowerCase() == filter.label.toLowerCase());
            };
            
            if (reperto.availableFilters.find(finder) == undefined)
            {
                reperto.availableFilters.push(filter);
            }
        };
        
        this.updateMatchedFilters = function()
        {
            var str = this.userFilter.toLowerCase();
            console.log(str);
            var mapper = function(element)
            {
                return element.label.toLowerCase();
            };
            var filterer = function(element)
            {
                return (element.label.toLowerCase().match(str))
            };
            
            if (str.length > 2)
            {
                this.matchedFilters = reperto.availableFilters.filter(filterer).map(mapper);
            }
            else
            {
                this.matchedFilters = [];
            }
            console.log(this.matchedFilters);
        };
        
        
        this.addFilter = function(filter)
        {
            var filterer = function(element)
            {
                if (element.geoloc.ville)
                {
                    return (element.geoloc.ville.toLowerCase() == filter.toLowerCase());
                }
                else
                {
                    return false;
                }
            };
            var finder = function(element)
            {
                return (element.toLowerCase() == filter.toLowerCase());
            };
            
            if (this.activeFilters.length == 0)
            {
               this.activeFilters.push(filter);
            }
            else
            {
                if (this.activeFilters.find(finder) == undefined)
                {
                    this.activeFilters.push(filter);
                }
            }
            this.userFilter = "";
            this.matchedExperiences[filter] = this.display.experiences.filter(filterer);
            
            this.refreshDisplayedExperiments();
            
        };
        
        this.removeFilter = function(filter)
        {
            if (this.activeFilters.indexOf(filter) != -1)
            {
                var filterIndex = this.activeFilters.indexOf(filter);
                this.activeFilters.splice(filterIndex, 1);
                delete this.matchedExperiences[filter];    
            }
            
            this.refreshDisplayedExperiments();
        }
        
        this.refreshDisplayedExperiments = function()
        {
            if ( Object.keys(this.matchedExperiences).length == 0 )
            {
                this.display.experiences.forEach(function(experience)
                {
                    if (experience.marker)
                    {
                        experience.marker.addTo(this.reperto_carte);
                    }
                }, this);
                
                return;
            }
            var filteredExperiences = [];
            this.display.experiences.forEach(function(experience)
            {
                if (experience.marker)
                {
                    this.reperto_carte.removeLayer(experience.marker);
                }
            }, this);
            
            Object.keys(this.matchedExperiences).forEach(function(filter)
            {
                
                this.matchedExperiences[filter].forEach(function(experience)
                {
                    var finder = function(element)
                    {
                        return (element.id == experience.id);
                    };
                    
                    if (filteredExperiences.find(finder) == undefined)
                    {
                        filteredExperiences.push(experience);
                    }
                }, this);
            }, this);
            
            
        
            filteredExperiences.forEach(function(experience)
            {
                if (experience.marker)
                {
                    experience.marker.addTo(this.reperto_carte);
                }
            }, this);
        }
        
		/***********************************************************************
		 * HELPER FUNCTIONS
		 */
		
		
		
		/**********************************************************************/
		
		this.obtainSectionFromChapter = function(chapterid)
		{
			var chapter = this.obtainChapterFromId(chapterid);
			var section = this.obtainSectionFromId(chapter.parent);
			return section.id;
		};
        
		this.obtainChapterFromId = function(chapterid)
		{
			var chapter_slash_chapitre = null;
			this.thesaurus.nodes.forEach(function(section){
				section.nodes.forEach(function(chapter){
					if (chapter.id == chapterid)
					{
						chapter_slash_chapitre = chapter;
					}
				}, this)
			}, this);
			return chapter_slash_chapitre;
		};

		this.obtainSectionFromId = function(sectionid)
		{
			var section_slash_partie = null;
			this.thesaurus.nodes.forEach(function(section)
            {
				if (section.id == sectionid)
				{
					section_slash_partie = section;
				}
			}, this);
			return section_slash_partie;
		};
        
        
        
        this.obtainClassNameFromPartieId = function(partieid)
        {
            return this.classNames[partieid];
        }
		
		
		
		
		
		
		/***********************************************************************
		 * PRINT
		 */
		
		this.setupPrint = function()
		{
			this.printableGuide = 
			{
				"titre": this.thesaurus.titre,
				"description": this.thesaurus.description,
				"parties":
				[
					
				],
				"activeSections": [],
				"activeChapters": [],
				"activeInitiatives": [],
				"initiativesByChapter": {},
				"chaptersBySection": {},
				"indexes": {"sections": {}, "chapters": {}, "initiatives": {}}
			};
		};
		
		
		this.saveInitiative = function(initiative)
		{
			initiative.favorite = true;
			if (this.printableGuide.activeInitiatives.indexOf(initiative) == -1)
			{
				this.printableGuide.activeInitiatives.push(initiative);
				if (! this.printableGuide.initiativesByChapter[initiative.parent])
				{
					this.printableGuide.initiativesByChapter[initiative.parent] = [initiative];
				}
				else
				{
					this.printableGuide.initiativesByChapter[initiative.parent].push(initiative);
				}
			}
		};
		
		this.removeSavedInitiative = function(initiative)
		{
			var index = this.printableGuide.activeInitiatives.indexOf(initiative);
			var index_by_chapter = this.printableGuide.initiativesByChapter[initiative.parent].indexOf(initiative);
			
			delete initiative.favorite;
			if (index >= 0)
			{
				this.printableGuide.activeInitiatives.splice(index, 1);
			}
			if (index_by_chapter >= 0)
			{
				this.printableGuide.initiativesByChapter[initiative.parent].splice(index_by_chapter, 1);
				if (this.printableGuide.initiativesByChapter[initiative.parent].length == 0)
				{
					
				}
			}
		}
		 
		this.refreshPrintableCatalogue = function()
		{
			for (var initiative of this.printableGuide.activeInitiatives)
			{
				if (initiative.parent)
				{
					var chapter = this.obtainChapterFromId(initiative.parent);
					var section = this.obtainSectionFromId(chapter.parent);
					
					if (! this.printableGuide.indexes.chapters[chapter.id])
					{
						this.printableGuide.activeChapters.push(chapter);
						this.printableGuide.indexes.chapters[chapter.id] = chapter;
					}
					
					if (! this.printableGuide.indexes.sections[section.id])
					{
						this.printableGuide.activeSections.push(section);
						this.printableGuide.indexes.sections[section.id] = section;
					}
				}
			}
			
			this.printableGuide.parties = [];
			
			for (var section of this.printableGuide.activeSections)
			{
				this.printableGuide.parties.push(section);
				section.chapitres = [];
				for (var chapitre of this.printableGuide.activeChapters)
				{
					if (chapitre.parent == section.id)
					{
						section.chapitres.push(chapitre);
						chapitre.idees = this.printableGuide.initiativesByChapter[chapitre.id];
					}
				}
				
			}
			
			this.navigationmode = "print";
			
		};
		
		
		/************************************************************************/
		
		this.switchDisplay = function(displaylong, idee)
        {
            idee.displayLong = displaylong;
            if (displaylong == true)
            {
                $(".idee-item").removeClass("focus");
                $("#initiative-" + idee.id).removeClass("col-lg-6");
                $("#initiative-" + idee.id).addClass("col-lg-12");
                
                $("#initiative-" + idee.id).addClass("focus");
            }
            else
            {
                
                $(".idee-item").removeClass("focus");
                $("#initiative-" + idee.id).removeClass("col-lg-12");
                $("#initiative-" + idee.id).addClass("col-lg-6");  
            }
            
            
            $("#experiences-list-carrousel-" + idee.id).animate( {left: "0"}, 1000, function() {});

        };
        
        this.switchMapDisplay = function()
        {
            if (this.mapDisplayLong)
            {
                delete this.mapDisplayLong;
                
                var map_html_content_node = document.getElementById("map-tools-wrapper");
                var map_html_content_node_parent = map_html_content_node.parentNode;
                var map_html_content_target_node = document.getElementById("map-tools-zone");
                
                map_html_content_node = map_html_content_node_parent.removeChild(map_html_content_node);
                map_html_content_target_node.appendChild(map_html_content_node);
                
            }
            else
            {
                var map_html_content_node = document.getElementById("map-tools-wrapper");
                var map_html_content_node_parent = map_html_content_node.parentNode;
                var map_html_content_target_node = document.getElementById("fullsize-map-wrapper");
                
                map_html_content_node = map_html_content_node_parent.removeChild(map_html_content_node);
                map_html_content_target_node.appendChild(map_html_content_node);
                
                this.mapDisplayLong = true;
            }
            this.refreshMap(500);
        };
		
		this.obtainExperiencesForIdeas = function()
		{
			
			var experiences = [];
			var reperto = this;
			
			this.display.idees.forEach(function(idee)
			{
				idee.experiences = 'loading';
				this.obtainExperiencesForIdea(idee);
			}, this);
			
			this.guide_is_loaded = true;
		};
		
		this.obtainExperiencesForIdea = function(idee)
		{
			if (! idee)
			{
				return;
			}
			
			var reperto = this;
            $http.get(odass_app.api_hostname + "/api/getjsonexp/" + idee.id + (reperto.gdcid != "" ? ("/" + reperto.gdcid) : "")).
            success(function(data, status) 
            {
                idee.display = {};
                idee.experiences = [];
                reperto.cache[idee.id] = true;
                if (data.experiences)
                {
                    var expindex = {};
                    data.experiences.forEach(function(experience)
                    {
                        
                        if (! expindex[experience.id] && experience.label && experience.contacts)
                        {
                            experience.display = {};
                            experience.display.format = "court";
                            experience.category = reperto.cssClasses[reperto.obtainSectionFromChapter(idee.parent)];
                            idee.experiences.push(experience);
                            expindex[experience.id] = "loaded";
                            if (experience.geoloc.latitude)
                            {
                                reperto.setupMarker(experience);
                            }
                            if (experience.geoloc.ville)
                            {
                                 reperto.addToAvailableFilter({"label": experience.geoloc.ville, "category": "geoloc"});
                            }
                            reperto.ideeByExperienceId[experience.id] = idee;
                            
                            reperto.display.experiences.push(experience);
                        }
                    });
                }
                else
                {
                    idee.experiences  = [];
                }
            }).
            error(function(data, status) 
            {
                idee.display = {};
                idee.experiences  = [];
                console.log("Erreur lors de la recuperation du fichier json - experiences");
            });
		};
		
        /** MAP */
        
        this.refreshMap = function(timeout)
        {
            var map = this.reperto_carte;
            window.setTimeout(function(){
                map.invalidateSize();
            },timeout);
        };
		
		this.setupMap = function()
		{
			var mymap = L.map('repertomap').setView([48.712, 2.24], 6);
			L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiZGF2aWRsZXJheSIsImEiOiJjaXgxdTJua3cwMDBiMnRwYjV3MGZuZTAxIn0.9Y6c9J5ArknMqcFNtn4skw', {
			    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
			    maxZoom: 18,
			    id: 'davidleray.2f171f1g',
			    accessToken: 'pk.eyJ1IjoiZGF2aWRsZXJheSIsImEiOiJjaXgxdTJua3cwMDBiMnRwYjV3MGZuZTAxIn0.9Y6c9J5ArknMqcFNtn4skw'
			}).addTo(mymap);
			
			this.reperto_carte = mymap;
		};
		
		
		this.setupMarker = function(experience)
		{
			if (this.markerMap[experience.id])
            {
                return;
            }
            if (experience.marker)
            {
                return;
            }
            if (experience.geoloc == {})
            {
                return;
            }
            
            if (! this.reperto_carte)
			{
				this.setupMap();
			}
			
            if (experience.geoloc.latitude && experience.geoloc.longitude)
            {
                var latitude_pos = experience.geoloc.latitude;
                var longitude_pos = experience.geoloc.longitude;
                var icon = L.icon({
                    'iconUrl': 'images/markers/' + this.markerIcons[experience.category]
                });
                var marker = L.marker([latitude_pos, longitude_pos], {"icon": icon});
                
                marker.addTo(this.reperto_carte);
                
                
                this.markerCount++;
                this.activeMarker = null;
                
                experience.marker = marker;
                marker.experience = experience;
                var reperto = this;
                marker.on("click", function(event)
                {
                	event.preventDefault();
                }, this);
                
                this.markerMap[experience.id] = experience;
            }
            
		};
		
		this.isCategorieActive = function(categorie)
		{
			if (! this.activeCategories)
			{
				this.activeCategories = {};
			}
			return (this.activeCategories[categorie.label] != undefined);
		};
		
		this.updateMap = function()
		{
			console.log(this.idees);

			console.log(this.display.idees);
			
			var idee = this.display.idees[0];
			
			console.log(idee);
			console.log(this.display.idees.indexOf(idee));
			console.log(this.idees.indexOf(idee));
			
			function ideesAvecMarkers(idee)
			{
				var experiencesWithMarker = idee.experiences.filter(function(experience){return experience.marker != undefined})
				return (experiencesWithMarker.length > 0 );
				
			}
			var filteredIdees = this.idees.filter(ideesAvecMarkers);
			console.log(filteredIdees);
			filteredIdees.forEach(function(idee)
			{
				var index = this.display.idees.indexOf(idee);
				
				if (index == -1)
				{
					idee.experiences.forEach(function(experience)
					{
						experience.marker.remove();
					});
				}
			}, this);
			
		};
        
        this.centerMap = function(experience)
        {
            if (! this.reperto_carte)
			{
				this.setupMap();
			}
            if (experience.geoloc.latitude && experience.geoloc.longitude)
            {
                this.reperto_carte.setView([experience.geoloc.latitude, experience.geoloc.longitude], 13);
                this.reperto_carte.openPopup(experience.popup);
                
            }
            this.refreshMap(100);
        };
        
        this.centerExperience = function(experience)
        {
            var idee = this.ideeByExperienceId[experience.id];
            var chapter = this.obtainChapterFromId(idee.parent);
            var section = this.obtainSectionFromId(chapter.parent);
            
            $("#thesaurus-tree .panel-collapse").addClass("collapse");
            
            
            $("#thesaurus-tree ." + section.id + " .panel-collapse").removeClass("collapse");
            
            
            $("#tree-chapter-item-" + chapter.id).click();
            
            
        }
		
		this.toggleCategory = function(categorie)
		{
			if (this.activeCategories == undefined)
			{
				this.activeCategories = [];
			}

			if (this.activeCategories[categorie.label] == undefined)
			{
				this.addCategoryToMap(categorie);
				this.activeCategories[categorie.label] = true;
			}
			else
			{
				this.removeCategoryToMap(categorie);
				delete this.activeCategories[categorie.label];
			}
		};
		
		this.addCategoryToMap = function(categorie)
		{
			this.display.idees.forEach(function(idee)
			{
				if (idee.experiences)
				{
					idee.experiences.forEach(function (experience)
					{
						if (this.availableFilters.keywords[experience.category].label == categorie.label)
						{
							experience.marker.addTo(this.reperto_carte).bindPopup("<h3>" + experience.label + "</h3>" + experience.description);
						}
					}, this);
				}
			}, this);
		};
		
		this.removeCategoryToMap = function(categorie)
		{
			this.display.idees.forEach(function(idee)
			{
				if (idee.experiences)
				{
					idee.experiences.forEach(function (experience)
					{
						if (this.availableFilters.keywords[experience.category].label == categorie.label)
						{
							experience.marker.remove();
						}
					}, this);
				}
			}, this);
        };
        
        
		this.isCategorieActive = function(categorie)
		{
			if (! this.activeCategories)
			{
				this.activeCategories = {};
			}
			return (this.activeCategories[categorie.label] != undefined);
		};

		this.tagThesaurus = function(thesaurus)
		{		
			return;
		};
		
		
		
		/** Utilisé lors de la sélection d'un item dans un thésaurus */
		this.selectThesaurus = function()
		{

			this.display.idees = this.idees;

    		this.display.pager.pagerItems = new Array(Math.ceil(this.display.idees.length / 6));
			
			this.display.section = null;
			this.display.chapitre = null;
			this.display.intro = true;
			
			delete this.display.breadcrumb.section;
			delete this.display.breadcrumb.chapitre;
			
			this.setPagerIndex(0);
			
			this.updateMap();
		};
		
		
		this.selectSection = function(section)
		{
			this.display.idees = [];
			this.gatherIdeas(section);
			
			this.display.section = section;
			this.display.chapitre = null;
			this.display.intro = null;
			
			this.display.breadcrumb.section = section.titre;
			delete this.display.breadcrumb.chapitre;
			this.setPagerIndex(0);
			
			this.updateMap();
		};
		
		this.selectChapter = function(section, chapitre)
		{
            
            $(".tree-chapter-item").removeClass("active");
            $("#tree-chapter-item-" + chapitre.id).addClass("active");
            
			this.display.idees = [];
			this.gatherIdeas(chapitre);
			this.refreshMap();

			this.display.intro = null;
			this.display.section = section;
			this.display.chapitre = chapitre;

			this.display.breadcrumb.section = section.titre;
			this.display.breadcrumb.chapitre = chapitre.titre;
			this.setPagerIndex(0);

			
			this.updateMap();
			
		};
		
		this.gatherIdeas = function(section)
		{
			
			var idees = [];
			
			for (var idee of this.idees)
			{
				if (idee.parent == section.id)
				{
					idees.push(idee);
				}
			}
			idees.forEach(function(idee)
			{
				this.display.idees.push(idee);
			}, this);

			if (section.nodes && section.nodes.length > 0)
			{
				section.nodes.forEach(function(node)
				{
					this.gatherIdeas(node);
				}, this);
			}

    		this.display.pager.pagerItems = new Array(Math.ceil(this.display.idees.length / 6));
		};

		this.toggleDisplayInitiative = function(idee)
		{
			
		};
		
		this.updateInitiatives = function(idee)
		{
			

		};
		
		/*** GESTION DES FILTRES ****/
		
		/** construit la liste de tous les mots clefs disponible pour le filtrage des thesaurus */
		this.gatherAvailableFilters = function(thesaurus)
		{
			return [];
		};
		
		
		
		
		this.displaySavedInitiatives = function()
		{
			$(".initiative-item").hide();
			for(var key in this.savedInitiativeList)
			{
				$("#initiative-" + this.savedInitiativeList[key].id).show();
			}
		};
		
		this.exportToPdf = function()
		{
			/* MANUAL VERSION */
//			var doc = new jsPDF();
//			this.panierInitiatives.forEach(function(initiative)
//			{
//				console.log(initiative);
//				doc.addPage();
//				doc.setFontSize(24);
//				doc.text(20,20,initiative.titre, {width: 500});
//				doc.setFontSize(12);
//				doc.text(20,60,initiative.descriptionlongue, {width: 500});
//			}, this);
//			doc.save("repertoire.pdf");
//			
			//

		/* AUTOMATIC VERSION */
		   html2canvas(document.getElementById('printzone'), {
                onrendered: function (canvas) {
                    var data = canvas.toDataURL();
                    var docDefinition = {
                        content: [{
                            image: data,
                            width: 500,
                        }]
                    };
                    pdfMake.createPdf(docDefinition).download("repertoire.pdf");
                }
            });
		};
        
        
        this.submitExperience = function()
        {
            this.mail.guideid = this.guideIdentifiant;
            this.mail.gdcid = this.gdcid;
            var reperto = this;
			
            $http.post(odass_app.api_hostname + "/api/sendrepertorecommendation/", reperto.mail).success(function(data)
            {
            	console.log("suggestion envoyée");
            });	
        }
        
        
        this.submitCommentaire = function()
        {
            this.comment.guideid = this.guideIdentifiant;
            this.comment.gdcid = this.gdcid;
            var reperto = this;
            
            $http.post(odass_app.api_hostname + "/api/sendrepertorecomment/", reperto.comment).success(function(data)
            {
            	console.log("commentaire envoyé");
            });	
        }
	
	}]);

	odass.directive("filtersBox", function(){return{restrict: 'E', templateUrl: 'src/app/modules/reperto/filters-box.html'};});
	odass.directive("thesaurus", function(){return{restrict: 'E', templateUrl: 'src/app/modules/reperto/thesaurus.html'};});
	odass.directive("repertoireIdees", function(){return{restrict: 'E', templateUrl: 'src/app/modules/reperto/repertoire-idees.html'};});
	odass.directive("idees", function(){return{restrict: 'E', templateUrl: 'src/app/modules/reperto/idees.html'};});
	
})();
