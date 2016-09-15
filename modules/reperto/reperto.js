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
		    	reperto.initiatives = data.initiatives;
		    	
		    	reperto.display = {};
		    	reperto.display.idees = reperto.idees;
		    	reperto.display.initiatives = reperto.initiatives;

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
			if (idee.isFocus)
			{
				delete idee.isFocus;
				this.updateInitiatives();
			}
			else
			{
				idee.isFocus = true;
				this.updateInitiatives(idee);
			}
		};
		
		this.updateInitiatives = function(idee)
		{
			this.display.initiatives = [];
			
			var ideeList = idee ? [idee] : this.display.idees;
			
			// On affiche uniquement les expériences liées aux idées affichées
			
			ideeList.forEach(function(idee)
			{
				if (idee.initiatives)
				{
					idee.initiatives.forEach(function(initiativeRef)
					{
						var initiative = null;
						initiative = JSON.search(this.initiatives, '//*[id/text()="' + initiativeRef.id + '"]');
						if (initiative && this.display.initiatives.indexOf(initiative[0]) == -1)
						{
							if (this.activeFilters.keywords.length == 0 || idee.activeFilters != undefined)
							{
								this.display.initiatives.push(initiative[0]);
							}
						}
					}, this);
				}
			}, this);
			
			window.setTimeout(function()
			{
				$(".initiative-item")[0].className += " active";
			}, 500);
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
			this.updateInitiatives();
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
			
			window.setTimeout(function()
			{
				$(".initiative-item")[0].className += " active";
			}, 500);
		}

		
		this.init();
		
		
	
	}]);

	odass.directive("filtersBox", function(){return{restrict: 'E', templateUrl: 'modules/reperto/filters-box.html'};});
	odass.directive("thesaurus", function(){return{restrict: 'E', templateUrl: 'modules/reperto/thesaurus.html'};});
	odass.directive("initiativesBox", function(){return{restrict: 'E', templateUrl: 'modules/reperto/initiatives-box.html'};});
	
})();
