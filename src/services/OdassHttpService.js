var OdassHTTPService = function(scope)
{
	this.httpService = scope;
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