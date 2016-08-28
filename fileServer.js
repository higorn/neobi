var http = require('http');
var fs = require('fs');
var Busboy = require('busboy');
var arquivoCsv;

var server = http.createServer( function(req, res) {

    console.dir(req.param);

    if (req.method == 'POST') {
      console.log("POST");
      var busboy = new Busboy({headers: req.headers});
      busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
        arquivoCsv = filename;
        console.log(filename);
        file.pipe(fs.createWriteStream('www/data/'+filename));
      });
      req.pipe(busboy);
      req.on('end', function() {
        res.writeHead(200, 'Content-type: text/plain');
        res.write('Upload Complete!\n');
        res.end();
      });
    }
    if (req.method == 'OPTIONS') {
      res.writeHead(200, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Origin, Content-Type, Accept",
        "Access-Control-Max-Age": "1728000"
      });
      res.end();
    }
});

function converterParaJson() {
  var buf = fs.readFileSync('www/'+arquivoCsv);
  var str = buf.toString();
  console.log('str: '+str);
  var result = csv2json(str);
  fs.writeFile('www/vendas4.json', result);
}

function csv2json(csv){

  var lines=csv.split("\n");

  var result = [];

  var headers=lines[0].split(";");

  for(var i=1;i<lines.length;i++){

    var obj = {};
    var currentline=lines[i].split(";");

    for(var j=0;j<headers.length;j++){
      obj[headers[j]] = currentline[j];
    }

    result.push(obj);

  }

  //return result; //JavaScript object
  return JSON.stringify(result); //JSON
}

port = 3000;
host = '127.0.0.1';
server.listen(port, host);
console.log('Listening at http://' + host + ':' + port);
