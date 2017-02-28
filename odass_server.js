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
    	console.log("JSON FILE LOADED", json);
        res.json(json);
    });
});

function saveQuizToLibraryFolder(quiz, uuid, callback) 
{
  fs.writeFile('data/library/quiz-' + uuid + '.json', JSON.stringify(quiz), callback);
}


app.listen(8080);




//
//var page = url.parse(req.url).pathname;
//var params = querystring.parse(url.parse(req.url).query);
