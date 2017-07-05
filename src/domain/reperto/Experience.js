var Experience = function(parent, httpService, mapService)
{
	this.displayed = true;
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

Experience.prototype.setup = function(data)
{
	this.id = data.id;
	
	this.titre = data.label;
	this.description = data.description;
	this.descriptionlongue = data.descriptionlongue;
	
	this.geoloc = data.geoloc ? data.geoloc : null;
	this.contacts = data.contacts ? data.contacts : null;
};

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