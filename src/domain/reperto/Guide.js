var Guide = function(id, groupement_id)
{
	this.id = id;
	this.gcid = groupement_id;
};

Guide.prototype.nom = "";
Guide.prototype.description = "";

Guide.prototype.setup = function(data)
{
	this.thesaurus = new Thesaurus().setup(data.thesaurus);
	this.idees = new Array();
	data.idees.forEach(function(idee)
	{
		var idee = new Idee().setup(idee);
	}, this);
};