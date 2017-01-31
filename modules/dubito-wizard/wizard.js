(function()
{
	var odass = angular.module("odass").controller('WizardController', ['$http', '$location', '$scope', function($http, $location, $scope)
	{
		var odass_app = $scope.$parent.odass;
		var dubitowizard = this;
		$scope.$on('initModule', function(event, args)
		{
			if (args.message == "wizard")
			{
				dubitowizard.init();
			}
		});
		
		this.init = function()
		{
			/** GET FAKE DATA */
			var wizard = this;
			this.step = 0;
			this._debugTmpId = 1;
			$http.get("data/quiz.json").
		    success(function(data, status) 
		    {
		    	wizard.availableQuiz = data;
		    }).
		    error(function(data, status) 
		    {
		    	console.log("Erreur lors de la recuperation du fichier json");
		    });
			
			
			this.library = [];
			$http.get("data/librairie.json").
		    success(function(data, status) 
		    {
		    	wizard.library = data.cartes;
		    	
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
			
			
			/** DATA STRUCTURE */
			this.quiz = null;
			this.sortableOptions = 
			{
				"stop": function(list, dropped_index)
				{
					wizard.updateQuizOnServer();
				}	
			};
			
			this.quizConfig = 
			{
				"name": "nouveau quiz",
				"description": "Texte introductif",
				"length":  
				{
					"showTicksValues": true,
				    "stepsArray": 
				    [
				      	{value: 12, legend: 'Quiz - 12 questions'},
				      	{value: 36, legend: 'Mini-jeu - 36 questions'},
				      	{value: 108, legend: 'Jeu - 108 questions'}
				    ]
				},
				"categories": ["santé", "écologie", "politique", "société", "international", "droit", "culture"],
				"social": ["facebook", "twitter", "email"]
			};
			
			this.brouillon = {};
			
			this.mode = "create";
		};
		
		
		
		/** Methods */
		
		this.selectQuiz = function()
		{
			$("#edit-quiz-choice").modal();
		};
		
		this.editQuiz = function(quiz)
		{
			this.orderedQuizList = [];
			this.orderedQuizMap = {};
			
			if (!quiz) 
			{
				this.brouillon.quiz = this.selectedQuiz;
			}
			else
			{
				this.brouillon.quiz = quiz;
			}
			this.mode = "edit";
			this.step = 0;
			
			this.setupOrder();
			
			$("#quiz-dashboard").modal();
		};
		
		this.createQuiz = function()
		{
			$("#quiz-dashboard").modal();
			
			this.orderedQuizList = [];
			this.orderedQuizMap = {};
			
			this.brouillon.quiz = 
			{
				"name": "nouveau quiz",
				"length": 12,
				"category": "société",
				"keywords": [],
				"options":
				{
					"vibility": "public",
					"social": ["twitter", "facebook", "mail"]
				},
				"cartesOrdonnees":
				[
					
				],
				"cartes":
				[
				 	
				],
				"renvoi": "",
				"messages":{"good": "", "average": "", "poor": ""},
				"cardIndex": 0
				
			};
			
		};
		
		this.initArrayFromMissingCards = function()
		{
			var length = 0;
			if (this.brouillon && this.brouillon.quiz && this.brouillon.quiz.length)
			{
				length = this.brouillon.quiz.length - (this.brouillon.quiz.cartes ? this.brouillon.quiz.cartes.length : 0 );
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
		
		this.initNewCard = function()
		{
			this.brouillon.carte = 
			{
				"id": "#",
				"intitule": "Intitulé de la question ?",
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
				"references": []
			};
			
			this.createCardOnServer();
		};
		
		this.selectCorrectAnswer = function(carte, choix)
		{
			carte.reponse = choix;
		};
		
		this.addCard = function()
		{			
			this.initNewCard();
			
			this.brouillon.quiz.cartes.push(this.brouillon.carte);
			this.brouillon.quiz.cardIndex = this.brouillon.quiz.cartes.length - 1;
			this.setupOrder();
			
			this.updateQuizOnServer();
			
			if (this.brouillon.quiz.cartes.length == this.brouillon.quiz.length)
			{
				this.step = 2;
			}
			
		};
		
		
		/*** LIBRARY  ******/
		
		
		this.openLibrary = function()
		{
			$("#wizard-library").modal();
			$("#quiz-dashboard").modal("hide");
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
					if (this.brouillon.quiz.cartes.length < this.brouillon.quiz.length)
					{
						this.brouillon.quiz.cartes.push(carte);
					}
				}
			}, this);
			this.setupOrder();
			$("#wizard-library").modal("hide");
			$("#quiz-dashboard").modal();
		};
		
		this.displayCardsMatchingCategory = function(categorie)
		{
			this.library.forEach(function(carte)
			{
				if (carte.categorie.indexOf(categorie) != -1)
				{
					delete carte.hidden;
				}
				else
				{
					carte.hidden = true;
				}
			}, this);
		}
		
		/*** FIN LIBRARY ****/
		

		this.previousCard = function()
		{
			if (this.brouillon.quiz.cardIndex > 0)
			{
				this.brouillon.quiz.cardIndex--;
			}
			
			this.brouillon.carte = this.brouillon.quiz.cartes[this.brouillon.quiz.cardIndex];
		};
		
		this.nextCard = function()
		{
			this.brouillon.quiz.cardIndex++;
			this.brouillon.carte = this.brouillon.quiz.cartes[this.brouillon.quiz.cardIndex];
		};

		this.editCard = function(options)
		{

			/** Save old one or make the popup appear */
			
			$("#quiz-dashboard").modal("hide");
			$("#quiz-order").modal("hide");
			$("#wizard-quiz-card").modal();
			
			if (this.brouillon.quiz.cartes.length == 0)
			{
				this.initNewCard();
				this.brouillon.quiz.cartes.push(this.brouillon.carte);
				this.brouillon.quiz.cardIndex = 0;
			}
			else
			{
				
				if (options.index != undefined)
				{
					this.brouillon.quiz.cardIndex = options.index;
					this.brouillon.carte = this.brouillon.quiz.cartes[options.index];
				}
				
				if (options.id != undefined)
				{
					var index = -1;
				
					this.brouillon.quiz.cartes.forEach(function (carte)
					{
						index = (carte.id == options.id) ? this.brouillon.quiz.cartes.indexOf(carte) : index;
					}, this);
					
					if (index != -1)
					{
						this.editCard({"index": index});
					}
				}
			}
			
			this.updateQuizOnServer();
		};

		this.deleteSelectedCards = function()
		{
			this.brouillon.quiz.cartesOrdonnees.forEach(function(carte)
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
		
			this.brouillon.quiz.cartes.forEach(function(carte)
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
		};
		
		this.deleteCardWithIndex = function(index)
		{
			if (! index)
			{
				index = this.brouillon.quiz.cardIndex;
			}
			var deletedIndex = index;
			var deletedCardId = this.brouillon.quiz.cartes[this.brouillon.quiz.cardIndex].id;
			if (this.brouillon.quiz.cardIndex == 0)
			{
				this.brouillon.carte = this.brouillon.quiz.cartes[1];
			}
			else
			{
				this.brouillon.quiz.cardIndex--;
				this.brouillon.carte = this.brouillon.quiz.cartes[this.brouillon.quiz.cardIndex];
			}
			this.brouillon.quiz.cartes.splice(deletedIndex, 1);
			
			this.deleteCardOnServer(deletedCardId);
			this.updateQuizOnServer();
			
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
			
			this.brouillon.quiz.cartesOrdonnees = [];
			
			var wizard = this;
			
			this.brouillon.quiz.cartes.forEach(function(carte)
			{
				var clonedCard = jQuery.extend(true, {}, carte);
				wizard.brouillon.quiz.cartesOrdonnees.push(carte);
			});
			
//			$("#quiz-ending").modal("hide");
//			$("#quiz-order").modal();
		};
		
		this.returnToTitleScreen = function()
		{
			$("#quiz-type").modal("hide");
			$("#quiz-library").modal("hide");
			$("#wizard-quiz-card").modal("hide");
			$("#quiz-ending").modal("hide");
			$("#quiz-order").modal("hide");
			
			$("#quiz-dashboard").modal();
		}
		
		this.leave = function()
		{
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
			
			$http.post(odass_app.hostname + "/api/updatequiz/" + wizard.brouillon.quiz.id, wizard.brouillon.quiz).success(function(data)
			{
				//
			});
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
			if (this.brouillon.quiz.keywords.indexOf(keyword) == -1)
			{
				this.brouillon.quiz.keywords.push(keyword);
			}
		};
		
		this.removeKeyword = function(keyword)
		{
			if (this.brouillon.quiz.keywords.indexOf(keyword) != -1)
			{
				var index = this.brouillon.quiz.keywords.indexOf(keyword);
				this.brouillon.quiz.keywords.splice(index, 1);
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
			this.updateQuizOnServer();
		}
		
		this.updateOrder = function()
		{
			/** Ordre de création */
			for (var i=0; i < this.brouillon.quiz.cartes.length - 1; i++)
			{
				var currentCarte = this.brouillon.quiz.cartes[i];
				var nextCarte = (i < this.brouillon.quiz.cartes.length - 1) ? this.brouillon.quiz.cartes[i + 1] : null;
				currentCarte.questionSuivante = nextCarte ? nextCarte.id : "#";
				
			}
			
			/** Gestion des contraintes */
			
			this.brouillon.quiz.ordonnancement = [[]];
			var currentPushIndex = 0;
			
			for (var i=0; i < this.brouillon.quiz.cartesOrdonnees.length; i++)
			{
				var currentCarte = this.brouillon.quiz.cartesOrdonnees[i];
				
				if (currentCarte.anchored)
				{
					this.brouillon.quiz.ordonnancement.push(currentCarte);
					this.brouillon.quiz.ordonnancement.push([]);
					currentPushIndex += 2;
				}
				else
				{
					this.brouillon.quiz.ordonnancement[currentPushIndex].push(currentCarte);
				}
			}
			
			//
			
		};
		
		/** COMMUNICATION AVEC LE SERVEUR */
		
		this.createQuizOnServer = function(name)
		{
			
			var wizard = this;
			var quizname = name ? name : wizard.brouillon.quiz.name;
			$http.post(odass_app.hostname + "/api/creerquiz", {"nom": quizname}).then(
				/**   SERVER ANSWER  */
				function(data)
				{
					console.log(data);
					
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
		
		this.updateQuizOnServer = function()
		{
			var wizard = this;
			
			this.updateOrder();

			console.log(this.brouillon.quiz);
			
			$http.post(odass_app.hostname + "/api/modifierquiz", wizard.brouillon.quiz).then(
				/**   SERVER ANSWER  */
				function(response)
				{
					console.log("Modification du quiz, reponse du serveur : ", response);
					/** GESTION DE LA REPONSE */
					if (data.data.response.donnees.id && !isNaN(data.data.response.donnees.id))
					{
						wizard.brouillon.quiz.id = data.data.response.donnees.id;
						wizard.step = 1;
					}
				},
				function (response)
				{
					console.log("Error serveur");
				}
			);
		};
		
		this.createCardOnServer = function()
		{
			var wizard = this;
			
			$http.post(odass_app.hostname + "/api/creercarte", {"id": wizard.brouillon.quiz.id}).then(
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
		
		this.updateCardOnServer = function()
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
		
		this.deleteCardOnServer = function(index)
		{
			var wizard = this;
			var cardId = index ? index : wizard.brouillon.carte.id;
			
			$http.post(odass_app.hostname + "/api/supprimercarte", {"id": cardId}).then(
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
			
			$http.post(odass_app.hostname + "/api/supprimerquiz", {"id": quizId}).then(
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

	odass.directive("editQuiz", function(){return{restrict: 'E', templateUrl: 'modules/dubito-wizard/quiz-choice.html'};});
	odass.directive("quizType", function(){return{restrict: 'E', templateUrl: 'modules/dubito-wizard/quiz-type.html'};});
	odass.directive("quizLibrary", function(){return{restrict: 'E', templateUrl: 'modules/dubito-wizard/quiz-library.html'};});
	odass.directive("quizDashboard", function(){return{restrict: 'E', templateUrl: 'modules/dubito-wizard/quiz-dashboard.html'};});
	odass.directive("quizCard", function(){return{restrict: 'E', templateUrl: 'modules/dubito-wizard/quiz-card.html'};});
	odass.directive("quizEnding", function(){return{restrict: 'E', templateUrl: 'modules/dubito-wizard/quiz-ending.html'};});
	odass.directive("quizOrder", function(){return{restrict: 'E', templateUrl: 'modules/dubito-wizard/quiz-order.html'};});
})();
