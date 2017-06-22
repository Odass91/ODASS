

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