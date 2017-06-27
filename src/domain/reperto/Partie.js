var Partie = function (guide, httpService)
{
	this.chapitres = new Array();
	this.parent = guide;
	this.httpService = httpService;
};


Partie.prototype.id = "";
Partie.prototype.titre = "";
Partie.prototype.description = "";
Partie.prototype.descriptionlongue = "";

Partie.prototype.setup = function (data)
{
	//console.log("SETUP PARTIE DATA", data);

	this.id = data.id;
	this.titre = data.titre;
	this.description = data.description;
	this.descriptionlongue = data.descriptionlongue;
	
	data.nodes.forEach(function(node)
	{
		var chapitre = new Chapitre(this);
		chapitre.setup(node);
		this.chapitres.push(chapitre);
	}, this);
};