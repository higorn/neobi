'use strict';

neobiApp.controller('AppCtrl', ['$scope', '$timeout', 'Api', 'Upload', 'Csv2Json',
  function ($scope, $timeout, Api, Upload, Csv2Json) {

  var vendas;
  var estoque;
  var financeiro;
  var vendasObj = {};
  var readerVendas;
  var readerEstoque;

  $scope.showFileBox = 'fileBoxFalse';
  $scope.showDash = 'dashVisible';
  $scope.log = '';
  $scope.fileVendasLabel = 'Clique ou arraste aqui para adicionar arquivo';
  $scope.fileEstoqueLabel = $scope.fileVendasLabel;

  $scope.$watch('fileVendas', function () {
    if ($scope.fileVendas && $scope.fileVendas.length) {
      $scope.loadFile($scope.fileVendas);
      // $scope.upload($scope.file);
    }
  });
  $scope.$watch('fileEstoque', function () {
    if ($scope.fileEstoque && $scope.fileEstoque.length) {
      $scope.loadFileEstoque($scope.fileEstoque);
      // $scope.upload($scope.file);
    }
  });

  $scope.loadFile = function(files) {
    $scope.fileVendasLabel = files[0].name;
    readerVendas = new FileReader();
    readerVendas.onload = function (e) {
      $scope.showFileBox = 'fileBoxFalse';
      vendasObj = Csv2Json(e.target.result);
      var file = new File([JSON.stringify(vendasObj)], 'vendas.json', {type: 'text/json'});
      $scope.fileVendas[0] = file;
      var totalVendas = 0.0;
      var totalMetas = 0.0;
      vendasObj.forEach(function (item, index) {
        var valorVenda = item['Valor das Vendas'];
        var valorMeta = item['Meta das Vendas'];
        valorVenda && (totalVendas += parseFloat(valorVenda));
        valorMeta && (totalMetas += parseFloat(valorMeta));
      });
      vendas.setValue(totalVendas.toFixed(2), {numberPrefix: '$'});
      vendas.setLimits(0, totalMetas.toFixed(2));
      $scope.upload($scope.fileVendas);
    }
  }

  $scope.loadFileEstoque = function(files) {
    console.log(files[0]);
    $scope.fileEstoqueLabel = files[0].name;
    readerEstoque = new FileReader();
    readerEstoque.onload = function (e) {
      $scope.showFileBox = 'fileBoxFalse';
      var estoqueObj = Csv2Json(e.target.result);
      var file = new File([JSON.stringify(estoqueObj)], 'estoque.json', {type: 'text/json'});
      $scope.fileEstoque[0] = file;
      console.log(estoqueObj);
      var itemLabels = [];
      var itemSeries = [];
      estoqueObj.forEach(function (obj, index) {
        var produto = obj['item Vendido'];
        var cobertura = obj['Dias de Cobertura de Estoque'];
        produto && (itemLabels[index] = produto);
        cobertura && (itemSeries[index] = parseInt(cobertura));
      });
      estoque.setLabels(itemLabels);
      estoque.addSeries("Cobertura", "Cobertura", itemSeries);
      $scope.upload($scope.fileEstoque);
    }
  }

  $scope.upload = function(file) {
    if (file.$error) {
      return;
    }
    console.log(file);
    Upload.upload({
      url: 'http://localhost:3000',
      headers: {
        'Content-Type': 'text/csv',
        'Accept': 'text/csv'
      },
      data: {
        file: file
      }
    }).then(function (resp) {
      console.log(resp);
      $timeout(function() {
        $scope.log = 'file: ' +
          resp.config.data.file.name +
          ', Response: ' + JSON.stringify(resp.data) +
          '\n' + $scope.log;
      });
    }, null, function (evt) {
      var progressPercentage = parseInt(100.0 *
        evt.loaded / evt.total);
      $scope.log = 'progress: ' + progressPercentage +
        '% ' + evt.config.data.file.name + '\n' +
        $scope.log;
    });
  }

  $scope.importarCsv = function () {
    $scope.showFileBox = 'fileBoxTrue';
    $scope.showDash = 'dashInvisible';
  }

  $scope.integrarArquivos = function () {
    buildDashboard();
    readerVendas.readAsText($scope.fileVendas[0]);
    readerEstoque.readAsText($scope.fileEstoque[0]);
  }

  $scope.integrar = function () {

    buildDashboard();

    Api.Vendas.query({}, function (dados) {
      console.log(dados);
      var metaTotal = 0.0;
      var vendasTotal = 0.0;
      dados.forEach(function(item, index) {
        metaTotal += parseFloat(item.meta);
        vendasTotal += parseFloat(item.venda);
        console.log('meta: '+item.meta);
        console.log('venda: '+item.venda);
      });
      console.log('meta: '+metaTotal);
      console.log('venda: '+vendasTotal);
      vendas.setValue(vendasTotal.toFixed(2), {numberPrefix: '$'});
      vendas.setLimits(0, metaTotal.toFixed(2));
    });

    var itemLabels = [];
    var itemSeries = [];
    Api.Estoque.query({}, function (dados) {
      console.log(dados);
      dados.forEach(function (obj, index) {
        itemLabels[index] = obj.item;
        itemSeries[index] = parseInt(obj.dias);
      });
      console.log(itemLabels);
      console.log(itemSeries);
      estoque.setLabels(itemLabels);
      estoque.addSeries("Cobertura", "Cobertura", itemSeries);
    });

  }

  function buildDashboard() {
    $scope.showDash = 'dashVisible';
    rf.StandaloneDashboard(function(db){

      vendas = new GaugeComponent();
      vendas.lock();
      vendas.setDimensions(4,4);
      vendas.setCaption('Vendas');
      vendas.setValue(144, {numberPrefix: '$'});
      vendas.setLimits(0, 200);
      db.addComponent(vendas);

      financeiro = new ChartComponent();
      financeiro.lock();
      financeiro.setDimensions (4, 4);
      financeiro.setCaption("Financeiro");
      financeiro.setLabels (["Jan", "Feb", "Mar"]);
      financeiro.addSeries ("beverages", "Beverages", [1355, 1916, 1150]);
      financeiro.addSeries ("packaged_foods", "Packaged Foods", [1513, 976, 1321]);
      db.addComponent (financeiro);

      // You can add multiple charts to the same dashboard. In fact you can add many
      // different types of components. Check out the docs at razorflow.com/docs
      // to read about all the types of components.
      //
      // This is another chart with additional parameters passed to "addSeries" to
      // make customizations like change it to a line chart, and add "$" to indicate currency
      var chart2 = new ChartComponent();
      chart2.setCaption("Acessos do site");
      chart2.setDimensions (4, 4);
      chart2.setLabels (["jun", "jul", "ago"]);
      chart2.addSeries ("acessos", "acessos", [3151, 1121, 4982], {
        seriesDisplayType: "line"
      });
      db.addComponent (chart2);

      // Add a chart to the dashboard. This is a simple chart with no customization.
      estoque = new ChartComponent();
      estoque.lock();
      estoque.setCaption("Estoque");
      estoque.setDimensions (4, 4);
      db.addComponent (estoque);

      var roi = new GaugeComponent();
      roi.setDimensions(4,4);
      roi.setCaption('ROI');
      roi.setValue(44, {numberSuffix: '%'});
      roi.setLimits(0, 100);
      db.addComponent(roi);

      $timeout(function () {
        vendas.unlock();
        estoque.unlock();
        financeiro.unlock();
      }, 1000);
    });
  }
}]);
