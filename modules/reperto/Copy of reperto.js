(function()
{
	var odass = angular.module("odass").controller('RepertoController', ['$http', '$location', function($http, $location)
	{
		this.data = 
		{
			
			"thesaurus":
			[
				{
					"label": "Ecologie",
					"keywords": ["ecologie"],
					"tree":
					[
					 	{
					 		"id": "1",
					 		"parent": "#",
					 		'state' : { 'opened' : true},
					 		"text": "Que faire personnellement ?",
					 		"keywords": ["ecologie", "solo"],
					 		"description": "L'écologie au quotidien"
					 	},	
			 		 	{
			 		 		"id": "1.1",
					 		"parent": "1",
					 		'state' : { 'opened' : true},
					 		"text": "Manger autrement c’est possible",
					 		"keywords": ["alimentation"],
					 		"description":"La révolution bio.",
					 		"initiatives": [{"id": "1"}, {"id": "2"}]
			 		 	},
			 		 	{
			 		 		"id": "2",
					 		"parent": "1.1",
					 		'state' : { 'opened' : true},
			 		 		"text": "Que faire à plusieurs ?",
			 		 		"keywords": ["ecologie", "groupe"],
			 		 		"description": "Les actions de groupe",
			 		 		"initiatives": [{"id": "3"}]
			 		 	}
					]
				},
				{
					"label": "geolocalisation",
					"keywords": ["geographie"],
					"tree":
					[
					 	{
					 		"id": "1",
					 		"parent": "#",
					 		'state' : { 'opened' : true},
					 		"text": "national",
					 		"keywords": ["france", "national"],
					 		"description": "le pays",
					 		"initiatives": [{"id": "1"}]
					 	},
					 	{
					 		"id": "1.1",
					 		"parent": "1",
					 		'state' : { 'opened' : true},
					 		"text": "île de france",
					 		"keywords": ["ile-de-france", "region"],
					 		"description": "La région île de France"
					 	},
					 	{
					 		"id": "1.1.1",
					 		"parent": "1.1",
					 		'state' : { 'opened' : true},
					 		"text": "Essonne",
					 		"keywords": ["essonne", "departement"],
					 		"description": "Le département de l'Essonne"
					 	},
					 	{
					 		"id": "1.1.1.1",
					 		"parent": "1.1.1",
					 		'state' : { 'opened' : true},
					 		"text": "Palaiseau",
					 		"keywords": ["palaiseau", "ville"],
					 		"description": "La ville de Palaiseau",
					 		"initiatives":
					 		[
					 		 	{"id": "2"},
					 		 	{"id": "3"}
					 		]
					 	}
					 	
					]
				}
			],
				
			"initiatives":
			[
			 	{
			 		"id": "1",
			 		"label": "Recettes végétariennes",
			 		"description": "Pour des idées de recettes végétariennes",
			 		"references": [{"label": "http://www.sosbouffe.fr/recettes-vegetariennes/potages-soupes.html", "href": "http://www.sosbouffe.fr/recettes-vegetariennes/potages-soupes.html"}]
			 	},
			 	{
			 		"id": "2",
			 		"label": "Cueillettes bio",
	 		 		"description": "Les cueillettes aussi peuvent être un moyen très utile pour une découverte et une initiation pour apprendre à apprécier la maturation, la couleur, l’odeur, La provenance ",
	 		 		"references": [
						{"label": "Cueillettes bio dans les Hauts de Seine", "href": " http://www.bioconsomacteurs.org/association/relais-locaux/sophie-watkins/les-fermes-des-yvelines-78"},
						{"label": "Cueillettes bio en Ile de France", "href": "https://amapidf.wordpress.com/vente-de-bio-a-la-ferme/"}
					]
			 	},
			 	{
			 		"id": "3",
			 		"label": "Le minou rose",
			 		"description": "Organisez des plans à trois (ou plus!) dans un décor inspirant somptueux.",
			 		"references": [{"label": "Rendez nous visites", "href": "http://www.sosbouffe.fr/recettes-vegetariennes/potages-soupes.html"}]
			 	}
			]
		};
		
		this.filteredActions = [];
		
		this.filters = {
		    "keywords": [],
		    "geoloc": []
		};

		this.activeFilters = {
			    "keywords": [],
			    "geoloc": []
		};
		
		this.showSummary = false;
		
		/** Transform the JSON object into jstree compliant structure 
		 *  [
		 *      {},
		 *      {},
		 *      ...
		 *  ]
		 * 
		 * */
		this.convertThesaurus = function(jsonData)
		{
			var jstreeArray = [];
			var reperto = this;
			
			jsonData.forEach(function(node, index)
			{
				var firstRankNode = {"id": node.id, "parent": "#", "text": node.label, 'state' : { 'opened' : true}};
				jstreeArray.push(firstRankNode);
				
				if (node.subdirectories)
				{
					var children = reperto.obtainChildNodes(node.subdirectories, node.id);
					jstreeArray = jstreeArray.concat(children);
				}
			});
			
			return jstreeArray
		};

		
		this.obtainChildNodes = function(directory, fatherId)
		{
			var jstreeArray = [];
			var reperto = this;
			directory.forEach(function(node, index)
			{
				
				var firstRankNode = {"id": node.id, "parent": fatherId, "text": node.label, 'state' : { 'opened' : true}};
				if (node.initiatives)
				{
					firstRankNode.text += " (" + node.initiatives.length + ")";
					firstRankNode.icon = "glyphicon glyphicon-check";
				}
				jstreeArray.push(firstRankNode);
				
				if (node.subdirectories)
				{
					var children = reperto.obtainChildNodes(node.subdirectories, node.id);
					jstreeArray = jstreeArray.concat(children);
				}
			});
			return jstreeArray;
		};
		
		/** */
		this.indexThesaurus = function(jsonData)
		{
			var indexedThesaurus = {};
			var reperto = this;
			jsonData.forEach(function(node, index)
			{
				var thesaurusItemContent = {};
				for(key in node)
				{
					thesaurusItemContent[key] = node[key];
				}
				indexedThesaurus[node.id] = thesaurusItemContent;
				if (node.subdirectories)
				{
					reperto.obtainIndexedThesaurusForChildren(indexedThesaurus, node.subdirectories);
				}
			});
			return indexedThesaurus;
			
		}
		
		this.filterThesaurus = function()
		{
			this.indexedFilteredThesaurus = [];
			
			this.activeFilters["keywords"].forEach(function(key)
			{
				this.indexedFilteredThesaurus = this.indexedFilteredThesaurus.concat(JSON.search(this.indexedThesaurus, '//initiatives[keywords/text()="' + key + '"]'));
			}, this);
			
			this.activeFilters["geoloc"].forEach(function(key)
			{
				this.indexedFilteredThesaurus = this.indexedFilteredThesaurus.concat(JSON.search(this.indexedThesaurus, '//initiatives[geoloc/text()="' + key + '"]'));
			}, this);
			
			var convertedIndexed = {};
			var data = [];
			this.indexedFilteredThesaurus.forEach(function(item)
			{
				if (! convertedIndexed[item.id])
				{
					convertedIndexed[item.id] = item;
					data.push(item);
				}
			}, this);
			
			
			var reperto = this;
			
			$('#cac-tree').jstree(true).settings.core.data = reperto.convertThesaurus(data);
			$('#cac-tree').jstree(true).refresh();

			
		};
		
		this.gatherAvailableFilters = function()
		{
			var keywords = [], geoloc = [];
			
			var thesaurus = (this.indexedFilteredThesaurus && this.indexedFilteredThesaurus.length > 0) ? this.indexedFilteredThesaurus : this.indexedThesaurus;
			
			keywords = JSON.search(thesaurus, "//keywords").sort();
			geoloc = JSON.search(thesaurus, "//geoloc").sort();
			
			var keywordsSeen = [], geolocSeen = [];
			
			keywords.forEach(function(key)
			{
				if (key !== undefined && keywordsSeen.indexOf(key) == -1)
				{
					keywordsSeen.push(key);
				}
			});
			
			geoloc.forEach(function(key)
			{
				if (key !== undefined && geolocSeen.indexOf(key) == -1)
				{
					geolocSeen.push(key);
				}
			});

			this.filters.geoloc = geolocSeen;
			this.filters.keywords = keywordsSeen;
		};
		
		this.addFilter = function(filter, type)
		{
			
		};
		
		this.obtainIndexedThesaurusForChildren = function(indexedThesaurus, directory)
		{
			var reperto = this;
			
			directory.forEach(function(node, index)
			{
				var thesaurusItemContent = {};
				for(key in node)
				{
					thesaurusItemContent[key] = node[key];
				}
				indexedThesaurus[node.id] = thesaurusItemContent;
				if (node.subdirectories)
				{
					reperto.obtainIndexedThesaurusForChildren(indexedThesaurus, node.subdirectories);
				}
			});
		};
		
		this.loadThesaurus = function()
		{
			var reperto = this;
			console.log("JSTREE INITIAL DATA", reperto.convertThesaurus(reperto.actions.thesaurus));
			this.vizTree = $('#cac-tree').jstree(
			{ 
				'core': 
				{
				    'data': reperto.convertThesaurus(reperto.actions.thesaurus)
				}
			});
			
			$('#cac-tree').on('changed.jstree', function (e, data) 
			{
				console.log(data);
				if (reperto.indexedThesaurus)
				{
					var thesaurusItem = reperto.indexedThesaurus[data.node.id];
					if (thesaurusItem)
					{
						$("#titre3").show();
						if (thesaurusItem.subdirectories)
						{
							$("#titre3 .panel-title").html(thesaurusItem.label);
							$("#titre3 .panel-body").html(thesaurusItem.description);
							$("#initiativeList").html("");
						}
						else if (thesaurusItem.initiatives)
						{
							$("#titre3 .panel-title").html(thesaurusItem.label);
							$("#titre3 .panel-body").html(thesaurusItem.description);
							var initiativeListHtml = "";
							thesaurusItem.initiatives.forEach(function(initiative)
							{
								var referencesHtml = "";
								var keywordsHtml = "<span class='glyphicon glyphicon-tags'> </span> ";
								var geolocHtml = "<span class='glyphicon glyphicon-map-marker'> </span> " + initiative.geoloc.join(", ");
								
								initiative.keywords.forEach(function(keyword)
								{
									keywordsHtml += '<span class="label label-info">' + keyword + '</span> '
								});
								
								initiative.references.forEach(function(reference){
									referencesHtml += "<span class='glyphicon glyphicon-new-window'> </span> <a href='" + reference.href + "'>" + reference.label + "</a><br/>";
								});
								
								initiativeListHtml += '<div class="Clear"></div>'+
														'<section class="initiative-panel">'+
															'<div class="panel panel-default">'+
															  	'<div class="panel-heading">'+
																	'<h3 class="panel-title">' + initiative.label + '</h3>'+
															  	'</div>'+
															  	'<div class="panel-body">'+
															  	'<p>' + keywordsHtml + '</p>' +
															  	'<p>' + geolocHtml + '</p>' +
															  	'<p>' + initiative.description + '</p>' +
															  	'<p>' + referencesHtml + '</p>' +
																'</div>'+
															'</div>'+
														'</section>';
							});
							$("#initiativeList").html(initiativeListHtml);
						}
						else
						{
							//nope
						}
					}
					else
					{
						$("#action-detail").html("ERROR: cannot display data. Data doesn't exist in the thesaurus");
					}
				}
				else
				{
					$("#action-detail").html("ERROR: cannot display data. Thesaurus not properly indexed");
				}
			   /**/
			});
		};
		
		this.exportAsPdf = function()
		{
			
		};
		
		this.refreshThesaurus = function()
		{
			
		};
		
		
		this.removeGeolocFilter = function(filter)
		{
			var index = this.activeFilters.geoloc.indexOf(filter);
			if (index != -1)
			{
				this.activeFilters.geoloc.splice(index, 1);
			}
		};
		this.removeKeywordFilter = function(filter)
		{
			var index = this.activeFilters.keywords.indexOf(filter);
			if (index != -1)
			{
				this.activeFilters.keywords.splice(index, 1);
			}
		};
		
		this.searchKeywords = function(keyEvent)
		{
			var value = $("#addKeyword").val();
			value = value ? value + keyEvent.key : keyEvent.key;
			
			this.matchingKeywordItems = this.filters.keywords.filter(function(keywordItem){
				return keywordItem.match(value)
			});
		};
		
		this.searchGeoloc = function(keyEvent)
		{
			var value = $("#addGeoLoc").val();
			value = value ? value + keyEvent.key : keyEvent.key;
			this.matchingGeolocItems = this.filters.geoloc.filter(function(geolocItem){
				return geolocItem.match(value)
			});
		};
		
		this.addGeoloc = function(item)
		{
			if (item || this.matchingGeolocItems)
			{
				var geolocFilter = item ? item : this.matchingGeolocItems[0];
				if (this.activeFilters.geoloc.indexOf(geolocFilter) == -1)
				{
					this.activeFilters.geoloc.push(geolocFilter);
				}
				this.filterThesaurus();
				this.matchingGeolocItems = [];
			}
		};
		
		this.addKeyword = function(item)
		{
			if (item || this.matchingKeywordItems)
			{
				var keywordFilter = item ? item : this.matchingKeywordItems[0];
				if (this.activeFilters.keywords.indexOf(keywordFilter) == -1)
				{
					this.activeFilters.keywords.push(keywordFilter);
				}
				this.filterThesaurus();
				this.matchingKeywordItems = [];
			}
		};
		
		this.loadThesaurus();
		this.indexedThesaurus = this.indexThesaurus(this.actions.thesaurus);
		this.gatherAvailableFilters();
	}]);
	
})();
