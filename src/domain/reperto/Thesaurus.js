var Thesaurus = function(guide)
{
	this.parties = new Array();
	this.parent = guide;
};

Thesaurus.prototype.setup = function(data)
{
//	console.log("THESAURUS SETUP DATA", data);
	this.parties = new Array();
	data.nodes.forEach(function(node)
	{
		var partie = new Partie(this.parent);
		partie.setup(node);
		this.parties.push(partie);
	}, this);
};