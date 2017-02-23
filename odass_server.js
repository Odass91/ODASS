var http = require('http');
var url = require("url");
var querystring = require('querystring');
var mysql = require('mysql');
var jsonwriter = require('write-json-file');
const jsonloader = require('load-json-file');
var express = require('express');
var fs = require('fs');
const EventEmitter = require('events');

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
.get('/dubito/quiz/list', function(req, res) 
{
	console.log("demande de la liste de jeu");
    
    jsonloader('data/quiz-list.json').then(json => 
    {
        res.json(json);
        res.end();
    });
 
})
.get('/dubito/quiz/:gameuuid', function(req, res) 
{
	console.log("demande du jeu "+ req.params.gameuuid );
	var gameuuid = req.params.gameuuid;
	jsonloader('data/library/quiz-'+ gameuuid +'.json').then(json => 
	{
		res.json(json);
	});
})
/*.get('/dubito/cartes/list', function(req, res) 
{
	console.log("demande de la librairie de cartes.");
	jsonloader('data/librairie.json').then(json => 
	{
		res.json(json);
	});
})*/
.get('wizard/quiz/creer', function (req, res)
{
	console.log("creation d'un quiz");
    var uuid = new Date().getTime();
    var quiz = JSON.parse(req.query.quiz);
    quiz.jeu.uuid = uuid;
    console.log(quiz);
    saveQuizToLibraryFolder(quiz, uuid, function(err)
    {
        if (err)
        {
            console.log("an unexpected error occured");
            res.send(500, "an unexpected error occured !");
        }
        res.json(json);
    });
    
    /*saveQuizToLibraryFolder(req.query.quiz, uuid, function()
    {
        
    });*/
})
.get('wizard/quiz/update/:uuid', function (req, res)
{
	console.log("sauvegarde d'un quiz");
    saveQuizToLibraryFolder(quiz, req.params.uuid, function(err)
    {
        if (err)
        {
            console.log("an unexpected error occured");
            res.send(500, "an unexpected error occured !");
        }
        res.json(json);
    });
    
})
.use(function(req, res, next)
{
    res.setHeader('Content-Type', 'text/plain');
    res.send(404, 'Page introuvable !');
});

function saveQuizToLibraryFolder(quiz, uuid, callback) 
{
  fs.writeFile('data/library/quiz-' + uuid + '.json', JSON.stringify(quiz), callback);
}


app.listen(8080);




//
//var page = url.parse(req.url).pathname;
//var params = querystring.parse(url.parse(req.url).query);
