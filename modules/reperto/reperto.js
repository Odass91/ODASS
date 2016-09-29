(function()
{
	
	/** 
	 * */
	var odass = angular.module("odass").controller('RepertoController', ['$http', '$location', function($http, $location)
	{
		this.loadThesaurus = function()
		{
			var reperto = this;
			$http.get("data/repertoire.json").
		    success(function(data, status) 
		    {
		    	reperto.thesaurus = data.thesaurus;
		    	reperto.idees = data.idees;
		    	reperto.experiences = {};
		    	
		    	reperto.cache = {};
		    	reperto.cache.idees = data.idees;
		    	
		    	reperto.display = {};
		    	reperto.display.idees = data.idees;
		    	reperto.display.experiences = {};
		    	//reperto.tagThesaurus(reperto.thesaurus);
		    	
		    	
		    	
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
			$http.get("http://perso.odass.org/api/getmotclefs/9").
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
		
		this.obtainExperiencesForIdea = function(idea)
		{
			var experiences = [];
			var reperto = this;

			$http.get("http://perso.odass.org/api/getexperiences/" + idea.id).
		    success(function(data, status) 
		    {
		    	idea.experiences = data;
		    }).
		    error(function(data, status) 
		    {
		    	console.log("Erreur lors de la recuperation du fichier json - experiences");
		    });

			return experiences;
		};
		
		this.obtainExperienceObjectFromId = function(id)
		{
			return {};
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
			
			this.display.section = {};
			this.display.section.titre = section.titre;
			this.display.section.description = section.description;
			this.display.chapter = {};
		};
		
		this.selectChapter = function(chapter)
		{
			this.display.idees = [];
			this.gatherIdeas(chapter);
			this.updateInitiatives();
			
			this.display.chapter = {};
			this.display.chapter.titre = chapter.titre;
			this.display.chapter.description = chapter.description;
		};
		
		this.gatherIdeas = function(section)
		{
			var idees = JSON.search(this.idees, '//*[parent/text()="' + section.id + '"]');
			console.log(section.id, idees)
			
			
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
			
		};
		
		this.removeSavedInitiative = function(initiative)
		{

		}
		
		this.displaySavedInitiatives = function()
		{
			$(".initiative-item").hide();
			
			for(var key in this.savedInitiativeList)
			{
				$("#initiative-" + this.savedInitiativeList[key].id).show();
			}
		}
		
		this.init = function()
		{
			/** INITIALISATION */
			
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
		}

		
		this.init();
		
		
	
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
