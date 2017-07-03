var Thesaurus = function(guide, httpService)
{
	this.parties = new Array();
	this.parent = guide;
	this.httpService = httpService;
};

Thesaurus.prototype.setup = function(data)
{
	this.parties = new Array();
	data.nodes.forEach(function(node)
	{
		var partie = new Partie(this.parent);
		partie.setup(node);
		this.parties.push(partie);
	}, this);
};

Thesaurus.prototype.findIdeesByPartie = function(partie)
{
	var partie_trouvee = (this.parties.filter(function(element){return (element.id == partie.id);}))[0];
	
	if (partie_trouvee)
	{
		return (partie_trouvee.obtainIdees());
	}
	else
	{
		return new Array();
	}
};

Thesaurus.prototype.findIdeesByChapitre = function(chapitre)
{
	var idees = new Array();
	this.parties.forEach(function(partie)
	{
		idees = idees.concat(partie.findIdeesByChapitre(chapitre));
	}, this);
	return idees;
};

Thesaurus.prototype.addIdee = function(idee)
{
	this.parties.forEach(function(partie){partie.addIdee(idee);}, this);
};