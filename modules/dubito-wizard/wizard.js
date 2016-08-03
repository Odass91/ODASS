(function()
{
	var odass = angular.module("odass").controller('WizardController', ['$http', '$location', function($http, $location)
	{
		/** GET FAKE DATA */
		
		var wizard = this;
		this._debugTmpId = 1;
		$http.get("data/quiz.json").
	    success(function(data, status) 
	    {
	    	wizard.availableQuiz = data;
	    }).
	    error(function(data, status) 
	    {
	    	console.log("Erreur lors de la recuperation du fichier json")
	    });
		
		
		/** DATA STRUCTURE */
		var wizard = this;
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
			"description": "",
			"length":  
			{
				"floor": 12,
				"ceil": 108,
			    "step": 12,
		        "noSwitching": true
			},
			"categories": ["santé", "écologie", "politique", "société", "international", "droit", "culture"],
			"social": ["facebook", "twitter", "email"]
		};
		
		this.brouillon = {};
		
		this.mode = "create";
		
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
			
			$("#quiz-type").modal();
		};
		
		this.createQuiz = function()
		{
			$("#quiz-category").modal();
			
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
			
			this.createQuizOnServer();
		};
		
		
		this.setupOptions = function()
		{
			$("#quiz-type").modal("hide");
			$("#quiz-setup").modal();
		};
		
		this.setupCategory = function()
		{
			$("#quiz-category").modal();
			$("#quiz-setup").modal("hide");
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
			
		};
		

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
			$("#quiz-category").modal("hide");
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
					console.log("edit card from given index");
					this.brouillon.quiz.cardIndex = options.index;
					this.brouillon.carte = this.brouillon.quiz.cartes[options.index];
				}
				
				if (options.id != undefined)
				{
					console.log("edit card from given id");
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
			console.log("deleteSelectedCards");
			this.brouillon.quiz.cartesOrdonnees.forEach(function(carte)
			{
				if (carte.selected)
				{
					console.log("Carte a supprimer trouvée !", carte);
					this.deleteCardWithId(carte.id);
				}
			}, this);
			
			this.setupOrder();
		};

		
		this.deleteCardWithId = function(id)
		{
			console.log("Suppression de la carte ", id);
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
			$("#quiz-setup").modal("hide");
			$("#wizard-quiz-card").modal("hide");
			$("#quiz-ending").modal("hide");
			$("#quiz-order").modal("hide");
			
			$("#quiz-category").modal();
		}
		
		this.leave = function()
		{
			$("#quiz-type").modal("hide");
			$("#quiz-setup").modal("hide");
			$("#quiz-category").modal("hide");
			$("#wizard-quiz-card").modal("hide");
			$("#quiz-ending").modal("hide");
			$("#quiz-order").modal("hide");
		};

		
		this.saveAndQuit = function()
		{
			console.log(this.brouillon.quiz);
			
			var wizard = this;
			
			$http.post(" http://jeu.odass.org/api/updatequiz/" + wizard.brouillon.quiz.id, wizard.brouillon.quiz).success(function(data)
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
			
		};
		
		/** COMMUNICATION AVEC LE SERVEUR */
		
		this.createQuizOnServer = function()
		{
			
			var wizard = this;
			
			$http.post("http://jeu.odass.org/api/creerquiz", {"nom": wizard.brouillon.quiz.name}).then(
				/**   SERVER ANSWER  */
				function(response)
				{
					wizard.brouillon.quiz = response.donnees.id;
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
			console.log(wizard.brouillon.quiz);
			
			$http.post("http://jeu.odass.org/api/modifierquiz", wizard.brouillon.quiz).then(
				/**   SERVER ANSWER  */
				function(response)
				{
					console.log("Modification du quiz, reponse du serveur : ", response);
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
			
			$http.post("http://jeu.odass.org/api/creercarte", {"id": wizard.brouillon.quiz.id}).then(
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
			
			$http.post("http://jeu.odass.org/api/modifiercarte", wizard.brouillon.carte).then(
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
			
			$http.post("http://jeu.odass.org/api/supprimercarte", {"id": cardId}).then(
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
			
			$http.post("http://jeu.odass.org/api/supprimerquiz", {"id": quizId}).then(
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
	odass.directive("quizSetup", function(){return{restrict: 'E', templateUrl: 'modules/dubito-wizard/quiz-setup.html'};});
	odass.directive("quizCategory", function(){return{restrict: 'E', templateUrl: 'modules/dubito-wizard/quiz-category.html'};});
	odass.directive("quizCard", function(){return{restrict: 'E', templateUrl: 'modules/dubito-wizard/quiz-card.html'};});
	odass.directive("quizEnding", function(){return{restrict: 'E', templateUrl: 'modules/dubito-wizard/quiz-ending.html'};});
	odass.directive("quizOrder", function(){return{restrict: 'E', templateUrl: 'modules/dubito-wizard/quiz-order.html'};});
})();
