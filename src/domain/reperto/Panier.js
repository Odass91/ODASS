var Panier = function(guide, httpService)
{
	this.experiences = [];
	this.idees = {};
	this.guide = guide;
};

Panier.prototype.addIdee = function(idee)
{
	idee.experiences.forEach(function(experience)
	{
		this.addExperience(experience);
	}, this);
	this.idees[idee.id] = true;
};

Panier.prototype.removeIdee = function(idee)
{
	idee.experiences.forEach(function(experience)
	{
		this.removeExperience(experience);
	}, this);
	delete this.idees[idee.id];
};

Panier.prototype.addExperience = function(experience)
{
	var finder = function(element)
	{
		return (element.id.toLowerCase() == experience.id.toLowerCase());
	}
	if (this.experiences.find(finder) == undefined)
	{
		this.experiences.push(experience);
	}
		
}

Panier.prototype.removeExperience = function(experience)
{
	var experienceIndex = this.experiences.indexOf(experience);
	if (experienceIndex != -1)
	{
		this.experiences.splice(experienceIndex, 1); 
	}
}

Panier.prototype.hasExperience = function(experience)
{
	var finder = function(element)
	{
		return (element.id.toLowerCase() == experience.id.toLowerCase());
	}
	return (this.experiences.find(finder) != undefined);
};

Panier.prototype.exportPanierAsPdf = function()
{
};


Panier.prototype.sharePanier = function()
{
};