var dubito = require('./dubito.js');
var wizard = require('./wizard.js');

module.exports.set = function(app) {
    
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
    });
    
    dubito.set(app);
    
    wizard.set(app);

    app.use(function(req, res, next)
    {
        res.setHeader('Content-Type', 'text/plain');
        res.send(404, 'Page introuvable !');
    });
}
