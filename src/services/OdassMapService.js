var OdassMapService = function($http, apiHostname)
{
	this.markerList = new Array();
	this.iconList  = ["marker-e34cb8.png", "marker-00aadd.png", "marker-ffc932.png", "marker-5db026.png"];
	this.iconIndex  = {};
	this.carte = null;
	
};

OdassMapService.prototype.setup = function(domElementId, latitude, longitude, zoom)
{
	var mymap = L.map(domElementId).setView([latitude, longitude], zoom);
	L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiZGF2aWRsZXJheSIsImEiOiJjaXgxdTJua3cwMDBiMnRwYjV3MGZuZTAxIn0.9Y6c9J5ArknMqcFNtn4skw', {
	    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
	    maxZoom: 18,
	    id: 'davidleray.2f171f1g',
	    accessToken: 'pk.eyJ1IjoiZGF2aWRsZXJheSIsImEiOiJjaXgxdTJua3cwMDBiMnRwYjV3MGZuZTAxIn0.9Y6c9J5ArknMqcFNtn4skw'
	}).addTo(mymap);
	
	this.carte = mymap;
};

OdassMapService.prototype.createMarker = function(id, latLong, titre, contenu, icon_category)
{
	var marker = this.markerList.find(function(marker){return marker.id == id});
	var icon = "icon_category";
	if (this.iconIndex[icon_category] == undefined)
	{
		this.iconIndex[icon_category] = this.iconList.pop();
	}
	if (marker == undefined)
	{	console.log(this.iconIndex[icon_category]);
		icon = L.icon({"iconUrl": 'images/markers/' + this.iconIndex[icon_category]});
		var marker = L.marker(latLong, {"icon": icon});
		if (icon)
		{
			
		}
		if (titre)
		{
			marker.bindTooltip(titre).openTooltip();
			var popupContent = "<div class='MarkerCarte'>" +
					"<h3 class='MarkerTitre'>" + titre + "</h3>" +
					"<div class='MarkerContenu'>" + contenu + "</div>" +
					"</div>"; 
			marker.bindPopup(popupContent).openPopup();
		}
		this.markerList.push({"id": id, "object": marker});
		return true;
	}
	else
	{
		return false;
	}
};


OdassMapService.prototype.addMarker = function(id)
{
	var marker = this.markerList.find(function(marker){return marker.id == id});
	if (marker != undefined)
	{
		marker.object.addTo(this.carte);
		
		
	}
};

OdassMapService.prototype.removeMarker = function(id)
{
	var marker = this.markerList.find(function(marker){return marker.id == id});
	if (marker != undefined)
	{
		marker.object.remove();
		
	}
};

OdassMapService.prototype.showOnMap = function(array_of_id)
{
	this.markerList.forEach(function(item)
	{
//		console.log("item stored", item, "array_of_id", array_of_id);
		if (array_of_id.indexOf(item.id) != -1)
		{
//			console.log("found it !");
			this.addMarker(item.id);
		}
		else
		{

//			console.log("Didn't found it !");
			this.removeMarker(item.id);
		}
	}, this);
};

OdassMapService.prototype.refreshMap = function(object)
{
	var map = this.carte;
    window.setTimeout(function(){
        map.invalidateSize();
    },timeout);
};



OdassMapService.prototype.centerMap = function(id, coordonnees)
{
	var marker = this.markerList.find(function(marker){return marker.id == id});
	this.carte.setView(coordonnees, 13);
    this.carte.openPopup(marker);
};

/*
 * 
 * 
        
        this.centerMap = function(experience)
        {
            if (! this.reperto_carte)
			{
				this.setupMap();
			}
            if (experience.geoloc.latitude && experience.geoloc.longitude)
            {
                this.reperto_carte.setView([experience.geoloc.latitude, experience.geoloc.longitude], 13);
                this.reperto_carte.openPopup(experience.popup);
                
            }
            this.refreshMap(100);
        };
        
        this.centerExperience = function(experience)
        {
            var idee = this.ideeByExperienceId[experience.id];
            var chapter = this.obtainChapterFromId(idee.parent);
            var section = this.obtainSectionFromId(chapter.parent);
            
            $("#thesaurus-tree .panel-collapse").addClass("collapse");
            
            
            $("#thesaurus-tree ." + section.id + " .panel-collapse").removeClass("collapse");
            
            
            $("#tree-chapter-item-" + chapter.id).click();
            
            
        }
 * 
 * 
 * 
 */