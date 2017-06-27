var dubito = require('./dubito.js');
var wizard = require('./wizard.js');

module.exports.set = function(app) {
    
    dubito.set(app);
    
    wizard.set(app);
}
