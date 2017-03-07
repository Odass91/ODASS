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
var multer  = require('multer')
var upload = multer({ dest: 'data/upload/'});

var app = express();
app.use(cors());

console.log("Good Morning ODASS !", new Date().toString());

//app.use(bodyParser.urlencoded({"extended": true}));
//app.use(bodyParser.json());

/** ROUTING */


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
	//console.log("demande de la liste de jeu");
    
    jsonloader('data/quiz-list.json').then(function(json)
    {
        res.json(json);
    });
})
.get('/wizard/card/creer', function (req, res)
{
	console.log("creation d'une carte");
    jsonloader('data/card-list.json').then(function(json)
    {
        var card_id = (Object.keys(json).length + 1) + "";
        console.log("card_id", card_id);
        saveCardToLibraryFile(JSON.parse("{}"), card_id, function(err)
	    {
	        if (err)
	        {
	            console.log("an unexpected error occured while updating library file");
	        }
	        res.status(200).end(card_id);
	    });
        
        saveCardToLibraryFolder(JSON.parse("{}"), card_id, function(err)
	    {
	        if (err)
	        {
	            console.log("an unexpected error occured");
	    		res.status(500).send('an unexpected error occured !');
	    		return;
	        }
	    });
    	
    });
})
.post('/wizard/card/update', function (req, res)
{
	console.log("mise à jour d'une carte");
	
    var jsonString = '';

    req.on('data', function (data) 
    {
        jsonString += data;
    });

    req.on('end', function () 
    {        
    	var rparam = JSON.parse(jsonString);
    	var card = rparam.carte;
    	saveCardToLibraryFile(card, card.id, function(err)
	    {
	        if (err)
	        {
	            console.log("an unexpected error occured while updating library file");
	        }
	    });
    	
        saveCardToLibraryFolder(card, card.id, function(err)
	    {
	        if (err)
	        {
	            console.log("an unexpected error occured");
	    		res.status(500).send('an unexpected error occured !');
	    		return;
	        }
	        res.json(card);
	    });
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
	        res.status(200).end(quiz.jeu.uuid);
	    });
    	
    	
        saveQuizToLibraryFolder(quiz, uuid, function(err)
	    {
	        if (err)
	        {
	            console.log("an unexpected error occured");
	    		res.status(500).send('an unexpected error occured !');
	    		return;
	        }
	    });
    });
})
.get('/wizard/quiz/delete/:uuid', function(req, res)
{
    console.log("Suppression du quiz", req.params.uuid);
    deleteQuizFromLibraryFile(req.params.uuid, function(err)
    {
        if (err)
        {
            console.log(err);
            res.status(500).end("Erreur lors de la suppression du quiz : " + err);
        }
        res.end("suppression effectuée");
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
    	console.log(quiz);
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
.post('/wizard/quiz/upload', upload.single('file'), function (req, res, next) 
{
    res.end(req.file.path);
})
.use(function(req, res, next)
{
    res.setHeader('Content-Type', 'text/plain');
    res.status(404).send('Page introuvable !');
});




/** UTIL FUNCTIONS */



function saveQuizToLibraryFile(quiz, uuid, callback) 
{
    
	console.log("essai d'écriture dans la librairie");
	jsonloader('data/quiz-list.json').then(function(librairie) 
    {
        librairie[uuid] = 
        {
            "nom": quiz.jeu.nom, 
            "status": quiz.jeu.status, 
            "score": quiz.jeu.score, 
            "audience": quiz.jeu.audience, 
            "cartes": quiz.jeu.cartes.length, 
            "longueur": quiz.jeu.longueur
        };
    	fs.writeFile('data/quiz-list.json', JSON.stringify(librairie), callback);
    });
}

function saveQuizToLibraryFolder(quiz, uuid, callback) 
{
    if (uuid && uuid != "")
    {
        fs.writeFile('data/library/quiz-' + uuid + '.json', JSON.stringify(quiz), callback);
    }
}

function saveCardToLibraryFolder(card, cardid, callback) 
{
    if (cardid && cardid != "")
    {
        fs.writeFile('data/library/card-' + cardid + '.json', JSON.stringify(card), callback);
    }
}

function saveCardToLibraryFile(card, id, callback) 
{
	console.log("essai d'écriture dans la librairie de cartes");
    console.log(card, id);
	jsonloader('data/card-list.json').then(function(librairie)
    {
        librairie[id] = card;
    	fs.writeFile('data/card-list.json', JSON.stringify(librairie), callback);
    });
}


function deleteQuizFromLibraryFile(uuid, callback)
{
    jsonloader('data/quiz-list.json').then(function(librairie)
    {
        delete librairie[uuid];
        fs.writeFile('data/quiz-list.json', JSON.stringify(librairie), callback);
    });
}

app.listen(8080);




//
//var page = url.parse(req.url).pathname;
//var params = querystring.parse(url.parse(req.url).query);
