var Idee = function()
{
	this.displayed = true;
	this.experiences = [];
};

Idee.prototype.setup = function(data)
{
	//console.log("SETUP IDEE DATA", data);
	
	this.id = data.id;
	
	this.chapter_id = data.parent;
	this.titre = data.titre;
	this.description = data.description;
	this.descriptionLongue = data.descriptionLongue;
	
	this.experiences = new Array();
	if (data.experiences)
	{
		data.experiences.forEach(function(exp_data)
		{
			var experience = new Experience().setup(exp_data);
			this.experiences.push(experience);
		}, this);
	}
};