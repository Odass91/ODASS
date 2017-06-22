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
