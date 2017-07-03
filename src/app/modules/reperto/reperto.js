(function()
{
	
	/** 
	 * */
	var odass = angular.module("odass").controller('RepertoController', ['$http', '$location', "$scope", function($http, $location, $scope)
	{
		var reperto = this;
		
		var odass_app = $scope.$parent.odass;
		this.odass_app = odass_app;
		this.httpService = odass_app.httpService;
		this.mapService = odass_app.mapService;
		
		$scope.$on('initModule', function(event, args)
		{
			if (args.message == "annuaire")
			{
				reperto.init();
                delete odass_app.moduleQueue["annuaire"];
			}
		});
		
		
		$("body").css("background", "url('images/background-ricepaper_v3.png')");		
		
		this.init = function()
		{
			this.navigationmode = "tree";  // map | tree | print
			this.emailContact = "contact@odass.org";
			this.initJSONData();
			
			this.guide = new Guide(this.httpService, this.mapService);
			this.guide.setupGuideFromURL();
			
			this.panier = new Panier(this.guide, this.httpService);
			
			this.loadIntroduction();
			this.loadThesaurus();
        };
        
        this.initJSONData = function()
        {
        	this.mail = 
            {
	            "guideid": "",
	            "gdcid": "",
            
                "contact": 
                {
                    "nom": "",
                    "prenom": "",
                    "mail": "",
                    "tel": ""
                },
                "soumissionneur": 
                {
                    "nom": "",
                    "prenom": "",
                    "mail": "",
                    "tel": ""
                },
                "experience": 
                {
                    "titre": "",
                    "cp": "",
                    "ville": "",
                    "description": "",
                    "portee": "",
                    "reference": {"nom": "", "href": ""},
                    "engagement": "oui"
                }
            };
            
            this.comment = 
            {
        		"guideid": "",
	            "gdcid": "",
        		"titreexperience": "",
        		"contact": 
                {
                    "nom": "",
                    "prenom": "",
                    "mail": "",
                    "tel": ""
                },
                "commentaire":""
            }
        };
        
        this.changeNavigationMode = function(mode)
        {
                this.navigationmode = mode;
                if (mode == 'map')
                {
                    this.refreshMap();
                }
                if (mode == 'tree')
                {
                    //
                }
        }
		
		this.loadIntroduction = function()
		{
			var reperto = this;
			
			var successCallbackFunction = function(data, status) 
		    {
		    	if (data)
		    	{
					$("#introduction-titre").html(data.titre);
                    $("#introduction-contenu").html(data.introduction);
						
		    	}
		    };
			
			this.httpService.fetchJSONObject(odass_app.api_hostname + "/api/getjsonintroduction/14", successCallbackFunction);
		};
		
		this.loadThesaurus = function()
		{
			var reperto = this;
			
			$http.get(odass_app.api_hostname + "/api/getjsonthesaurus/14").
		    success(function(data, status) 
		    {
                reperto.markerCount = 0;
                reperto.guide.setup(data);
                
		    	reperto.guide_is_loaded = true;
		    	

		    	reperto.displayedIdeesLength = reperto.guide.idees.length;
                
                reperto.updateCSSClasses();
                
                window.setTimeout(function()
                {
                    $('[data-toggle="tooltip"]').tooltip();
                }, 500);
		    	
		    }).
		    error(function(data, status) 
		    {
		    	console.log("Erreur lors de la recuperation du fichier json")
		    });
			
		};
		
		this.fetchExperimentDataForIdee = function(idee)
		{
			idee.fetchExperimentData(odass_app.api_hostname);
		};
		
		
		/** FONCTIONS QUI IMPACTENT LA VUE */
		
		this.reduceIntro = function()
        {            
            this.intro_reduced = true;
            $("#guide-intro .panel-body").addClass("animate-disappear");
            $("#guide-intro .panel-body").removeClass("animate-appear");
        };
		
		this.expandIntro = function()
        {
            delete this.intro_reduced;
            $("#guide-intro .panel-body").addClass("animate-appear");
            $("#guide-intro .panel-body").removeClass("animate-disappear");
            
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
		};
        
        this.updateCSSClasses = function()
        {
            this.cssClasses = {};
            this.markerIcons = {};
            this.cssColors = {};
            
            this.availableMarkerIcons = ["marker-e34cb8.png", "marker-00aadd.png", "marker-ffc932.png", "marker-5db026.png"];
            this.availableClasses = ["PARTIE_D", "PARTIE_A", "PARTIE_B", "PARTIE_C"];
            this.availableColors = ["rgba(244,118,182,0.9)", "rgba(90,180,243,0.9)", "#ffe188", "rgba(154,202,85,0.9)"];
            
            this.guide.thesaurus.parties.forEach(function(PARTIE)
            {
                if (! this.cssClasses[PARTIE.id])
                {
                    this.cssClasses[PARTIE.id] = this.availableClasses.pop();
                    this.markerIcons[this.cssClasses[PARTIE.id]] = this.availableMarkerIcons.pop();
                    this.cssColors[this.cssClasses[PARTIE.id]] = this.availableColors.pop();
                }
            }, this);
            
        };
        
        this.switchDisplay = function(displaylong, idee)
        {
            idee.displayLong = displaylong;
            idee.fetchExperimentData(odass_app.api_hostname);
            
            if (displaylong == true)
            {
                $(".idee-item").removeClass("focus");
                $("#initiative-" + idee.id).removeClass("col-lg-6");
                $("#initiative-" + idee.id).addClass("col-lg-12");
                $("#initiative-" + idee.id).addClass("focus");
                $(".odass-overlay").addClass("focus");
            }
            else
            {
                
                $(".idee-item").removeClass("focus");
                $("#initiative-" + idee.id).removeClass("col-lg-12");
                $("#initiative-" + idee.id).addClass("col-lg-6");  
                $(".odass-overlay").removeClass("focus");
            }
            
            
            $("#experiences-list-carrousel-" + idee.id).animate( {left: "0"}, 1000, function() {});

        };
        
        this.switchMapDisplay = function()
        {
            if (this.mapDisplayLong)
            {
                delete this.mapDisplayLong;
                
                var map_html_content_node = document.getElementById("map-tools-wrapper");
                var map_html_content_node_parent = map_html_content_node.parentNode;
                var map_html_content_target_node = document.getElementById("map-tools-zone");
                
                map_html_content_node = map_html_content_node_parent.removeChild(map_html_content_node);
                map_html_content_target_node.appendChild(map_html_content_node);
                
            }
            else
            {
                var map_html_content_node = document.getElementById("map-tools-wrapper");
                var map_html_content_node_parent = map_html_content_node.parentNode;
                var map_html_content_target_node = document.getElementById("fullsize-map-wrapper");
                
                map_html_content_node = map_html_content_node_parent.removeChild(map_html_content_node);
                map_html_content_target_node.appendChild(map_html_content_node);
                
                this.mapDisplayLong = true;
            }
            this.refreshMap(500);
        };
		
        
        
		
		
		/** DIVERS  */
		this.isExpanded = function(id)
		{
			return ($("#" + id).parents(".panel").find(".panel-collapse").hasClass("collapse"));
		};
                                    
		
		this.isPaginationVisible = function(index)
		{
			if (! this.display)
			{
				this.display = {};
			}
			if (! this.display.pager)
			{
				this.display.pager = {"index": 0, "offset": 6};
			}
			var isVisible = (index >= this.display.pager.index && index < (this.display.pager.index + this.display.pager.offset));
			
			return isVisible;
		};
		
		
		
        /** GESTION DU SLIDESHOW */
        this.previousExperience = function(id, n)
        {
            var left =  parseInt($("#" + id).css("left"));
            var width =  Math.ceil(($("#" + id).width()) / n);
            if ((Math.abs(left) + width) < ($("#" + id).width()))
            {
                $("#" + id).animate( {left: "+=" + width}, 1000, function() {});
            }
            else
            {
                $("#" + id).animate( {left: "0"}, 1000, function() {});
            }
        };
        
        this.nextExperience = function(id, n)
        {
            var left =  parseInt($("#" + id).css("left"));
            var width =  Math.ceil(($("#" + id).width()) / n);
            if ((Math.abs(left) + width) < ($("#" + id).width()))
            {
                $("#" + id).animate( {left: "-=" + width}, 1000, function() {});
            }
            else
            {
                $("#" + id).animate( {left: "0"}, 1000, function() {});
            }
        };
                                    
        this.toggleDetails = function(id, item)
        {
            if ($("#" + item + "-" + id + ".info-block").hasClass("active"))
            {
                $(".info-block.active").removeClass("active");
                $(".footer-tab.active").removeClass("active");
            }
            else
            {
                $(".info-block.active").removeClass("active");
                $("#" + item + "-" + id + ".info-block").addClass("active");
                $("#tab-" + item + "-" + id + ".footer-tab").addClass("active");
            }
        };
		
        
        /***********************************************************************
         * FILTER FUNCTIONS
         */
        this.addToAvailableFilter = function(filter)    //filter: {"category": titi, "label": toto}
        {
            var finder = function(element)
            {
                return (element.label.toLowerCase() == filter.label.toLowerCase());
            };
            
            if (reperto.availableFilters.find(finder) == undefined)
            {
                reperto.availableFilters.push(filter);
            }
        };
        
        this.updateMatchedFilters = function()
        {
            var str = this.userFilter.toLowerCase();
            console.log(str);
            var mapper = function(element)
            {
                return element.label.toLowerCase();
            };
            var filterer = function(element)
            {
                return (element.label.toLowerCase().match(str))
            };
            
            if (str.length > 2)
            {
                this.matchedFilters = reperto.availableFilters.filter(filterer).map(mapper);
            }
            else
            {
                this.matchedFilters = [];
            }
            console.log(this.matchedFilters);
        };
        
        
        this.addFilter = function(filter)
        {
            var filterer = function(element)
            {
                if (element.geoloc.ville)
                {
                    return (element.geoloc.ville.toLowerCase() == filter.toLowerCase());
                }
                else
                {
                    return false;
                }
            };
            var finder = function(element)
            {
                return (element.toLowerCase() == filter.toLowerCase());
            };
            
            if (this.activeFilters.length == 0)
            {
               this.activeFilters.push(filter);
            }
            else
            {
                if (this.activeFilters.find(finder) == undefined)
                {
                    this.activeFilters.push(filter);
                }
            }
            this.userFilter = "";
            this.matchedExperiences[filter] = this.display.experiences.filter(filterer);
            
            this.refreshDisplayedExperiments();
            
        };
        
        this.removeFilter = function(filter)
        {
            if (this.activeFilters.indexOf(filter) != -1)
            {
                var filterIndex = this.activeFilters.indexOf(filter);
                this.activeFilters.splice(filterIndex, 1);
                delete this.matchedExperiences[filter];    
            }
            
            this.refreshDisplayedExperiments();
        }
        
        this.refreshDisplayedExperiments = function()
        {
            if ( Object.keys(this.matchedExperiences).length == 0 )
            {
                this.display.experiences.forEach(function(experience)
                {
                    if (experience.marker)
                    {
                        experience.marker.addTo(this.reperto_carte);
                    }
                }, this);
                
                return;
            }
            var filteredExperiences = [];
            this.display.experiences.forEach(function(experience)
            {
                if (experience.marker)
                {
                    this.reperto_carte.removeLayer(experience.marker);
                }
            }, this);
            
            Object.keys(this.matchedExperiences).forEach(function(filter)
            {
                
                this.matchedExperiences[filter].forEach(function(experience)
                {
                    var finder = function(element)
                    {
                        return (element.id == experience.id);
                    };
                    
                    if (filteredExperiences.find(finder) == undefined)
                    {
                        filteredExperiences.push(experience);
                    }
                }, this);
            }, this);
            
            
        
            filteredExperiences.forEach(function(experience)
            {
                if (experience.marker)
                {
                    experience.marker.addTo(this.reperto_carte);
                }
            }, this);
        }
        
		/***********************************************************************
		 * PRINT
		 */
		
		this.setupPrint = function()
		{
			this.printableGuide = 
			{
				"titre": this.thesaurus.titre,
				"description": this.thesaurus.description,
				"parties":
				[
					
				],
				"activeSections": [],
				"activeChapters": [],
				"activeInitiatives": [],
				"initiativesByChapter": {},
				"chaptersBySection": {},
				"indexes": {"sections": {}, "chapters": {}, "initiatives": {}}
			};
		};
		
		
		this.saveInitiative = function(initiative)
		{
			initiative.favorite = true;
			if (this.printableGuide.activeInitiatives.indexOf(initiative) == -1)
			{
				this.printableGuide.activeInitiatives.push(initiative);
				if (! this.printableGuide.initiativesByChapter[initiative.parent])
				{
					this.printableGuide.initiativesByChapter[initiative.parent] = [initiative];
				}
				else
				{
					this.printableGuide.initiativesByChapter[initiative.parent].push(initiative);
				}
			}
		};
		
		this.removeSavedInitiative = function(initiative)
		{
			var index = this.printableGuide.activeInitiatives.indexOf(initiative);
			var index_by_chapter = this.printableGuide.initiativesByChapter[initiative.parent].indexOf(initiative);
			
			delete initiative.favorite;
			if (index >= 0)
			{
				this.printableGuide.activeInitiatives.splice(index, 1);
			}
			if (index_by_chapter >= 0)
			{
				this.printableGuide.initiativesByChapter[initiative.parent].splice(index_by_chapter, 1);
				if (this.printableGuide.initiativesByChapter[initiative.parent].length == 0)
				{
					
				}
			}
		}
		 
		this.refreshPrintableCatalogue = function()
		{
			for (var initiative of this.printableGuide.activeInitiatives)
			{
				if (initiative.parent)
				{
					var chapter = this.obtainChapterFromId(initiative.parent);
					var section = this.obtainSectionFromId(chapter.parent);
					
					if (! this.printableGuide.indexes.chapters[chapter.id])
					{
						this.printableGuide.activeChapters.push(chapter);
						this.printableGuide.indexes.chapters[chapter.id] = chapter;
					}
					
					if (! this.printableGuide.indexes.sections[section.id])
					{
						this.printableGuide.activeSections.push(section);
						this.printableGuide.indexes.sections[section.id] = section;
					}
				}
			}
			
			this.printableGuide.parties = [];
			
			for (var section of this.printableGuide.activeSections)
			{
				this.printableGuide.parties.push(section);
				section.chapitres = [];
				for (var chapitre of this.printableGuide.activeChapters)
				{
					if (chapitre.parent == section.id)
					{
						section.chapitres.push(chapitre);
						chapitre.idees = this.printableGuide.initiativesByChapter[chapitre.id];
					}
				}
				
			}
			
			this.navigationmode = "print";
			
		};
		
		
		/************************************************************************/
		this.isCategorieActive = function(categorie)
		{
			if (! this.activeCategories)
			{
				this.activeCategories = {};
			}
			return (this.activeCategories[categorie.label] != undefined);
		};
		
		this.updateMap = function()
		{
			var idee = this.display.idees[0];
			
			function ideesAvecMarkers(idee)
			{
				var experiencesWithMarker = idee.experiences.filter(function(experience){return experience.marker != undefined})
				return (experiencesWithMarker.length > 0 );
				
			}
			var filteredIdees = this.idees.filter(ideesAvecMarkers);
			console.log(filteredIdees);
			filteredIdees.forEach(function(idee)
			{
				var index = this.display.idees.indexOf(idee);
				
				if (index == -1)
				{
					idee.experiences.forEach(function(experience)
					{
						experience.marker.remove();
					});
				}
			}, this);
			
		};
		
		
		
		/** Utilisé lors de la sélection d'un item dans un thésaurus */
		
		this.selectThesaurus = function()
		{
			this.displayedIdeesLength = this.guide.idees.length;
			this.guide.idees.forEach(function(idee)
			{
				idee.displayed = true;
			}, this);
		};
		
		
		this.selectSection = function(section)
		{
			var selected_idees = this.guide.findIdeesByPartie(section);
			this.guide.idees.forEach(function(idee)
			{
				var is_selected = selected_idees.find(function(element){return (element == idee);});
				if (is_selected)
				{
					idee.displayed = true;
				}
				else
				{
					delete idee.displayed;
				}
			}, this);
			this.displayedIdeesLength = selected_idees.length;
		};
		
		this.selectChapter = function(section, chapitre)
		{
			var selected_idees = this.guide.findIdeesByChapitre(chapitre);
			this.guide.idees.forEach(function(idee)
			{
				var is_selected = selected_idees.find(function(element){return (element == idee);});
				if (is_selected)
				{
					idee.displayed = true;
				}
				else
				{
					delete idee.displayed;
				}
			}, this);
			console.log(selected_idees);
			this.displayedIdeesLength = selected_idees.length;
		};	
		
		
		this.displaySavedInitiatives = function()
		{
			$(".initiative-item").hide();
			for(var key in this.savedInitiativeList)
			{
				$("#initiative-" + this.savedInitiativeList[key].id).show();
			}
		};
        
        this.submitExperience = function()
        {
            this.mail.guideid = this.guideIdentifiant;
            this.mail.gdcid = this.gdcid;
            var reperto = this;
			
            $http.post(odass_app.api_hostname + "/api/sendrepertorecommendation/", reperto.mail).success(function(data)
            {
            	console.log("suggestion envoyée");
            });	
        };
        
        
        this.submitCommentaire = function()
        {
            this.comment.guideid = this.guideIdentifiant;
            this.comment.gdcid = this.gdcid;
            var reperto = this;
            
            $http.post(odass_app.api_hostname + "/api/sendrepertorecomment/", reperto.comment).success(function(data)
            {
            	console.log("commentaire envoyé");
            });	
        };
        
        this.submitPanier= function()
        {
            var panier = 
            {
            	"login": odass_app.user.name,
            	"experiences": this.panier.experiences
            };
            
            var that = this;
            $http.post(odass_app.api_hostname + "/api/savepanier/", panier).success(function(data)
            {
            	console.log("panier sauvé");
            	
            });	
        };
	
	}]);

	odass.directive("thesaurus", function(){return{restrict: 'E', templateUrl: 'src/app/modules/reperto/thesaurus.html'};});
	odass.directive("idees", function(){return{restrict: 'E', templateUrl: 'src/app/modules/reperto/idees.html'};});
	
})();
