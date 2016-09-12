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
		
		/** Google maps data */
		this.geoloc = 
		{
			"national": new google.maps.LatLng(48.858273,2.3473697),
			"chaville": new google.maps.LatLng(48.807273, 2.187902),
			"nanterre": new google.maps.LatLng(48.887187, 2.200389),
			"nantes": new google.maps.LatLng(47.215795, -1.551078),
			"notre dame des landes": new google.maps.LatLng(47.375285, -1.705601),
			"hauts de seine": new google.maps.LatLng(48.8399131,2.1009993)
		};
		
		this.markerList = {};
	
		var reperto = this;
		$http.get("data/repertoire.json").
	    success(function(data, status) 
	    {
	    	reperto.ecologie = data.thesaurus;
	    	reperto.idees = data.idees;
	    	reperto.initiatives = data.initiatives;
	    	
	    	reperto.display = {};
	    	reperto.display.idees = reperto.idees;
	    	reperto.display.initiatives = reperto.initiatives;

	    	
	    }).
	    error(function(data, status) 
	    {
	    	console.log("Erreur lors de la recuperation du fichier json")
	    });
		
		
		this.loadThesaurus = function()
		{
			this.tagThesaurus(reperto.thesaurus);
		};
		

		this.tagThesaurus = function(thesaurus)
		{
			return;
		};
		

		this.filterThesaurus = function(thesaurus, domId, options)
		{
			
		};
		
		this.resetThesaurus = function(type)
		{
			
		};
		
		
		/** FONCTIONS ANNEXES & UTILITAIRES */
		
		this.exportAsPdf = function()
		{
			
		};
		
		this.resetInitiatives = function()
		{
			if (this.initiatives)
			{
				this.initiatives.forEach(function(i_node)
				{
					i_node.displayed = true;
				}, this);
			}
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
							this.display.initiatives.push(initiative[0]);
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
		
		this.removeFilter = function(type, filter, additive)
		{


		};
		
		this.addFilter = function(type, item, additive)
		{

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
			console.log("init.");
			/** INITIALISATION */
			
			this.filteredActions = [];
			
			this.availableFilters = 
			{
			    "keywords": [],
			    "geoloc": []
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
			
			this.resetInitiatives();
			
			this.availableFilters = 
			{
					"keywords": this.gatherAvailableFilters(this.thesaurus)
			}
			
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
