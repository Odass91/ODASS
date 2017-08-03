var Panier = function(source, httpService, mapService)
{
	this.experiences = new Array();
	this.idees = {};
	this.guide = new Guide(httpService, mapService);
	this.guide.build(source);
	this.httpService = httpService;
	this.guide_id = source.id;
	this.guide_gdcid = source.gdcid;
	$("#partager_le_panier").popover();
};

Panier.prototype.id = "666";
Panier.prototype.user = "";

Panier.prototype.addIdee = function(idee, source, full)
{
	console.log("avant", this.idees);
	if (!idee.experiences_loaded)
	{
		idee.fetchExperimentData();
	}
	if (full)
	{
		idee.experiences.forEach(function(experience)
		{
			this.addExperience(experience);
			experience.displayed = true;
		}, this);
	}

	this.idees[idee.id] = true;
	
	var chapitre_reference = source.findChapitreById(idee.chapter_id);
	var partie_reference = source.findPartieById(chapitre_reference.partie_id);
	
	var partie, chapitre = null;
	chapitre = this.guide.findChapitreById(chapitre_reference.id);
	if (! chapitre)
	{
		partie = new Partie(this.guide, this.guide.httpServices);
		partie.build(partie_reference);
		chapitre = new Chapitre(partie);
		chapitre.build(chapitre_reference);

		partie.addChapitre(chapitre);
		chapitre.addIdee(idee);
		this.guide.addPartie(partie);
	}
	else
	{
		partie = this.guide.findPartieById(partie_reference.id);
		chapitre.addIdee(idee);
	}
	
	this.guide.addIdee(idee);
	
};

Panier.prototype.removeIdee = function(idee)
{
	console.log("avant", this.idees);

	idee.experiences.forEach(function(experience)
	{
		this.removeExperience(experience);
		experience.displayed = false;
	}, this);
	
	var chapitre = this.guide.findChapitreById(idee.chapter_id);
	var partie = this.guide.findPartieById(chapitre.partie_id);

	chapitre.removeIdee(idee);

	if (chapitre.idees.length == 0)
	{
		partie.removeChapitre(chapitre);
		if (partie.chapitres.length == 0)
		{
			this.guide.removePartie(partie);
		}
	}
	delete (this.idees[idee.id]);
	console.log("apres", this.idees);
};

Panier.prototype.addExperience = function(experience)
{
	var finder = function(element)
	{
		return (element.id.toLowerCase() == experience.id.toLowerCase());
	}
	if (this.experiences.find(finder) == undefined)
	{
		this.experiences.push(experience);
	}
	experience.displayed = true;
}

Panier.prototype.removeExperience = function(experience)
{
	var experienceIndex = this.experiences.indexOf(experience);
	if (experienceIndex != -1)
	{
		this.experiences.splice(experienceIndex, 1); 
	}
	experience.displayed = false;
}

Panier.prototype.hasExperience = function(experience)
{
	var finder = function(element)
	{
		return (element.id.toLowerCase() == experience.id.toLowerCase());
	}
	return (this.experiences.find(finder) != undefined);
};



Panier.prototype.findExperience = function(experience)
{
	var finder = function(element)
	{
		return (element.id.toLowerCase() == experience.id.toLowerCase());
	}
	return (this.experiences.find(finder));
};

Panier.prototype.exportPanierAsPdf = function()
{
	html2canvas(document.getElementById('printzone'), {
        onrendered: function (canvas) {
            var data = canvas.toDataURL();
            var docDefinition = {
                content: [{
                    image: data,
                    width: 500,
                }]
            };
            pdfMake.createPdf(docDefinition).download('guide.pdf');
        }
    });
};

Panier.prototype.createPanierOnServer = function()
{
	var that = this;
	var createPanierCallback = function(data)
	{
		that.id = data.panier_id;
	};
	
	var url = this.httpService.hostname + "/api/createpanier";
	var data = {"guide_id": this.guide_id, "guide_gdcid": this.guide_gdcid, "experiences": this.experiences};
	this.httpService.saveJSONObject(url, data, createPanierCallback);
};

Panier.prototype.updatePanierOnServer = function()
{
	if (this.id == "")
	{
		this.createPanierOnServer();
	}
	else
	{
		var that = this;
		var url = this.httpService.hostname + "/api/updatepanier";
		var data = {"guide_id": this.guide_id, "guide_gdcid": this.guide_gdcid, "panier_id": this.id, "experiences": this.experiences};
		this.httpService.saveJSONObject(url, data, null);
	}
};

Panier.prototype.sharePanier = function()
{
	var that = this;
	var createPanierCallback = function(data)
	{
		that.id = data.panier_id;
		that.sharePanier();
	};
	
	if (this.id == "")
	{
		var url = this.httpService.hostname + "/api/createpanier";
		var data = {"id": this.guide_id,"experiences": this.experiences};
		this.httpService.saveJSONObject(url, data, createPanierCallback);
		
	}
	else
	{
		$("#partager_le_panier").attr("data-content", "http://www.odass.org/?panier_id=" + this.id);
		$("#partager_le_panier").popover('toggle');
	}
};