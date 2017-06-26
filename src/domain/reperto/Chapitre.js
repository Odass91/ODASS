var Chapitre = function(parent)
{
	this.parent = parent;
};

Chapitre.prototype.id = "";
Chapitre.prototype.titre = "";
Chapitre.prototype.description = "";
Chapitre.prototype.descriptionlongue = "";

Chapitre.prototype.setup = function (data)
{
	//console.log("SETUP CHAPITRE DATA", data);
	this.id = data.id;
	this.titre = data.titre;
	this.description = data.description;
	this.descriptionlongue = data.descriptionlongue;
};