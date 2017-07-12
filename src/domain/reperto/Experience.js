var Experience = function(parent, httpService, mapService)
{
	this.displayed = true;
	this.filters = new Array();;
	this.idee_id = parent.id;
	this.httpService = httpService;
	this.mapService = mapService;
	this.display = {"format": "court"};
};

Experience.prototype.id = "";
Experience.prototype.chapter_id = "";
Experience.prototype.titre = "";
Experience.prototype.description = "";
Experience.prototype.descriptionlongue = "";
Experience.prototype.geolocation = {};
Experience.prototype.contacts = {};
Experience.prototype.category = "";
Experience.prototype.keywords = [];
Experience.prototype.displayed = true;

Experience.prototype.setup = function(data)
{
	this.id = data.id;
	
	this.titre = data.label;
	this.description = data.description;
	this.descriptionlongue = data.descriptionlongue;
	
	this.geoloc = data.geoloc ? data.geoloc : null;
	this.contacts = data.contacts ? data.contacts : null;

	this.keywords = data.keywords;
};

/** IS **/

Experience.prototype.isFiltered = function ()
{
	return (this.filters.length > 0);
};

/** APPLY **/

Experience.prototype.applyFilter = function (filter)
{
	if (! this.hasFilter(filter))
	{
		var shouldBeFiltered = (this.hasGeolocation(filter) || this.hasKeyword(filter));
		if (shouldBeFiltered)
		{
			this.filters.push(filter);
		}
	}
};


/** HAS **/
Experience.prototype.hasFilter = function (filter)
{
	var filter_ = this.filters.find(function(element){return (element == filter)});
	return (filter_ != undefined);
};

Experience.prototype.hasGeolocation = function (filter)
{
	if (! this.geoloc)
	{
		return false;
	}
	if (this.geoloc.nomdept == filter)
	{
		return true;
	}
	if (this.geoloc.nomregion == filter)
	{
		return true;
	}
	if (this.geoloc.ville == filter)
	{
		return true;
	}
	if (this.geoloc.codepostal == filter)
	{
		return true;
	}
	return false;
};

Experience.prototype.hasKeyword = function (filter)
{
	if (! this.keywords)
	{
		return false;
	}
	return (this.keywords.indexOf(filter) != -1);
};

/** RESET **/
Experience.prototype.resetFilters = function ()
{
	this.filters = new Array();
};

Experience.prototype.resetFilter = function (filter)
{
	if (this.hasFilter(filter))
	{
		var indexOfFilter = this.filters.indexOf(filter);
		this.filters.splice(indexOfFilter, 1);
	}
};

/** API **/

Experience.prototype.fetchExperimentData = function()
{
	
};

/*
if (! expindex[experience.id] && experience.label && experience.contacts)
{
   
    experience.category = reperto.cssClasses[reperto.obtainSectionFromChapter(idee.parent)];
    idee.experiences.push(experience);
    expindex[experience.id] = "loaded";
    if (experience.geoloc.latitude)
    {
        reperto.setupMarker(experience);
    }
    if (experience.geoloc.ville)
    {
         reperto.addToAvailableFilter({"label": experience.geoloc.ville, "category": "geoloc"});
    }
    
}
*/