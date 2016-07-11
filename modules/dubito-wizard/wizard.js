(function()
{
	var odass = angular.module("odass").controller('WizardController', ['$http', '$location', function($http, $location)
	{
		/** Data Structure */
		this.quiz = null;
		
		this.availableQuiz = 
		[
		 	{
		 		"name": "La guerre des étoiles",
				"length": 9,
				"category": "culture",
				"keywords": ["starwars", "sf"],
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
				 	{
				 		"id": "1",
						"intitule": "Qui est le maître d'Obiwan Kenobi ?",
						"choix":
						[
						 	{
						 		"id": "1",
						 		"intitule": "Anakin Skywalker."
						 	},
						 	{
						 		"id": "2",
						 		"intitule": "Yoda."
						 	},
						 	{
						 		"id": "3",
						 		"intitule": "Qui Gon Jin."
						 	},
						 	{
						 		"id": "4",
						 		"intitule": "Mace Windu."
						 	}
						],
						"reponse": "3",
						"reponseCourte": "C'est Qui Gon Jon !",
						"reponseLongue": "Lui même a été l'apprenti de Maître Yoda.",
						"references": []
				 	},
					{
				 		"id": "2",
						"intitule": "Qui se cache derrière les traits de Darth Sidious ?",
						"choix":
						[
						 	{
						 		"id": "1",
						 		"intitule": "Obiwan Kenobi"
						 	},
						 	{
						 		"id": "2",
						 		"intitule": "Le sénateur Palpatine"
						 	},
						 	{
						 		"id": "3",
						 		"intitule": "Anakin Skywalker"
						 	},
						 	{
						 		"id": "4",
						 		"intitule": "Le comte Dooku"
						 	}
						],
						"reponse": "2",
						"reponseCourte": "C'est le sénateur de l'Ancienne République Palpatine",
						"reponseLongue": "De sénateur, il a été élu chancelier puis s'est fait couronner Empereur entraînant la galaxie dans une période de terreur et de désespoir sous le joug Sith.",
						"references": []
					}
				],
				"renvoi": "",
				"messages":
				{
					"good": "Maitre Jedi : félicitation, la force n'a plus de mystère pour toi !", 
					"average": "Chevalier Jedi : votre maitrise de la force vous permet de manier le sabre laser sans risquer de perdre la tête.", 
					"poor": "Padawan : long à parcourir le chemin reste..."
				}
		 	}
		]
		
		this.quizConfig = 
		{
			"name": "nouveau quiz",
			"length": [12, 24, 36, 48, 60, 72, 84, 96, 108],
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
		
		this.editQuiz = function()
		{
			this.orderedQuizList = [];
			this.orderedQuizMap = {};
			
			this.brouillon.quiz = this.selectedQuiz;
			this.mode = "edit";
			
			$("#quiz-type").modal();
		};
		
		this.createQuiz = function()
		{
			$("#quiz-type").modal();
			
			this.orderedQuizList = [];
			this.orderedQuizMap = {};
			
			this.brouillon.quiz = 
			{
				"name": "nouveau quiz",
				"length": 6,
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
		};
		
		this.selectCorrectAnswer = function(carte, choix)
		{
			carte.reponse = choix;
		};
		
		this.addCard = function()
		{
			/** Save old one or make the popup appear */
			$("#quiz-category").modal("hide");
			$("#wizard-quiz-card").modal();
			
			if (this.mode == "create")
			{
				this.initNewCard();
			}
			else
			{
				this.brouillon.quiz.cardIndex = 0;
				this.brouillon.carte = this.brouillon.quiz.cartes[0];
			}
		};
		

		this.nextCard = function()
		{
			this.brouillon.quiz.cardIndex++;
			this.brouillon.carte = this.brouillon.quiz.cartes[this.brouillon.quiz.cardIndex];
		};

		this.editCard = function(index)
		{
			this.brouillon.quiz.cardIndex = index;
			this.brouillon.carte = this.brouillon.quiz.cartes[index];
		};
		
		this.saveAndAddCard = function()
		{
			var clonedCard = jQuery.extend(true, {}, this.brouillon.carte);
			console.log(clonedCard);
			
			this.brouillon.quiz.cartes.push(clonedCard);
			this.brouillon.quiz.cardIndex++;
			
			
			$http.post(" http://jeu.odass.org/api/updatecard/" + wizard.brouillon.quiz.id, wizard.brouillon.quiz).success(function(data)
			{
				//
			});
			
			this.initNewCard();
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
			
			$("#quiz-ending").modal("hide");
			$("#quiz-order").modal();
		};
		
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
		this.updateOrder = function()
		{
			for (var i=0; i < this.brouillon.quiz.cartes.length - 1; i++)
			{
				var currentCarte = this.brouillon.quiz.cartes[i];
				var nextCarte = (i < this.brouillon.quiz.cartes.length - 1) ? this.brouillon.quiz.cartes[i + 1] : null;
				currentCarte.questionSuivante = nextCarte ? nextCarte.id : "#";
				
			}
			
			this.brouillon.quiz.ordonnancement = [];
			
			for (var i=0; i < this.brouillon.quiz.cartesOrdonnees.length - 1; i++)
			{
				var currentCarte = this.brouillon.quiz.cartesOrdonnees[i];
				
				if (currentCarte.anchored)
				{
					this.brouillon.quiz.ordonnancement.push(currentCarte);
					this.brouillon.quiz.ordonnancement.push([]);
				}
				else
				{
					this.brouillon.quiz.ordonnancement[this.brouillon.quiz.ordonnancement.length - 1].push(currentCarte);
				}
			}
			
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
