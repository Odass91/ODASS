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
			this.sectionByChapterId = {};
			this.navigationmode = "tree";  // map | tree | print
			
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
			    "keywords": [
			    	{"label": "CATEGORIE A", "color": "00aadd"},
			    	{"label": "CATEGORIE B", "color": "5db026"},
			    	{"label": "CATEGORIE C", "color": "6e8126"},
			    	{"label": "CATEGORIE D", "color": "0068a2"},
			    	{"label": "CATEGORIE E", "color": "396a78"},
			    	{"label": "CATEGORIE F", "color": "613b6b"},
			    	{"label": "CATEGORIE G", "color": "af2f38"},
		    		{"label": "CATEGORIE H", "color": "e34cb8"},
		    		{"label": "CATEGORIE I", "color": "ffc932"},
		    		{"label": "CATEGORIE J", "color": "e8352b"}
		    	]
			
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
		
		this.loadThesaurus = function()
		{
			var reperto = this;
			$http.get(odass_app.hostname + "/api/getjsonthesaurus/" + reperto.guideIdentifiant).
		    success(function(data, status) 
		    {
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
		    	reperto.display.experiences = {};
		    	
		    	reperto.display.section = null;
		    	reperto.display.chapitre = null;
		    	
		    	reperto.display.guide = reperto.thesaurus;
		    	reperto.display.intro = true;
		    	
		    	reperto.display.breadcrumb = {};
		    	
		    	if (!reperto.display.pager)
		    	{
		    		reperto.display.pager = {"index": 0, "offset": 6};
		    		reperto.display.pager.pagerItems = new Array(Math.ceil(reperto.display.idees.length / 6));
		    	}

		    	reperto.guide_is_loaded = true;
		    	reperto.setPagerIndex(0);
                
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
			this.thesaurus.nodes.forEach(function(section){
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
                $("#initiative-" + idee.id).removeClass("col-lg-6");
                $("#initiative-" + idee.id).addClass("col-lg-12");
            }
            else
            {
                $("#initiative-" + idee.id).removeClass("col-lg-12");
                $("#initiative-" + idee.id).addClass("col-lg-6");  
            }
            
            // get slick object
            var slider = $("#slick-"+ idee.id + ".slixperiences")[0];
            slider.slick.refresh();
        }
		
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
				
				if (data.experiences)
				{
					idee.experiences = data.experiences;
					idee.experiences.forEach(function(experience)
					{
						experience.display = {};
						experience.display.format = "court";
						experience.category = Math.floor(Math.random() * 10);
					}, this);
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
