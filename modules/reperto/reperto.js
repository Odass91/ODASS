(function()
{
	
	/** 
	 * 
	 * TODO : 
	 * 		-> suppression de filtre
	 * 		-> sauvegarde des favoris
	 *    	-> ajustement de la liste de suggestions de mot-clefs
	 * 
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
		    	reperto.experiences = data.experiences;
		    	
		    	reperto.display = {};
		    	reperto.display.idees = reperto.idees;
		    	reperto.display.experiences = reperto.experiences;

		    	reperto.tagThesaurus(reperto.thesaurus);
		    	
		    }).
		    error(function(data, status) 
		    {
		    	console.log("Erreur lors de la recuperation du fichier json")
		    });
			
		};
		

		this.tagThesaurus = function(thesaurus)
		{
			this.availableFilters = {"keywords": []};
			
			/** Construit la liste de mots clefs */
			
			this.idees.forEach(function(idee)
			{
				idee.keywords.forEach(function(keyword)
				{
					if (this.availableFilters.keywords.indexOf(keyword) == -1)
					{
						this.availableFilters.keywords.push(keyword);
					}
				}, this);
			
			}, this);
			
			return;
		};
		
		this.obtainExperiencesForIdea = function(idea)
		{
			var experiences = [];
			
			idea.experiences.forEach(function(experience)
			{
				experiences.push(this.obtainExperienceObjectFromId(experience.id));
			}, this);
			
			return experiences;
		};
		
		this.obtainExperienceObjectFromId = function(id)
		{
			var experience = JSON.search(this.experiences,  '//*[id/text()="' + id + '"]');
			if (experience)
			{
				experience = experience[0];
			}
			else
			{
				console.log("ERROR", id, this.experiences);
			}
			return experience;
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
			this.display.section.title = section.text;
			this.display.section.description = section.description;
			this.display.chapter = {};
		};
		
		this.selectChapter = function(chapter)
		{
			this.display.idees = [];
			this.gatherIdeas(chapter);
			this.updateInitiatives();
			
			this.display.chapter = {};
			this.display.chapter.title = chapter.text;
			this.display.chapter.description = chapter.description;
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
