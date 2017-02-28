var http = require('http');
var url = require("url");
var querystring = require('querystring');
var mysql = require('mysql');
var jsonwriter = require('write-json-file');
const jsonloader = require('load-json-file');
var express = require('express');
var cors = require('cors');
var fs = require('fs');
const EventEmitter = require('events');

var app = express();
app.use(cors());

console.log("Good Morning ODASS !", new Date().toString());

//app.use(bodyParser.urlencoded({"extended": true}));
//app.use(bodyParser.json());

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
    });
})
.post('/wizard/quiz/creer', function (req, res)
{
	console.log("creation d'un quiz");
	
    var uuid = new Date().getTime();
    var jsonString = '';

    req.on('data', function (data) 
    {
        jsonString += data;
    });

    req.on('end', function () 
    {        
    	var rparam = JSON.parse(jsonString);
    	var quiz = rparam.quiz;
    	quiz.jeu.uuid = "" + uuid;
    	
    	saveQuizToLibraryFile(quiz, quiz.jeu.uuid, function(err)
	    {
	        if (err)
	        {
	            console.log("an unexpected error occured while updating library file");
	        }
	    });
    	
    	
        saveQuizToLibraryFolder(quiz, uuid, function(err)
	    {
	        if (err)
	        {
	            console.log("an unexpected error occured");
	    		res.status(500).send('an unexpected error occured !');
	    		return;
	        }
	        res.json(quiz);
	    });
    });
})
.post('/wizard/quiz/update', function (req, res)
{
	console.log("mise à jour d'un quiz");
	
    var jsonString = '';

    req.on('data', function (data) 
    {
        jsonString += data;
    });

    req.on('end', function () 
    {        
    	var rparam = JSON.parse(jsonString);
    	var quiz = rparam.quiz;
    	
    	saveQuizToLibraryFile(quiz, quiz.jeu.uuid, function(err)
	    {
	        if (err)
	        {
	            console.log("an unexpected error occured while updating library file");
	        }
	    });
    	
        saveQuizToLibraryFolder(quiz, quiz.jeu.uuid, function(err)
	    {
	        if (err)
	        {
	            console.log("an unexpected error occured");
	    		res.status(500).send('an unexpected error occured !');
	    		return;
	        }
	        res.json(quiz);
	    });
    });
})
.use(function(req, res, next)
{
    res.setHeader('Content-Type', 'text/plain');
    res.status(404).send('Page introuvable !');
});

function saveQuizToLibraryFile(quiz, uuid, callback) 
{
	console.log("TRYING TO UPDATE LIST");
	jsonloader('data/quiz-list.json').then(librairie => 
    {
        console.log(librairie);
        librairie[uuid] = quiz.jeu.nom;
        console.log(librairie)
    	fs.writeFile('data/quiz-list.json', JSON.stringify(librairie), callback);
    });
}

function saveQuizToLibraryFolder(quiz, uuid, callback) 
{
  fs.writeFile('data/library/quiz-' + uuid + '.json', JSON.stringify(quiz), callback);
}

app.listen(8080);




//
//var page = url.parse(req.url).pathname;
//var params = querystring.parse(url.parse(req.url).query);
