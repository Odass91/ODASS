var Panier = function(httpService)
{
	this.experiences = [];
};

Panier.prototype.addExperience = function(experience)
{
	
}

Panier.prototype.removeExperience = function(experience)
{
	var experienceIndex = this.experiences.indexOf(experience);
	if (experienceIndex != -1)
	{
		this.experiences.splice(experienceIndex, 1); 
	}
}