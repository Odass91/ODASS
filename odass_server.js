var http = require('http');
var url = require("url");
var querystring = require('querystring');
var mysql = require('mysql');
var jsonwriter = require('write-json-file');
const jsonloader = require('load-json-file');
var express = require('express');

var app = express();

console.log("Good Morning ODASS !", new Date().toString());


app.all('/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header("Access-Control-Allow-Methods", "GET, POST","PUT");
  next();

});

app.get('/', function(req, res) 
{
    res.setHeader('Content-Type', 'text/plain');
    res.end('Vous êtes à l\'accueil');
})
.get('/dubito/quiz/:gameid', function(req, res) 
{
	console.log("demande du jeu "+ req.params.gameid );
	var gameid = req.params.gameid;
	jsonloader('data/quiz-'+ gameid +'.json').then(json => 
	{
		res.json(json);
	});
})
.get('/dubito/quiz/list', function(req, res) 
{
	console.log("demande de la liste de jeu");
	var gameid = req.params.gameid;
	jsonloader('data/quiz.json').then(json => 
	{
		res.json(json);
	});
})
.get('/dubito/cartes/list', function(req, res) 
{
	console.log("demande de la librairie.");
	jsonloader('data/librairie.json').then(json => 
	{
		res.json(json);
	});
})
.use(function(req, res, next)
{
    res.setHeader('Content-Type', 'text/plain');
    res.send(404, 'Page introuvable !');
});


app.listen(8080);




//
//var page = url.parse(req.url).pathname;
//var params = querystring.parse(url.parse(req.url).query);
