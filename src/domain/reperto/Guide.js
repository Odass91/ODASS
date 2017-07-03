var Guide = function(httpService, mapService){
	this.thesaurus = new Thesaurus(this, httpService);
	this.idees = new Array();
	this.filtres = new Array();
	this.httpService = httpService;
	this.mapService = mapService;
};

Guide.prototype.id = "14";
Guide.prototype.gdcid = "";
Guide.prototype.titre = "";
Guide.prototype.description = "";
Guide.prototype.modetest = false;
Guide.prototype.owner = {"nom": "CAC", "href": "http://www.associations-citoyennes.net/", "logo": "images/logo-CAC.jpg", "email": "cac_repertoire@odass.org"};
Guide.prototype.idees = new Array();

Guide.prototype.setupGuideFromURL = function()
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
};

Guide.prototype.setup = function(data)
{
	console.log("GUIDE DATA : ", data);
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

Guide.prototype.addIdeeToThesaurus = function(idee)
{
	this.thesaurus.addIdee(idee);
};

Guide.prototype.setupIntroduction = function(data)
{
	this.introduction = {"titre": data.titre, "contenu": data.introduction};
};

Guide.prototype.obtainGuideGdcid = function()
{
	return (this.gdcid != "" ? ("/" + this.gdcid) : "");
}

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
	
};

Guide.prototype.findPartieById = function(id)
{
};

Guide.prototype.addFilter = function(filter)
{
	
};



Guide.prototype.removeFilter = function(filter)
{
	
};