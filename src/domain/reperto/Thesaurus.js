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

/** ADD **/

Thesaurus.prototype.addIdee = function(idee)
{
	this.parties.forEach(function(partie){partie.addIdee(idee);}, this);
};

Thesaurus.prototype.addPartie = function(partie)
{
	if (! this.hasPartie(partie.id))
	{
		this.parties.push(partie);
	}
};

/** REMOVE **/

Thesaurus.prototype.removePartie = function(partie)
{
	var old_partie = this.parties.find(function(element){return element.id == partie.id});
	if (old_partie)
	{
		var indexOfPartie = this.parties.indexOf(old_partie);
		this.parties.splice(indexOfPartie, 1);
	}
};

/** HAS **/

Thesaurus.prototype.hasPartie = function(id)
{
	var partie = this.parties.find(function(element){return element.id == id});
	return (partie != undefined);
};

/** FIND BY **/


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

Thesaurus.prototype.findChapitreById = function(id)
{
	var chapitre = null;
	
	var partie = this.parties.find(function(element){return element.hasChapitre(id)});
	if (partie)
	{
		chapitre = partie.findChapitreById(id);
	}
	
	return chapitre;
};

Thesaurus.prototype.findSectionByChapitreId = function(id)
{
	var chapitre = this.findChapitreById(id);
	if (chapitre)
	{
		var partie = this.findPartieById(chapitre.partie_id);
		if (partie)
		{
			return partie;
		}
		return null;
	}
	return null;
};

Thesaurus.prototype.findPartieById = function(id)
{
	var partie = this.parties.find(function(element){return element.id == id});
	return partie;
};