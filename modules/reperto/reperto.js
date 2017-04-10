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
                delete odass_app.moduleQueue["annuaire"];
			}
		});
		
		
		$("body").css("background", "url('images/background-ricepaper_v3.png')");		
		
		this.reinit= function()
		{
			this.navigationmode = "tree";  // map | tree | print
			
			this.filteredInitiativeList = [];
			this.savedInitiativeList = {};
			this.savedInitiativeList.length = 0;
			this.panierInitiatives = [];

            this.userFilter = "";
            
			this.display.idees = this.idees;
			this.cache.idees = this.idees;
	    	
	    	this.display.section = null;
	    	this.display.chapitre = null;
	    	
	    	this.display.breadcrumb = {};
	    	
	    	this.display.pager = {"index": 0, "offset": 6};
	    	this.display.pager.pagerItems = new Array(Math.ceil(this.display.idees.length / 6));
	    	
		};
		
		
		this.init = function()
		{
			/** INITIALISATION */

			this.display = {};
            this.userFilter = "";
            
			this.sectionByChapterId = {};
            this.chapterByIdeeId = {};
            this.ideeByExperienceId = {};
            
			this.navigationmode = "tree";  // map | tree | print
			
			var guideid = "14";
			
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
			
			this.markerMap = {};

			this.activeFilters = [];
			
            this.cache = {};
			
			this.showSummary = false;
			
			this.loadThesaurus();
			
			this.filteredInitiativeList = [];
			this.savedInitiativeList = {};
			this.savedInitiativeList.length = 0;
			this.panierInitiatives = [];
            
            var that = this;
           
            window.setTimeout(function()
            {
                that.reduceIntro();
            }, 5000);
            
            this.mail = 
            {
                "contact": 
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
                    "engagement": ""
                }
            };
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
			
			$http.get(odass_app.hostname + "/api/getjsonintroduction/" + reperto.guideIdentifiant).
		    success(function(data, status) 
		    {
		    	if (data)
		    	{
					reperto.display = {};
		    		reperto.display.introduction = {};
		    		reperto.display.introduction.titre = data.titre;
			    	reperto.display.introduction.contenu = data.introduction;
			    	
                    $("#introduction-titre").html(data.titre);
                    $("#introduction-contenu").html(data.introduction);
						
		    	}
		    }).
		    error(function(data, status) 
		    {
		    	console.log("Erreur lors de la recuperation du fichier json");
		    });
		};
        
        this.reduceIntro = function()
        {            
            this.intro_reduced = true;
            $("#guide-intro .panel-body").addClass("animate-disappear");
            $("#guide-intro .panel-body").removeClass("animate-appear");
        }
        
		
		this.expandIntro = function()
        {
            delete this.intro_reduced;
            $("#guide-intro .panel-body").addClass("animate-appear");
            $("#guide-intro .panel-body").removeClass("animate-disappear");
            
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
		};
        
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
        }
                                    
		
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
		
		this.setPagerIndex = function(index)
		{
			if (!this.display.pager)
			{
				this.display.pager = {"index": 0, "offset": 6};
			}
			this.display.pager.index = index * this.display.pager.offset;
			
			var startindex = this.display.pager.index;
			var endindex = Math.max(this.display.pager.index + this.display.pager.offset, this.display.idees.length - 1);
			
			for (var index = startindex; index < endindex; index++)
			{
				this.obtainExperiencesForIdea(this.display.idees[index]);
			}
			
		};
		
		this.associateIdeasAndSections = function()
		{
			this.sectionByChapterId = {};
			reperto.thesaurus.nodes.forEach(function(section)
			{
				section.nodes.forEach(function(chapter)
				{
					this.sectionByChapterId[chapter.id] = section;
				}, this);
			}, this);
		};
        
        this.updateCSSClasses = function()
        {
            this.cssClasses = {};
            this.markerIcons = {};
            this.cssColors = {};
            
            this.availableMarkerIcons = ["marker-e34cb8.png", "marker-00aadd.png", "marker-ffc932.png", "marker-5db026.png"];
            this.availableClasses = ["PARTIE_D", "PARTIE_A", "PARTIE_B", "PARTIE_C"];
            this.availableColors = ["rgba(244,118,182,0.9)", "rgba(90,180,243,0.9)", "#ffe188", "rgba(154,202,85,0.9)"];

            
            this.thesaurus.nodes.forEach(function(PARTIE)
            {
                if (! this.cssClasses[PARTIE.id])
                {
                    this.cssClasses[PARTIE.id] = this.availableClasses.pop();
                    this.markerIcons[this.cssClasses[PARTIE.id]] = this.availableMarkerIcons.pop();
                    this.cssColors[this.cssClasses[PARTIE.id]] = this.availableColors.pop();
                }
            }, this);
            
        };
		
		this.loadThesaurus = function()
		{
			var reperto = this;
			$http.get(odass_app.hostname + "/api/getjsonthesaurus/" + reperto.guideIdentifiant).
		    success(function(data, status) 
		    {
                reperto.markerCount = 0;
		    	reperto.thesaurus = data.thesaurus;
		    	reperto.idees = data.idees;
		    	var timestart = new Date();
		    	reperto.associateIdeasAndSections();
		    	var timeend = new Date();
		    	console.log((timeend.getTime() - timestart.getTime())*1000);
		    	reperto.experiences = {};
		    	
                
		    	reperto.cache = {};
		    	reperto.cache.idees = reperto.idees;
		    	
		    	reperto.display.idees = reperto.idees;
		    	reperto.display.experiences = [];
		    	
		    	reperto.display.section = null;
		    	reperto.display.chapitre = null;
		    	
		    	reperto.display.guide = reperto.thesaurus;
		    	reperto.display.intro = true;
                
                reperto.availableFilters = [];
		    	reperto.matchedFilters = [];
		    	reperto.activeFilters = [];
                reperto.matchedExperiences = {};
                
		    	reperto.display.breadcrumb = {};
		    	
		    	if (!reperto.display.pager)
		    	{
		    		reperto.display.pager = {"index": 0, "offset": 6};
		    		reperto.display.pager.pagerItems = new Array(Math.ceil(reperto.display.idees.length / 6));
		    	}

		    	reperto.guide_is_loaded = true;
		    	reperto.setPagerIndex(0);
                
                
                /****
                console.log(reperto.display.idees[0].experiences);
                //reperto.obtainExperiencesForIdea(reperto.display.idees[0]);
                console.log(reperto.display.idees[0].experiences);
                ****/
                
                if (reperto.navigationmode == 'map')
                {
                    reperto.setupMap();
                    reperto.refreshMap(100);
                }
                
                
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
		 * HELPER FUNCTIONS
		 */
		
		
		
		/**********************************************************************/
		
		this.obtainSectionFromChapter = function(chapterid)
		{
			var chapter = this.obtainChapterFromId(chapterid);
			var section = this.obtainSectionFromId(chapter.parent);
			return section.id;
		};
        
		this.obtainChapterFromId = function(chapterid)
		{
			var chapter_slash_chapitre = null;
			this.thesaurus.nodes.forEach(function(section){
				section.nodes.forEach(function(chapter){
					if (chapter.id == chapterid)
					{
						chapter_slash_chapitre = chapter;
					}
				}, this)
			}, this);
			return chapter_slash_chapitre;
		};

		this.obtainSectionFromId = function(sectionid)
		{
			var section_slash_partie = null;
			this.thesaurus.nodes.forEach(function(section)
            {
				if (section.id == sectionid)
				{
					section_slash_partie = section;
				}
			}, this);
			return section_slash_partie;
		};
        
        
        
        this.obtainClassNameFromPartieId = function(partieid)
        {
            return this.classNames[partieid];
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
		
		this.switchDisplay = function(displaylong, idee)
        {
            idee.displayLong = displaylong;
            if (displaylong == true)
            {
                $(".idee-item").removeClass("focus");
                $("#initiative-" + idee.id).removeClass("col-lg-6");
                $("#initiative-" + idee.id).addClass("col-lg-12");
                
                $("#initiative-" + idee.id).addClass("focus");
            }
            else
            {
                
                $(".idee-item").removeClass("focus");
                $("#initiative-" + idee.id).removeClass("col-lg-12");
                $("#initiative-" + idee.id).addClass("col-lg-6");  
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
		
		this.obtainExperiencesForIdeas = function()
		{
			
			var experiences = [];
			var reperto = this;
			
			this.display.idees.forEach(function(idee)
			{
				idee.experiences = 'loading';
				this.obtainExperiencesForIdea(idee);
			}, this);
			
			this.guide_is_loaded = true;
		};
		
		this.obtainExperiencesForIdea = function(idee)
		{
			if (! idee)
			{
				return;
			}
			
			var reperto = this;
            $http.get(odass_app.hostname + "/api/getjsonexp/" + idee.id).
            success(function(data, status) 
            {
                idee.display = {};
                idee.experiences = [];
                reperto.cache[idee.id] = true;
                if (data.experiences)
                {
                    var expindex = {};
                    data.experiences.forEach(function(experience)
                    {
                        
                        if (! expindex[experience.id] && experience.label && experience.contacts)
                        {
                            experience.display = {};
                            experience.display.format = "court";
                            experience.category = reperto.cssClasses[reperto.obtainSectionFromChapter(idee.parent)];
                            idee.experiences.push(experience);
                            expindex[experience.id] = "loaded";
                            if (experience.geoloc.latitude)
                            {
                                reperto.setupMarker(experience);
                            }
                            if (experience.geoloc.ville)
                            {
                                 reperto.addToAvailableFilter({"label": experience.geoloc.ville, "category": "geoloc"});
                            }
                            reperto.ideeByExperienceId[experience.id] = idee;
                            
                            reperto.display.experiences.push(experience);
                        }
                    });
                }
                else
                {
                    idee.experiences  = [];
                }
            }).
            error(function(data, status) 
            {
                idee.display = {};
                idee.experiences  = [];
                console.log("Erreur lors de la recuperation du fichier json - experiences");
            });
		};
		
        /** MAP */
        
        this.refreshMap = function(timeout)
        {
            var map = this.reperto_carte;
            window.setTimeout(function(){
                map.invalidateSize();
            },timeout);
        };
		
		this.setupMap = function()
		{
			var mymap = L.map('repertomap').setView([48.712, 2.24], 6);
			L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiZGF2aWRsZXJheSIsImEiOiJjaXgxdTJua3cwMDBiMnRwYjV3MGZuZTAxIn0.9Y6c9J5ArknMqcFNtn4skw', {
			    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
			    maxZoom: 18,
			    id: 'davidleray.2f171f1g',
			    accessToken: 'pk.eyJ1IjoiZGF2aWRsZXJheSIsImEiOiJjaXgxdTJua3cwMDBiMnRwYjV3MGZuZTAxIn0.9Y6c9J5ArknMqcFNtn4skw'
			}).addTo(mymap);
			
			this.reperto_carte = mymap;
		};
		
		
		this.setupMarker = function(experience)
		{
			if (this.markerMap[experience.id])
            {
                return;
            }
            if (experience.marker)
            {
                return;
            }
            if (experience.geoloc == {})
            {
                return;
            }
            
            if (! this.reperto_carte)
			{
				this.setupMap();
			}
			
            if (experience.geoloc.latitude && experience.geoloc.longitude)
            {
                var latitude_pos = experience.geoloc.latitude;
                var longitude_pos = experience.geoloc.longitude;
                var icon = L.icon({
                    'iconUrl': 'images/markers/' + this.markerIcons[experience.category]
                });
                var marker = L.marker([latitude_pos, longitude_pos], {"icon": icon});
                
                marker.addTo(this.reperto_carte);
                
                
                this.markerCount++;
                this.activeMarker = null;
                
                experience.marker = marker;
                marker.experience = experience;
                var reperto = this;
                marker.on("click", function(event)
                {
                    reperto.centerExperience(experience);
                    
                    var idee = reperto.ideeByExperienceId[experience.id];
                    var chapter = reperto.obtainChapterFromId(idee.parent);
                    var section = reperto.obtainSectionFromId(chapter.parent);
                    
                    experience.marker.bindPopup("<h3>"+ experience.label + "</h3><p>" + experience.description + "</p><p style='font-size:9px !important; color: rgba(0,0,0,0.8) !important;'>" + section.titre + " > " + chapter.titre + " > " + idee.titre + "</p>");
                    
                    experience.marker.openPopup();
                    
                }, this);
                
                this.markerMap[experience.id] = experience;
            }
            
		};
		
		this.isCategorieActive = function(categorie)
		{
			if (! this.activeCategories)
			{
				this.activeCategories = {};
			}
			return (this.activeCategories[categorie.label] != undefined);
		};
        
        this.centerMap = function(experience)
        {
            if (! this.reperto_carte)
			{
				this.setupMap();
			}
            if (experience.geoloc.latitude && experience.geoloc.longitude)
            {
                this.reperto_carte.setView([experience.geoloc.latitude, experience.geoloc.longitude], 13);
                experience.marker.openPopup();
                
            }
            this.refreshMap(100);
        };
        
        this.centerExperience = function(experience)
        {
            var idee = this.ideeByExperienceId[experience.id];
            var chapter = this.obtainChapterFromId(idee.parent);
            var section = this.obtainSectionFromId(chapter.parent);
            
            $("#thesaurus-tree .panel-collapse").addClass("collapse");
            
            
            $("#thesaurus-tree ." + section.id + " .panel-collapse").removeClass("collapse");
            
            
            $("#tree-chapter-item-" + chapter.id).click();
            
            
        }
		
		this.toggleCategory = function(categorie)
		{
			if (this.activeCategories == undefined)
			{
				this.activeCategories = [];
			}

			if (this.activeCategories[categorie.label] == undefined)
			{
				this.addCategoryToMap(categorie);
				this.activeCategories[categorie.label] = true;
			}
			else
			{
				this.removeCategoryToMap(categorie);
				delete this.activeCategories[categorie.label];
			}
		};
		
		this.addCategoryToMap = function(categorie)
		{
			this.display.idees.forEach(function(idee)
			{
				if (idee.experiences)
				{
					idee.experiences.forEach(function (experience)
					{
						if (this.availableFilters.keywords[experience.category].label == categorie.label)
						{
							experience.marker.addTo(this.reperto_carte).bindPopup("<h3>" + experience.label + "</h3>" + experience.description);
						}
					}, this);
				}
			}, this);
		};
		
		this.removeCategoryToMap = function(categorie)
		{
			this.display.idees.forEach(function(idee)
			{
				if (idee.experiences)
				{
					idee.experiences.forEach(function (experience)
					{
						if (this.availableFilters.keywords[experience.category].label == categorie.label)
						{
							experience.marker.remove();
						}
					}, this);
				}
			}, this);
        };
        
        
		this.isCategorieActive = function(categorie)
		{
			if (! this.activeCategories)
			{
				this.activeCategories = {};
			}
			return (this.activeCategories[categorie.label] != undefined);
		};

		this.tagThesaurus = function(thesaurus)
		{		
			return;
		};
		
		
		
		/** Utilisé lors de la sélection d'un item dans un thésaurus */
		this.selectThesaurus = function()
		{

			this.display.idees = this.idees;

    		this.display.pager.pagerItems = new Array(Math.ceil(this.display.idees.length / 6));
			
			this.display.section = null;
			this.display.chapitre = null;
			this.display.intro = true;
			
			delete this.display.breadcrumb.section;
			delete this.display.breadcrumb.chapitre;
			
			this.setPagerIndex(0);
		};
		
		
		this.selectSection = function(section)
		{
			this.display.idees = [];
			this.gatherIdeas(section);
			
			this.display.section = section;
			this.display.chapitre = null;
			this.display.intro = null;
			
			this.display.breadcrumb.section = section.titre;
			delete this.display.breadcrumb.chapitre;
			this.setPagerIndex(0);
		};
		
		this.selectChapter = function(section, chapitre)
		{
            
            $(".tree-chapter-item").removeClass("active");
            $("#tree-chapter-item-" + chapitre.id).addClass("active");
            
			this.display.idees = [];
			this.gatherIdeas(chapitre);

			this.display.intro = null;
			this.display.section = section;
			this.display.chapitre = chapitre;

			this.display.breadcrumb.section = section.titre;
			this.display.breadcrumb.chapitre = chapitre.titre;
			this.setPagerIndex(0);
			
		};
		
		this.gatherIdeas = function(section)
		{
			
			var idees = [];
			
			for (var idee of this.idees)
			{
				if (idee.parent == section.id)
				{
					idees.push(idee);
				}
			}
			idees.forEach(function(idee)
			{
				this.display.idees.push(idee);	
			}, this);

			if (section.nodes && section.nodes.length > 0)
			{
				section.nodes.forEach(function(node)
				{
					this.gatherIdeas(node);
				}, this);
			}

    		this.display.pager.pagerItems = new Array(Math.ceil(this.display.idees.length / 6));
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
			return [];
		};
		
		
		
		
		this.displaySavedInitiatives = function()
		{
			$(".initiative-item").hide();
			for(var key in this.savedInitiativeList)
			{
				$("#initiative-" + this.savedInitiativeList[key].id).show();
			}
		};
		
		this.exportToPdf = function()
		{
			/* MANUAL VERSION */
//			var doc = new jsPDF();
//			this.panierInitiatives.forEach(function(initiative)
//			{
//				console.log(initiative);
//				doc.addPage();
//				doc.setFontSize(24);
//				doc.text(20,20,initiative.titre, {width: 500});
//				doc.setFontSize(12);
//				doc.text(20,60,initiative.descriptionlongue, {width: 500});
//			}, this);
//			doc.save("repertoire.pdf");
//			
			//

		/* AUTOMATIC VERSION */
		   html2canvas(document.getElementById('printzone'), {
		            onrendered: function (canvas) {
		                var data = canvas.toDataURL();
		                var docDefinition = {
		                    content: [{
		                        image: data,
		                        width: 500,
		                    }]
		                };
		                pdfMake.createPdf(docDefinition).download("repertoire.pdf");
		            }
		        });
		};
        
        
        this.submitExperience = function()
        {
            var reperto = this;
            /*$http.post(odass_app.hostname + "/api/sendrecommendation/", reperto.mail).success(function(data)
            {
            });	*/		
        }
	
	}]);

	odass.directive("filtersBox", function(){return{restrict: 'E', templateUrl: 'modules/reperto/filters-box.html'};});
	odass.directive("thesaurus", function(){return{restrict: 'E', templateUrl: 'modules/reperto/thesaurus.html'};});
	odass.directive("repertoireIdees", function(){return{restrict: 'E', templateUrl: 'modules/reperto/repertoire-idees.html'};});
	odass.directive("idees", function(){return{restrict: 'E', templateUrl: 'modules/reperto/idees.html'};});
	
})();
