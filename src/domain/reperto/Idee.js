var Idee = function(guide, httpService, mapService)
{
	this.displayed = true;
	this.experiences_loaded = false;
	this.experiences = new Array();
	this.httpService = httpService;
	this.mapService = mapService;
	this.guide = guide;
	
};

Idee.prototype.id = "";
Idee.prototype.chapter_id = "";
Idee.prototype.titre = "";
Idee.prototype.description = "";
Idee.prototype.descriptionlongue = "";

Idee.prototype.setup = function(data)
{	
	this.id = data.id;
	
	this.chapter_id = data.parent;
	this.titre = data.titre;
	this.description = data.description;
	this.descriptionlongue = data.descriptionlongue;
	
	this.experiences = new Array();
	if (data.experiences)
	{
		data.experiences.forEach(function(exp_data)
		{
			var experience = new Experience(this);
			experience.setup(exp_data);
			this.experiences.push(experience);
		}, this);
	}
	
	this.guide.addIdeeToThesaurus(this);
};

Idee.prototype.fetchExperimentData = function(hostname)
{
	var url = hostname + "/api/getjsonexp/" + this.id + this.guide.obtainGuideGdcid();
	console.log("url", url);
	this.httpService.fetchJSONObject(url, fetchExperimentDataCallback, this);
};

Idee.prototype.obtainExperimentFromId = function(id)
{
	var finder = function(element)
    {
        return (element.id == id);
    };
    return (this.experiences.find(finder));
};

var fetchExperimentDataCallback = function(data, context)
{
	if (data.experiences)
    {
		data.experiences.forEach(function(experimentData)
		{
			var experience = context.obtainExperimentFromId(experimentData.id);
			// give data
			if (experience != undefined)
			{
				experience.setup(experimentData);
			}
		}, this);
		context.experiences_loaded = true;
    }
};