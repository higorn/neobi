'use strict';
neobiApp.service('Api', ['$resource', function ($resource) {
  var vendas = $resource('vendas2.json', {}, {
    query: {method: 'GET', isArray: true, interceptor: {
      response: function (response) {
        return response.data;
      }
    }}
  });
  var estoque = $resource('estoque.json', {}, {
    query: {method: 'GET', isArray: true, interceptor: {
      response: function (response) {
        return response.data;
      }
    }}
  });

  return {
    Vendas: vendas,
    Estoque: estoque
  }
}]);

neobiApp.service('Csv2Json', [function () {
  return function (csv) {

    csv = csv.replace(/\./g, '');
    csv = csv.replace(/,/g, '.');
    csv = csv.replace(/ ; /g, ';');
    csv = csv.replace(/; /g, ';');
    csv = csv.replace(/^\s+|\s+$/gm, '');

    var lines=csv.split("\n");

    var result = [];

    var headers=lines[0].split(";");
    console.log('h: '+headers);

    for(var i=1;i<lines.length;i++){

      var obj = {};
      var currentline=lines[i].split(";");

      for(var j=0;j<headers.length;j++){
        obj[headers[j]] = currentline[j];
      }

      result.push(obj);

    }

    return result; //JavaScript object
    // return JSON.stringify(result); //JSON
  }
}]);
