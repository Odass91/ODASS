var Idee = function(guide, httpService, mapService)
{
	this.displayed = true;
	this.filtered = false;
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

Idee.prototype.displayed = true;
Idee.prototype.filtered = false;
Idee.prototype.experiences_loaded = false;

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

/** IS */

Idee.prototype.isDisplayed = function()
{
	return (this.displayed && this.isFiltered());
};

Idee.prototype.isFiltered = function()
{
	if (this.guide.hasFilters())
	{
		this.filtered = false;
		this.experiences.forEach(function(experience)
		{
			this.filtered = this.filtered || experience.isFiltered();
		}, this);
		return this.filtered;
	}
	else
	{
		return true;
	}
};

/** ADD **/

/** REMOVE **/

/** RESET **/
Idee.prototype.resetFilter = function(filter)
{
	console.log("IDEE RESET FILTER");
	this.filtered = false;
	this.experiences.forEach(function(experience)
	{
		experience.resetFilter(filter);
		this.filtered = this.filtered || experience.isFiltered();
	}, this);
};

/** HAS **/

/** FIND BY **/
Idee.prototype.findByExperimentId = function(id)
{
	var finder = function(element)
    {
        return (element.id == id);
    };
    return (this.experiences.find(finder));
};

/** UTILS */


Idee.prototype.obtainExperiencesLength = function(id)
{
	var filterer = function(element)
    {
        return (element.displayed);
    };
    var experiences = this.experiences.filter(filterer);
    return experiences.length;
};

Idee.prototype.obtainExperiencesCountFiltered = function(id)
{
	var count = 0;
    this.experiences.forEach(function(experience)
    {
    	if (experiences.hasFilter(filter))
    	{
    		count++;
    	}
    }, this);
    return count;
};


Idee.prototype.applyFilter = function(filter)
{
	this.filtered = false;
	this.experiences.forEach(function(experience)
	{
		experience.applyFilter(filter);
		this.filtered = this.filtered || experience.isFiltered();
	}, this);
};

/** API */


Idee.prototype.fetchExperimentData = function()
{
	var url = this.httpService.hostname + "/api/getjsonexp/" + this.id + this.guide.obtainGuideGdcid();
	this.httpService.fetchJSONObject(url, fetchExperimentDataCallback, this);
};


var fetchExperimentDataCallback = function(data, context)
{
	if (data.experiences)
    {
		data.experiences.forEach(function(experimentData)
		{
			var experience = context.findByExperimentId(experimentData.id);
			// give data
			if (experience != undefined)
			{
				experience.setup(experimentData);
			}
		}, this);
		context.experiences_loaded = true;
    }
};