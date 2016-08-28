
var fs = require('fs');
var args = process.argv;
var file = args[2];
var buf = fs.readFileSync(file);
var str = buf.toString();

console.log(csvJSON(str));
function csvJSON(csv){

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
