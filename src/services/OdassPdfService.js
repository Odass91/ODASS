var OdassPdfService = function()
{
	
};

OdassPdfService.prototype.setup = function()
{
	
};

OdassPdfService.prototype.printPdf = function(pdfFilename)
{
	 html2canvas(document.getElementById('printzone'), {
         onrendered: function (canvas) {
             var data = canvas.toDataURL();
             var docDefinition = {
                 content: [{
                     image: data,
                     width: 500,
                 }]
             };
             pdfMake.createPdf(docDefinition).download(pdfFilename);
         }
     });
};

