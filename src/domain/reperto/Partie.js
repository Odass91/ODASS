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

Partie.prototype.build = function (data)
{
	this.id = data.id;
	this.titre = data.titre;
	this.description = data.description;
	this.descriptionlongue = data.descriptionlongue;
};

Partie.prototype.obtainIdees = function()
{
	var idees = new Array();
	
	this.chapitres.forEach(function(chapitre){
		idees = idees.concat(chapitre.obtainIdees());
	}, this);
	
	return idees;
};

Partie.prototype.addIdee = function(idee)
{
	var chapitre = this.findChapitreById(idee.chapter_id);
	if (chapitre)
	{
		chapitre.addIdee(idee);
	}
};

Partie.prototype.addChapitre = function(chapitre)
{
	var chapitre_ref = this.findChapitreById(chapitre.id);
	console.log("chapitre trouvé ", chapitre_ref);
	if (! chapitre_ref)
	{
		this.chapitres.push(chapitre);
	}
};

Partie.prototype.findIdeesByChapitre = function(chapitre)
{
	var chapitre = this.chapitres.find(function(element){return (element.id == chapitre.id);});
	if (chapitre)
	{
		return chapitre.obtainIdees();
	}
	else
	{
		return (new Array());
	}
};

Partie.prototype.hasChapitre = function(id)
{
	var chapitre = this.chapitres.find(function(element){return (element.id == id);});
	return (chapitre != undefined);
};

Partie.prototype.findChapitreById = function(id)
{
	var chapitre = this.chapitres.find(function(element){return (element.id == id);});
	if (chapitre)
	{
		return chapitre;
	}
	else
	{
		return null;
	}
};