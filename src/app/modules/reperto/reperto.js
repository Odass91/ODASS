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
			
			this.panier = new Panier(this.guide, this.httpService, this.mapService);
			
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
                reperto.panier.guide.build(reperto.guide);
                
                window.setTimeout(function()
                {
                    $('[data-toggle="tooltip"]').tooltip();
                }, 500);
                
                reperto.reduceIntro();
		    	
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
        
        this.showExperience = function(experience)
        {
        	this.current_experience = experience;
        	$("#detail-experience").modal('show');
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
		
		this.loadPanier = function()
		{
			this.navigationmode = "basket";
			this.guide_source = this.guide;
			this.switchGuide(this.panier.guide);
			this.selectThesaurus();
		};
		
		this.loadCatalogue = function()
		{
			this.navigationmode = "print";
		};
		
		this.unloadPanier = function()
		{
			this.navigationmode = "tree";
			this.switchGuide(this.guide_source);
		};
		
		this.switchGuide = function(guide)
		{
			this.guide = guide;
		};
		
		this.selectThesaurus = function()
		{
			this.displayIdees(this.guide.idees);
		};
		
		this.selectSection = function(section)
		{
			var selected_idees = this.guide.findIdeesByPartie(section);
			this.displayIdees(selected_idees);
		};
		
		this.selectChapter = function(section, chapitre)
		{
			var selected_idees = this.guide.findIdeesByChapitre(chapitre);
			this.displayIdees(selected_idees);
		};
		
		this.displayIdees = function(selected_idees)
		{
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
        
		
		
		
		/** API SERVER */
		
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
            
            $http.post(odass_app.api_hostname + "/api/sendrepertocomment/", reperto.comment).success(function(data)
            {
            	console.log("commentaire envoyé");
            });	
        };
        
        
        this.obtainPanier = function(panier_id)
        {
        	var that = this;
            $http.get(odass_app.api_hostname + "/api/loadpanier/", panier).success(function(data)
            {
            	console.log("panier sauvé");
            	
            	if (data.id != that.guide.id)
            	{
            		// reload page with guide id contained into basket.
            	}
            	
            	
            	
            	that.panier = new Panier(that.guide, that.httpService, that.mapService);
            	data.experiences.forEach(function(experience)
            	{
            		that.panier.addExperience(experience, that.guide);
            	});
            	that.loadPanier();
            	
            });	
        };
	
	}]);

	odass.directive("thesaurus", function(){return{restrict: 'E', templateUrl: 'src/app/modules/reperto/thesaurus.html'};});
	odass.directive("idees", function(){return{restrict: 'E', templateUrl: 'src/app/modules/reperto/idees.html'};});
	odass.directive("catalogue", function(){return{restrict: 'E', templateUrl: 'src/app/modules/reperto/print.html'};});
	odass.directive("panier", function(){return{restrict: 'E', templateUrl: 'src/app/modules/reperto/panier.html'};});
	
})();
