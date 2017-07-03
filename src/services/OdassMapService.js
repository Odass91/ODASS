var OdassMapService = function()
{
	this.markerList = new Array();
	this.carte = null;
	
};

OdassMapService.prototype.setup = function(domElementId)
{
	// reperto map
	var mymap = L.map(domElementId).setView([48.712, 2.24], 6);
	L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiZGF2aWRsZXJheSIsImEiOiJjaXgxdTJua3cwMDBiMnRwYjV3MGZuZTAxIn0.9Y6c9J5ArknMqcFNtn4skw', {
	    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
	    maxZoom: 18,
	    id: 'davidleray.2f171f1g',
	    accessToken: 'pk.eyJ1IjoiZGF2aWRsZXJheSIsImEiOiJjaXgxdTJua3cwMDBiMnRwYjV3MGZuZTAxIn0.9Y6c9J5ArknMqcFNtn4skw'
	}).addTo(mymap);
	
	this.carte = mymap;
};

OdassMapService.prototype.addMarker = function(object)
{
	var latitude_pos = experience.geoloc.latitude;
    var longitude_pos = experience.geoloc.longitude;
    var icon = L.icon({
        'iconUrl': 'images/markers/' + this.markerIcons[experience.category]
    });
    var marker = L.marker([latitude_pos, longitude_pos], {"icon": icon});
    
    marker.addTo(this.reperto_carte);
    
    
    this.markerCount++;
    this.activeMarker = null;
    
    experience.marker = marker;
    marker.experience = experience;
    var reperto = this;
    marker.on("click", function(event)
    {
    	event.preventDefault();
    }, this);
    
    this.markerMap[experience.id] = experience;
};

OdassMapService.prototype.removeMarker = function(object)
{
	
};

OdassMapService.prototype.toggleMarker = function(object)
{
	
};

OdassMapService.prototype.refreshMap = function(object)
{
	var map = this.carte;
    window.setTimeout(function(){
        map.invalidateSize();
    },timeout);
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