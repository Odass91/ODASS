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
			}
		});
		
		
		this.init = function()
		{
			/** INITIALISATION */

			this.display = {};
			
			var guideid = "9";
			
			if (window.location.search.indexOf("guideid") != -1)
			{
				var guideidvalue = window.location.search.split("guideid=")[1];
				guideidvalue = guideidvalue.split("&")[0];
				guideid = guideidvalue;
			}
			
			var modetest = false;
			if (window.location.search.indexOf("modetest") != -1)
			{
				var modetestvalue = window.location.search.split("modetest=")[1];
				modetestvalue = modetestvalue.split("&")[0];
				modetest = modetestvalue;
			}
			
			this.guideIdentifiant = guideid;
			this.modeTest = modetest;
			this.emailContact = "contact@odass.org";
			
			this.loadIntroduction();
			
			this.filteredActions = [];
			
			this.filter = "";
			
			this.availableFilters = 
			{
			    "keywords": []
			};

			this.activeFilters = 
			{
				    "keywords": [],
				    "geoloc": []
			};

			this.activeFilterCount = 0;

			this.matchedFilters = 
			{
				    "keywords": [],
				    "geoloc": []
			};
			
			this.showSummary = false;
			
			this.loadThesaurus();
			
			this.filteredInitiativeList = [];
			this.savedInitiativeList = {};
			this.savedInitiativeList.length = 0;
			this.panierInitiatives = [];
		}
		
		this.loadIntroduction = function()
		{
			var reperto = this;
			
			$http.get(odass_app.hostname + "/api/getjsonintroduction/" + reperto.guideIdentifiant).
		    success(function(data, status) 
		    {
		    	if (data)
		    	{
					reperto.display = {};
		    		reperto.display.introduction = {};
		    		reperto.display.introduction.titre = data.titre;
			    	reperto.display.introduction.contenu = data.introduction;
			    	if ( ! window.localStorage.odassRepertoIntroShown)
					{
			    		$("#introduction-cac").modal({"show": true, "backdrop": "static"});
						$("#introduction-titre").html(data.titre);
						$("#introduction-contenu").html(data.introduction);
						window.localStorage.odassRepertoIntroShown = 0;
					}
			    	else
			    	{
			    		window.localStorage.odassRepertoIntroShown++;
			    		if (window.localStorage.odassRepertoIntroShown == 5)
			    		{
			    			delete window.localStorage.odassRepertoIntroShown;
			    		}
			    	}
		    	}
		    }).
		    error(function(data, status) 
		    {
		    	console.log("Erreur lors de la recuperation du fichier json");
		    });
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
		}
		
		this.isPaginationVisible = function(index)
		{
			if (!this.display)
			{
				this.display = {};
			}
			if (!this.display.pager)
			{
				this.display.pager = {"index": 0, "offset": 5};
			}
			return (index >= this.display.pager.index && index < (this.display.pager.index + this.display.pager.offset));
		};
		
		this.setPagerIndex = function(index)
		{
			if (!this.display.pager)
			{
				this.display.pager = {"index": 0, "offset": 5};
			}
			this.display.pager.index = index * this.display.pager.offset;
			
		};
		
		this.loadThesaurus = function()
		{
			var reperto = this;
			$http.get(odass_app.hostname + "/api/getjsonthesaurus/" + reperto.guideIdentifiant).
		    success(function(data, status) 
		    {
		    	reperto.thesaurus = data.thesaurus;
		    	reperto.idees = data.idees;
		    	reperto.experiences = {};
		    	
		    	reperto.cache = {};
		    	reperto.cache.idees = data.idees;
		    	
		    	reperto.display.idees = data.idees;
		    	reperto.display.experiences = {};
		    	
		    	reperto.display.section = null;
		    	reperto.display.chapitre = null;
		    	
		    	reperto.display.guide = reperto.thesaurus;
		    	reperto.display.intro = true;
		    	
		    	reperto.display.breadcrumb = {};
		    	
		    	if (!reperto.display.pager)
		    	{
		    		reperto.display.pager = {"index": 0, "offset": 5};
		    		reperto.display.pager.pagerItems = new Array(Math.ceil(reperto.display.idees.length / 5));
		    	}
		    	reperto.obtainExperiencesForIdeas();
		    	
		    }).
		    error(function(data, status) 
		    {
		    	console.log("Erreur lors de la recuperation du fichier json")
		    });
			
		};
		

		this.tagThesaurus = function(thesaurus)
		{
			this.availableFilters = {"keywords": []};
			var reperto = this;
			$http.get(odass_app.hostname + "/api/getmotclefs/9").
		    success(function(data, status) 
		    {
		    	reperto.availableFilters = data;
		    }).
		    error(function(data, status) 
		    {
		    	console.log("Erreur lors de la recuperation du fichier json - keywords");
		    });

			
			return;
		};
		
		this.obtainExperiencesForIdeas = function()
		{
			var experiences = [];
			var reperto = this;

			this.display.idees.forEach(function(idee)
			{
				this.obtainExperiencesForIdea(idee);
			}, this);
		};
		
		this.obtainExperiencesForIdea = function(idee)
		{
			//GUIDE_idduguide -> toutes les xps d'un guide
			//
			
			$http.get(odass_app.hostname + "/api/getjsonexp/" + idee.id).
		    success(function(data, status) 
		    {
				idee.display = {};
				
				if (data.experiences)
				{
					idee.display.experiences = data.experiences;
					idee.display.experiences.forEach(function(experience){
						experience.display = {};
						experience.display.format = "court";
					}, this);
				}
				else
				{
					idee.display.experiences  = [];
				}
		    }).
		    error(function(data, status) 
		    {
				idee.display = {};
				idee.display.experiences  = [];
		    	console.log("Erreur lors de la recuperation du fichier json - experiences");
		    });
		};
		
		
		
		/** FONCTIONS ANNEXES & UTILITAIRES */
		
		this.exportAsPdf = function()
		{
		};
		
		/** Utilisé lors de la sélection d'un item dans un thésaurus */
		this.selectThesaurusItem = function(jstree_event, thesaurus)
		{
			
		};
		
		
		this.selectSection = function(section)
		{
			this.display.idees = [];
			this.gatherIdeas(section);
			this.updateInitiatives();
			
			this.display.section = section;
			this.display.chapitre = null;
			this.display.intro = null;
			
			this.display.breadcrumb.section = chapitre.section.titre;
			delete this.display.breadcrumb.chapitre;
			this.setPagerIndex(0);
		};
		
		this.selectChapter = function(section, chapitre)
		{
			this.display.idees = [];
			this.gatherIdeas(chapitre);
			this.updateInitiatives();

			this.display.intro = null;
			this.display.section = null;
			this.display.chapitre = chapitre;

			this.display.breadcrumb.section = section.titre;
			this.display.breadcrumb.chapitre = chapitre.titre;
			this.setPagerIndex(0);
			
		};
		
		this.gatherIdeas = function(section)
		{
			var idees = JSON.search(this.idees, '//*[parent/text()="' + section.id + '"]');
			
			idees.forEach(function(idee)
			{
				if (this.display.idees.indexOf(idee) == -1)
				{
					this.display.idees.push(idee);	
				}
			}, this);
			
			if (section.nodes && section.nodes.length > 0)
			{
				section.nodes.forEach(function(node)
				{
					this.gatherIdeas(node);
				}, this);
			}

    		this.display.pager.pagerItems = new Array(Math.ceil(this.display.idees.length / 5));
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
			
		};
		
		
		/** Construit la liste des mots clefs accessibles à l'utilisateur à partir de son entrée clavier */
		
		this.searchFilter = function(type, nodeId, keyEvent)
		{
		};
		
		this.removeFilter = function(type, item, additive)
		{
			var indexOfKeyword = this.activeFilters.keywords.indexOf(item);
			
			if (indexOfKeyword != -1)
			{
				this.activeFilters.keywords.splice(indexOfKeyword, 1);
				this.display.idees.forEach(function(idee)
				{
					
						if (idee.activeFilters[item])
						{
							delete idee.activeFilters[item];
							this.ideaDisplayed --;
						}
					
				},this);
			}

		};
		
		this.addFilter = function(type, item, additive)
		{
			if (item === undefined)
			{
				return;
			}
			if (! this.ideaDisplayed)
			{
				this.ideaDisplayed = 0;
			}
			if (this.activeFilters.keywords.indexOf(item) == -1)
			{
				this.activeFilters.keywords.push(item);
				this.display.idees.forEach(function(idee)
				{
					if (idee.keywords.indexOf(item) != -1)
					{
						if (idee.activeFilters === undefined)
						{
							idee.activeFilters = {};
						}
						this.ideaDisplayed++;
						idee.activeFilters[item] = true;
					}
				},this);
			}
		};
		
		this.saveInitiative = function(initiative)
		{
			initiative.favorite = true;
			if (this.panierInitiatives.indexOf(initiative) == -1)
			{
				this.panierInitiatives.push(initiative);
			}
		};
		
		this.removeSavedInitiative = function(initiative)
		{
			var index = this.panierInitiatives.indexOf(initiative);
			delete initiative.favorite;
			if (index >= 0)
			{
				this.panierInitiatives.splice(index, 1);
			}
		}
		
		this.displaySavedInitiatives = function()
		{
			$(".initiative-item").hide();
			for(var key in this.savedInitiativeList)
			{
				$("#initiative-" + this.savedInitiativeList[key].id).show();
			}
		}
	
	}]);

	odass.directive("filtersBox", function(){return{restrict: 'E', templateUrl: 'modules/reperto/filters-box.html'};});
	odass.directive("thesaurus", function(){return{restrict: 'E', templateUrl: 'modules/reperto/thesaurus.html'};});
	odass.directive("repertoireIdees", function(){return{restrict: 'E', templateUrl: 'modules/reperto/repertoire-idees.html'};});
	odass.directive("idees", function(){return{restrict: 'E', templateUrl: 'modules/reperto/idees.html'};});
	odass.directive("experiences", function()
	{
		return {
			restrict: 'E',
			scope: {
				idee: '=idee',
				reperto: '=reperto'
			},
			templateUrl: 'modules/reperto/experiences.html'
		};
	});
	
})();
