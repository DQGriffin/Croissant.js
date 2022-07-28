var http = require('http');
var formidable = require('formidable');
var fs = require('fs');
var IVRMenu = require('./IVRMenu.js')
var ExcelReader = require('./ExcelReader.js')
var XMLWriter = require('./XMLWriter')
var XMLReader = require('./XMLReader')
var AuditWriter = require('./AuditWriter')
var path = require("path");
var LucidChartReader = require('./LucidChartReader')
var ExcelAuditWriter = require('./ExcelAuditWriter')

var server = http.createServer(function (req, res) {

    if (req.url == '/fileupload') {
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {

            var filePath = files.filetoupload.filepath;
            
            if (files.filetoupload.originalFilename.includes('.xlsx')) {
              // This is an excel file, process accordingly
              let resultingFilename = files.filetoupload.originalFilename.replace(".xlsx", ".xml")
              const reader = new ExcelReader(filePath)
              let menus = reader.getMenus()
              let xmlWriter = new XMLWriter(menus)

              res.setHeader('Content-Length', xmlWriter.xmlData.length);
              res.setHeader('Content-Type', 'text/xml');
              res.setHeader('Content-Disposition', 'attachment; filename=' + resultingFilename);
              res.write(xmlWriter.xmlData, 'binary');
              res.end()
            }
            else if (files.filetoupload.originalFilename.includes('.xml')) {
              // This is an XML file, generate audit
              let resultingFilename = files.filetoupload.originalFilename.replace(".xml", ".csv")
              let xmlReader = new XMLReader(filePath)
              let menus = xmlReader.getMenus()
              let auditWriter = new AuditWriter(menus)

              res.setHeader('Content-Length', auditWriter.csvData.length);
              res.setHeader('Content-Type', 'text/xml');
              res.setHeader('Content-Disposition', 'attachment; filename=' + resultingFilename);
              res.write(auditWriter.csvData, 'binary');
              res.end()
            }
            else if (files.filetoupload.originalFilename.includes('.csv')) {
              // This is a CSV file. Assume it was generated by LucidChart
              let reader = new LucidChartReader(files.filetoupload.filepath)
              reader.getMenus().then((menus) => {
                let xmlWriter = new XMLWriter(menus)
                let outputFilename = files.filetoupload.originalFilename.replace(".csv", ".xml")

                res.setHeader('Content-Length', xmlWriter.xmlData.length);
                res.setHeader('Content-Type', 'text/xml');
                res.setHeader('Content-Disposition', 'attachment; filename=' + outputFilename);
                res.write(xmlWriter.xmlData, 'binary');
                res.end()
              })
            }
     });
      }
      else if (req.url == "/audit") {
        var form = new formidable.IncomingForm();

        form.parse(req, function (err, fields, files) {

          var filePath = files.filetoupload.filepath;
          let resultingFilename = files.filetoupload.originalFilename.replace(".xml", ".xlsx")
          let xmlReader = new XMLReader(filePath)
          let menus = xmlReader.getMenus()

          let auditWriter = new ExcelAuditWriter(menus)
          let data = auditWriter.data()

          res.setHeader('Content-Length', data.length);
          res.setHeader('Content-Type', 'text/xml');
          res.setHeader('Content-Disposition', 'attachment; filename=' + resultingFilename);
          res.write(data, 'binary');
          res.end()
          
        });
      }
      else if (req.url == "/link.png") {
        res.writeHead(200, {'Content-Type': 'image/png'});
        var absolutePath = path.resolve('./link.png');
        fs.createReadStream(absolutePath).pipe(res)
      } 
      else {
        res.writeHead(200, {'Content-Type': 'text/html'});
        var absolutePath = path.resolve('./index.html');
        fs.createReadStream(absolutePath).pipe(res)
      }

});

let port = process.env.PORT || 3000
server.listen(port);

console.log('Server running on port ' + port)
