'use strict';
neobiApp.service('Api', ['$resource', function ($resource) {
  var vendas = $resource('vendas.json', {}, {
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
}])
