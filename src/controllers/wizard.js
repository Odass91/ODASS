module.exports.set = function(app) {
     app.get('wizard/quiz/creer', function (req, res)
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
        
    }); 
} 
