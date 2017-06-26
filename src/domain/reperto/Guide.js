var Guide = function(){
	this.thesaurus = new Thesaurus(this);
	this.idees = new Array();
};

Guide.prototype.id = "14";
Guide.prototype.gcid = "";
Guide.prototype.titre = "";
Guide.prototype.description = "";
Guide.prototype.modetest = false;

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
		this.gcid = guideidvalue;
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
	
	/*this.idees = new Array();
	data.idees.forEach(function(idee_data)
	{
		var idee = new Idee().setup(idee_data);
		this.idees.push(idee);
	}, this);
	
	this.titre = data.thesaurus.titre;
	this.description = data.thesaurus.description;
	this.descriptionlongue = data.thesaurus.descriptionlongue;
	this.email = data.thesaurus.email;*/
};

Guide.prototype.findExperiencesByIdee = function(idee)
{
	var result = new Array();
	
	return result;
};

Guide.prototype.findIdeesByPartie = function(partie)
{
	
};

Guide.prototype.findIdeesByChapitre = function(chapitre)
{
	
};

Guide.prototype.findChapitreById = function(id)
{
	
};

Guide.prototype.findPartieById = function(id)
{
	
};