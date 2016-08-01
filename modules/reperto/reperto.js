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
		this.initiatives_gmap = null;
	
		var reperto = this;
		$http.get("data/repertoire.json").
	    success(function(data, status) 
	    {
	    	reperto.ecologie = data.thesaurus;
	    	reperto.idees = data.idees;
	    	reperto.initiatives = data.initiatives;
	    	
//	    	console.log(reperto.initiatives);
	    }).
	    error(function(data, status) 
	    {
	    	console.log("Erreur lors de la recuperation du fichier json")
	    });
		
		/** Thesaurus data */
		this.data = 
		{
			
		};

		/** 
		 *  CREATION DES ARBRES POUR CHAQUE THESAURUS
		 *  INITIALISATION DES EVENEMENTS 
		 *  */
		this.loadThesaurus = function()
		{
//			var reperto = this;			
//			
//			var ecologieVizTree = $('#thesaurus-ecologie-tree').jstree(
//			{ 
//				'core': 
//				{
//				    'data': reperto.thesaurus
//				}
//			});
//			
//			$('#thesaurus-ecologie-tree').on('changed.jstree', function (e, data) 
//			{
//				reperto.selectThesaurusItem(data, reperto.thesaurus);
//			});

			this.tagThesaurus(reperto.thesaurus);
		};
		
		/** Tag du thesaurus : ALGO
		 *  -----------------------------------------------------------------------------------------------------------------------
		 * 		rajouter pour chaque initiative la liste de tous les noeuds du thesaurus qui peuvent pointer dessus.
		 *     -> pour chaque noeud initiative (i_noeud):
		 *     ---> a. recherche de tous les noeuds (t_noeud) du thesaurus qui pointent dessus 
		 *     ---> b. rajouter l'id des t_noeuds dans la clef 'tags' de l'i_noeud
		 *     ---> c. pour chaque t_noeud, parcours remontant de l'arbre jusqu'à la racine 
		 *     -------> d. pour chaque noeud parent (p_t_noeud), 
		 *     -------> e. rajout de son id dans la clef tags du i_noeud 
		 *     
		 *     EXEMPLE
		 *     ---------------------------------------------------------------------------------------------------------------------
		 *     Thesaurus
		 *        |_ CATEGORY_A
		 *           |_CATEGORY_A_1
		 *              |__{"id": 1}
		 *              
		 *     Initiative
		 *        |_ init {id: 1, tags []}
		 *        
		 *     Etape a. recherche ==> [CATEGORY_A_1]
		 *           b. ajout de 'CATEGORY_A_1' dans la clef tags : init {id:1, tags:['CATEGORY_A_1']}
		 *           c. recherche des ascendants de 'CATEGORY_A_1'
		 *           d. Father(CATEGORY_A_1) ==> CATEGORY_A 
		 *           e. ==> init {id:1, tags:['CATEGORY_A_1', 'CATEGORY_A']}
		 *     */
		this.tagThesaurus = function(thesaurus)
		{
			return;
//			this.initiatives.forEach(function(initiative)
//			{
//				if (! initiative.tags)
//				{
//					initiative.tags = [];
//				}
//				if (! initiative.keywords)
//				{
//					initiative.keywords = [];
//				}
//				if (! initiative.geoloc)
//				{
//					initiative.geoloc = "";
//				}
//				/** etape a.*/
//				var thesaurusItems = JSON.search(thesaurus, '//*[initiatives/id/text()="' + initiative.id + '"]');
//
//				/** etape b.*/
//				thesaurusItems.forEach(function(node)
//				{
//					var parentNode = node;
//					
//					/** etape b.*/
//					if (node.id !== undefined && initiative.tags.indexOf(node.id) == -1)
//					{
//						initiative.tags.push(node.id);
//					}
//					
//					if (node.parent != "#")
//					{
//						/** etape c.*/
//						while (parentNode.parent != "#")
//						{
//							/** etape d.*/
//							parentNode = JSON.search(thesaurus, '//*[id="' + parentNode.parent + '"]');
//							parentNode = parentNode[0];
//							
//							/** etape e.*/
//							if (parentNode.id !== undefined && initiative.tags.indexOf(parentNode.id) == -1)
//							{
//								initiative.tags.push(parentNode.id);
//							}
//						}
//					}
//				}, this);
//			}, this);
		};
		
		/** 
		 * 
		 * RECHERCHE DES INITIATIVES CORRESPONDANT A UN FILTRE DONNE POUR UN THESAURUS DONNE 
		 * 
		 *  -> ON CONSTRUIT UN NOUVEL ARBRE A PARTIR DES THESAURUS FILTRE
		 *  -> L'AFFICHAGE DES INITIATIVES EST MIS A JOUR
		 *  
		 *  CONSTRUCTION DE L'ARBRE : 
		 *   
		 * 
		 * */
		this.filterThesaurus = function(thesaurus, domId, options)
		{
			var filteredThesaurus = [];
			var matching_i_noeuds = [];
			var added_t_noeuds = {};
			var i_noeuds = this.initiatives;
			var matchingKeyType = (thesaurus.type == "geoloc") ? "geoloc" : "keywords";
			
			if (this.activeFilters[thesaurus.type].length == 0)
			{
				this.initiatives.forEach(function(initiative)
				{
					initiative[matchingKeyType] = [];
					filteredThesaurus = thesaurus.tree;
				}, this);
			}
			else
			{
				/** parcours des filtres */
				this.activeFilters[thesaurus.type].forEach(function(filter)
				{
					var t_nodes_matching_filter = JSON.search(thesaurus.tree, "//*[keywords/text()='" + filter + "']");
					
					t_nodes_matching_filter.forEach(function(t_node)
					{
						var i_nodes_tagged_with_t_node = JSON.search(this.initiatives, "//*[tags/text()='" + t_node.id + "']");
						matching_i_noeuds = matching_i_noeuds.concat(i_nodes_tagged_with_t_node);
						
						i_nodes_tagged_with_t_node.forEach(function(i_node)
						{
							i_node.filtered = true;
						}, this);
					}, this); 
					
				}, this);	
			}
	
			if (this.activeFilterCount == 0)
			{
				this.filteredInitiativeList = this.initiatives;				
			}
			else
			{
				this.filteredInitiativeList = this.filteredInitiativeList.concat(matching_i_noeuds);	
			}
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
			this.initiatives.forEach(function(i_node){delete i_node.filtered;}, this)
		};
		
		/** Affiche les initiatives passées en paramètre et cache les autres */
		this.updateInitiatives = function(i_nodes)
		{
//			$(".initiative-item").hide();
//			$(".jstree-node a").removeClass("filter-match");
//			
//			i_nodes.forEach(function(initiative)
//			{
//				if (this.activeFilterCount == 0)
//				{
//					$("#initiative-" + initiative.id).show();
//				}
//				if (initiative.filtered)
//				{
//					$("#initiative-" + initiative.id).show();
//					if (this.activeFilterCount > 0)
//					{
//						var matchingNode = JSON.search(this.initiatives, "//*[id/text()='" + initiative.id + "']");
//						if (matchingNode.length > 0)
//						{
//							matchingNode = matchingNode[0];
//							matchingNode.tags.forEach(function(matchingThesaurusItem)
//							{
//								$("#" + matchingThesaurusItem + ">a").addClass("filter-match");
//							}, this);
//						}
//					}
//				}
//			}, this);
//			
		
		};
		
		
		/** Utilisé lors de la sélection d'un item dans un thésaurus */
		this.selectThesaurusItem = function(jstree_event, thesaurus)
		{
			if (jstree_event.node.parents.length > 2)
			{
				this.selectIdee(jstree_event, thesaurus);
			}
			else if (jstree_event.node.parents.length > 1)
			{
				this.selectChapitre(jstree_event, thesaurus);
			}
			else if (jstree_event.node.parents.length >= 0)
			{
				this.selectPartie(jstree_event, thesaurus);
			}
			else
			{
			}
			
			var thesaurusItemId = jstree_event.node.id;
			var initiativeList = this.initiatives;
			
			if (this.filteredInitiativeList.length > 0)
			{
				initiativeList = this.filteredInitiativeList;
			}
			initiativeList = JSON.search(this.initiatives, '//*[tags/text()="' + thesaurusItemId + '"]');
			
			this.updateInitiatives(initiativeList);
			this.updateInitiativesMap(initiativeList);
			
		};
		
		
		this.selectIdee = function(jstree_event, thesaurus)
		{
			var ideeNode = JSON.search(thesaurus, '//*[id/text()="' + jstree_event.node.id + '"]');
			
			$("#titre_idee").html(ideeNode[0].text);
			$("#contenu_idee").html(ideeNode[0].description);
			
			if (jstree_event.action != "deselect_all")
			{
				
				var chapitre, partie;
				var chapitreNode, partieNode;
				var array_length = jstree_event.node.parents.length;
				
				for (var i = 0; i < array_length - 2; i++)
				{
					chapitre = jstree_event.node.parents[i];
					partie = jstree_event.node.parents[i+1];
					
					if (chapitre)
					{
						if (chapitre != "#")
						{
							chapitreNode = JSON.search(thesaurus, '//*[id/text()="' + chapitre + '"]');
						}
						$("#titre_chapitre").html(chapitreNode[0].text);
						$("#contenu_chapitre").html(chapitreNode[0].description);
					}
					
					if (partie)
					{
						if (partie != "#")
						{
							partieNode = JSON.search(thesaurus, '//*[id/text()="' + partie + '"]');
						}
						$("#titre_partie").html(partieNode[0].text);
						$("#contenu_partie").html(partieNode[0].description);
					}
					
				}
			}
		};
		
		this.selectChapitre = function(jstree_event, thesaurus)
		{
			$("#titre_idee").html("");
			$("#contenu_idee").html("");
			
			if (jstree_event.action != "deselect_all")
			{
				var partie;
				var chapitreNode, partieNode;
				
				chapitreNode = JSON.search(thesaurus, '//*[id/text()="' + jstree_event.node.id + '"]');
				$("#titre_chapitre").html(chapitreNode[0].text);
				$("#contenu_chapitre").html(chapitreNode[0].description);
				
				var array_length = jstree_event.node.parents.length;
				
				for (var i = 0; i < array_length - 1; i++)
				{
					partie = jstree_event.node.parents[i];
					
					if (partie && partie != "#")
					{
						partieNode = JSON.search(thesaurus, '//*[id/text()="' + partie + '"]');
						$("#titre_partie").html(partieNode[0].text);
						$("#contenu_partie").html(partieNode[0].description);
					}
				}
			}
		};
		
		this.selectPartie = function(jstree_event, thesaurus)
		{
			$("#titre_idee").html("");
			$("#titre_chapitre").html("");
			$("#contenu_idee").html("");
			$("#contenu_chapitre").html("");
			
			if (jstree_event.action != "deselect_all")
			{
				var partie;
				var partieNode;
				partieNode = JSON.search(thesaurus, '//*[id/text()="' + jstree_event.node.id + '"]');
				$("#titre_partie").html(partieNode[0].text);
				$("#contenu_partie").html(partieNode[0].description);
			}
		};
		
		/*** GESTION DES FILTRES ****/
		
		/** construit la liste de tous les mots clefs disponible pour le filtrage des thesaurus */
		this.gatherAvailableFilters = function(thesaurus)
		{
//			var keywords = [], geoloc = [];
//			
//			keywords = JSON.search(thesaurus, "//keywords").sort();
//			
//			var keywordsSeen = [], geolocSeen = [];
//			
//			keywords.forEach(function(key)
//			{
//				if (key !== undefined && keywordsSeen.indexOf(key) == -1)
//				{
//					keywordsSeen.push(key);
//				}
//			});
//
//			return keywordsSeen;
		};
		
		
		/** Construit la liste des mots clefs accessibles à l'utilisateur à partir de son entrée clavier */
		
		this.searchFilter = function(type, nodeId, keyEvent)
		{
			var value = $("#" + nodeId).val();
			value = value ? value + keyEvent.key : keyEvent.key;
			
			this.matchedFilters[type] = this.availableFilters[type].filter(function(filterItem){
				return filterItem.match(value)
			});
		};
		
		this.removeFilter = function(type, filter, additive)
		{

			this.filteredInitiativeList = [];
			this.resetInitiatives();
			
			var index = this.activeFilters[type].indexOf(filter);
			if (index != -1)
			{
				this.activeFilters[type].splice(index, 1);
				
				this.activeFilterCount--;
				
				if (type=="keywords")
				{
					this.filterThesaurus(this.thesaurus, "#thesaurus-ecologie-tree", {"additive": additive, "remove": filter});
				}
			}
			this.updateInitiatives(this.filteredInitiativeList);
		};
		
		this.addFilter = function(type, item, additive)
		{
			this.filteredInitiativeList = [];
			this.resetInitiatives();
			if (item || this.matchedFilters[type])
			{
				var filter = item ? item : this.matchedFilters[type][0];
				if (this.activeFilters[type].indexOf(filter) == -1)
				{
					this.activeFilters[type].push(filter);
					this.activeFilterCount++;
				}
				if (type=="keywords")
				{
					this.filterThesaurus(this.thesaurus, "#thesaurus-ecologie-tree", {"additive": additive, "add": true});
				}
				this.matchedFilters[type] = [];
				$("#add-" + type).val("");
			}
			this.updateInitiatives(this.filteredInitiativeList);
		};
		
		this.saveInitiative = function(initiative)
		{
			initiative.favorite = true;
			this.savedInitiativeList[initiative.id] = initiative;
			this.savedInitiativeList.length = Object.keys(this.savedInitiativeList).length - 1;
		};
		
		this.removeSavedInitiative = function(initiative)
		{
			initiative.favorite = false;
			delete this.savedInitiativeList[initiative.id];
			this.savedInitiativeList.length = Object.keys(this.savedInitiativeList).length - 1;
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
			
			this.updateInitiatives(this.initiatives);
			this.updateInitiativesMap(this.initiatives);
			
			this.availableFilters = 
			{
					"keywords": this.gatherAvailableFilters(this.thesaurus)
			}
			
			this.filteredInitiativeList = [];
			this.savedInitiativeList = {};
			this.savedInitiativeList.length = 0;
			
			/** MAP INITIALISATION */
			

		}
		
		this.initMap = function() 
		{
			return;
			var paris = new google.maps.LatLng(48.858273,2.3473697);

			var map = new google.maps.Map(document.getElementById('map'), 
			{
				center: paris,
				zoom: 5
			});
			
			return map;
		}
		
		this.updateInitiativesMap = function(initiativesList)
		{
//			this.initiatives_gmap = this.initMap();
//			
//			initiativesList.forEach(function(initiative)
//			{
//				this.addMarker(this.geoloc[initiative.geoloc], this.initiatives_gmap, initiative);
//			}, this);
		};
		
	
		
		this.addMarker = function(place, map, initiative)
		{
			var infoWindow = new google.maps.InfoWindow(
			{
				"content": "<h3>" + initiative.label + "</h3><p>"+initiative.description+"</p>"
			});
			
			
			this.markerList[initiative] = new google.maps.Marker(
			{
				map: map,
				position: place
			});

			google.maps.event.addListener(this.markerList[initiative], 'click', function() 
			{
				infoWindow.open(map, this.markerList[initiative]);
			});
		};
		
		this.highlightInitiative = function(initiative)
		{
			if (this.markerList[initiative])
			{
				this.markerList[initiative].setAnimation(google.maps.Animation.BOUNCE);
				setTimeout(function()
				{
					this.markerList[initiative].setAnimation(null);
				}, 2000)
			}
			this.initiatives_gmap.setCenter(this.geoloc[initiative.geoloc]);
			this.initiatives_gmap.setZoom(8);
		};
		
		this.init();
	
	}]);

	odass.directive("filtersBox", function(){return{restrict: 'E', templateUrl: 'modules/reperto/filters-box.html'};});
	odass.directive("thesaurus", function(){return{restrict: 'E', templateUrl: 'modules/reperto/thesaurus.html'};});
	odass.directive("initiativesBox", function(){return{restrict: 'E', templateUrl: 'modules/reperto/initiatives-box.html'};});
	
})();
