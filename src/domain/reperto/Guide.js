/** CONSTRUCTEUR **/

var Guide = function(httpService, mapService)
{
	this.thesaurus = new Thesaurus(this, httpService);
	this.idees = new Array();
	this.filtres = new Array();
	this.httpService = httpService;
	this.mapService = mapService;
};

/** PROPRIETES **/

Guide.prototype.id = "14";
Guide.prototype.gdcid = "";
Guide.prototype.titre = "";
Guide.prototype.description = "";
Guide.prototype.modetest = false;
Guide.prototype.owner = {"nom": "CAC", "href": "http://www.associations-citoyennes.net/", "logo": "images/logo-CAC.jpg", "email": "cac_repertoire@odass.org"};
Guide.prototype.idees = new Array();


/** SETUP */

Guide.prototype.setupGuideFromURL = function(reperto)
{
	if (window.location.search.indexOf("guideid") != -1)
	{
		var guideidvalue = window.location.search.split("guideid=")[1];
		guideidvalue = guideidvalue.split("&")[0];
		this.id = guideidvalue;
	}
	
	if (window.location.search.indexOf("gdcid") != -1)
	{
		var guideidvalue = window.location.search.split("gdcid=")[1];
		guideidvalue = guideidvalue.split("&")[0];
		this.gdcid = guideidvalue;
	}
	
	if (window.location.search.indexOf("modetest") != -1)
	{
		var modetestvalue = window.location.search.split("modetest=")[1];
		modetestvalue = modetestvalue.split("&")[0];
		this.modetest = modetestvalue;
	}
	
	if (window.location.search.indexOf("panier") != -1)
	{
		var panier_id = window.location.search.split("panier=")[1];
		panier_id = panier_id.split("&")[0];
		reperto.obtainPanier(panier_id);
	}
};

Guide.prototype.build = function(data)
{
	this.titre = data.titre;
	this.description = data.description;
	this.descriptionlongue = data.descriptionlongue;
	this.email = data.email;
	this.id = data.guideidvalue;
	this.gdcid = data.guideidvalue;
	this.modetest = data.modetestvalue;
};

Guide.prototype.setup = function(data)
{
	this.thesaurus.setup(data.thesaurus);
	
	this.idees = new Array();
	var idee = null;
	data.idees.forEach(function(idee_data)
	{
		idee = new Idee(this, this.httpService, this.mapService);
		idee.setup(idee_data);
		this.idees.push(idee);
	}, this);
	
	this.titre = data.thesaurus.titre;
	this.description = data.thesaurus.description;
	this.descriptionlongue = data.thesaurus.descriptionlongue;
	this.email = data.thesaurus.email;
};


Guide.prototype.setupIntroduction = function(data)
{
	this.introduction = {"titre": data.titre, "contenu": data.introduction};
};

/** ADD **/ 

Guide.prototype.addIdee = function(idee)
{
	if (! this.hasIdee(idee.id))
	{
		this.idees.push(idee);
	}
};

Guide.prototype.addIdeeToThesaurus = function(idee)
{
	this.thesaurus.addIdee(idee);
};


Guide.prototype.addPartie = function(partie)
{
	this.thesaurus.addPartie(partie);
};

/** REMOVE **/

/** HAS **/

Guide.prototype.hasIdee = function(id)
{
	var idee = this.idees.find(function(element){return (element.id == id);});
	return (idee != undefined);
};

/** FIND BY**/

Guide.prototype.findExperiencesByIdee = function(idee)
{
	var result = new Array();
	
	return result;
};

Guide.prototype.findIdeesByPartie = function(partie)
{
	var idees = new Array();
	idees = this.thesaurus.findIdeesByPartie(partie);
	return idees;
	
};

Guide.prototype.findIdeesByChapitre = function(chapitre)
{
	var idees = new Array();
	idees = this.thesaurus.findIdeesByChapitre(chapitre);
	return idees;
};

Guide.prototype.findChapitreById = function(id)
{
	return this.thesaurus.findChapitreById(id);
};

Guide.prototype.findPartieById = function(id)
{
	return this.thesaurus.findPartieById(id);
};

Guide.prototype.findExperienceById = function(id)
{
	return this.thesaurus.findChapitreById(id);
};

Guide.prototype.findIdeeById = function(id)
{
	return (this.idees.find(function(idee){idee.id == id}));
};

/** UTILITAIRES */

Guide.prototype.obtainGuideGdcid = function()
{
	return (this.gdcid != "" ? ("/" + this.gdcid) : "");
}


Guide.prototype.addFilter = function(filter)
{
	
};



Guide.prototype.removeFilter = function(filter)
{
	
};




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
};


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
