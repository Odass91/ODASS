var Chapitre = function(parent)
{
	this.parent = parent;
	this.idees = new Array();
};

Chapitre.prototype.id = "";
Chapitre.prototype.titre = "";
Chapitre.prototype.description = "";
Chapitre.prototype.descriptionlongue = "";

Chapitre.prototype.setup = function (data)
{
	this.id = data.id;
	this.titre = data.titre;
	this.description = data.description;
	this.descriptionlongue = data.descriptionlongue;
	
	data.nodes.forEach(function(node)
	{
		this.idees.push(node);
	}, this);
};

Chapitre.prototype.obtainIdees = function()
{
	return this.idees;
};

Chapitre.prototype.addIdee = function(idee)
{
	if (this.idees.length == 0)
	{
		this.idees.push(idee);
	}
	else
	{
		var old_idee = this.idees.find(function(element){return (element.id == idee.id);});
		if (! old_idee)
		{
			this.idees.push(idee);
		}
	}
};