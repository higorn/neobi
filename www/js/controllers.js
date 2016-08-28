'use strict';

neobiApp.controller('AppCtrl', ['$scope', '$timeout', 'Api', function ($scope, $timeout, Api) {

  var vendas;
  var estoque;
  var financeiro;

  $scope.integrar = function () {

    Api.Vendas.query({}, function (dados) {
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

    });

    $timeout(function () {
      vendas.unlock();
      estoque.unlock();
      financeiro.unlock();
    }, 1000);
  }

  $scope.kpi = function () {
    StandaloneDashboard(function(db){
      var kpi = new KPIGroupComponent ();
      kpi.setDimensions (12, 2);
      kpi.setCaption('Food Units Available');
      kpi.addKPI('beverages', {
        caption: 'Beverages',
        value: 559,
        numberSuffix: ' units'
      });
      kpi.addKPI('condiments', {
        caption: 'Condiments',
        value: 507,
        numberSuffix: ' units'
      });
      kpi.addKPI('confections', {
        caption: 'Confections',
        value: 386,
        numberSuffix: ' units'
      });
      kpi.addKPI('daily_products', {
        caption: 'Daily Products',
        value: 393,
        numberSuffix: ' units'
      });
      db.addComponent (kpi);
    });
  }
}]);
