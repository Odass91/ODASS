 module.exports.set = function(app) {
    app.get('/dubito/quiz/list', function(req, res) 
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
    });
    /*.get('/dubito/cartes/list', function(req, res) 
    {
        console.log("demande de la librairie de cartes.");
        jsonloader('data/librairie.json').then(json => 
        {
            res.json(json);
        });
    })*/
}
