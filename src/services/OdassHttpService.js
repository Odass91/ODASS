var OdassHTTPService = function(scope, hostname)
{
	this.httpService = scope;
	this.hostname = hostname;
};

OdassHTTPService.prototype.httpService = null;

OdassHTTPService.prototype.fetchJSONObject = function(url, success_callback, args)
{
	this.httpService.get(url).
	success(function(data)
	{
		success_callback(data, args);
	}).
	error(function(data, status) 
	{
		console.log("Erreur lors de la recuperation du fichier json");
	});
};

OdassHTTPService.prototype.saveJSONObject = function(url, JSONObject, success_callback, args)
{
	this.httpService.post(url, JSONObject).
	success(function(data)
	{
		success_callback(data, args);
	}).
	error(function(data, status) 
	{
		console.log("Erreur lors de la sauvegarde du fichier json");
	});
};