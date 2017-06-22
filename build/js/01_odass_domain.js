var Chapitre = function(data)
{
	
};
var Experience = function(data)
{
	this.displayed = true;
}

var Guide = function(id, groupement_id)
{
	this.id = id;
	this.gcid = groupement_id;
};

Guide.prototype.nom = "";
Guide.prototype.description = "";

Guide.prototype.setup = function(data)
{
	this.thesaurus = new Thesaurus().setup(data.thesaurus);
	this.idees = new Array();
	data.idees.forEach(function(idee)
	{
		var idee = new Idee().setup(idee);
	}, this);
};


var Idee = function(data)
{
	this.displayed = true;
	this.experiences = [];
};

Idee.prototype.setup = function(data)
{
	this.id = data.id;
	this.chapter_id = data.parent;
	this.titre = data.titre;
	this.description = data.description;
	this.descriptionLongue = data.descriptionLongue;
	this.experiences = new Array();
	data.experiences.forEach(function(experience)
	{
		
	}, this);
};
var Partie = function (data)
{
	this.chapitres = [];
};
var Thesaurus = function(data)
{
	this.parties = [];
};