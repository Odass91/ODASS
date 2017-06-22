module.exports.set = function(app) {
   
    function saveQuizToLibraryFolder(quiz, uuid, callback) 
    {
        fs.writeFile('data/library/quiz-' + uuid + '.json', JSON.stringify(quiz), callback);
    }
} 
