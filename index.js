import { api_get } from './util.js'

var root = document.body;




/*
https://sql.digitalvalue.es/sql/santcugatdelvalles/SELECT p.codi,p.descripcio, SUM(total) as total FROM  plan_economica p JOIN gastos g ON p.codi = SUBSTRING(g.economica,1,LENGTH(p.codi)) WHERE exercici = 2020 and (('undefined' = 'undefined' and p.codi like '_') OR g.programa like 'undefined%') GROUP BY p.codi,p.descripcio

Habra que hacer un api_get

SELECT * FROM gastos where exercici=2020 limit 20

SELECT p.codi,p.descripcio, SUM(total) as total FROM  plan_economica p JOIN gastos g ON p.codi = SUBSTRING(g.economica,1,LENGTH(p.codi)) WHERE exercici = 2020 and (('undefined' = 'undefined' and p.codi like '_') OR g.programa like 'undefined%') GROUP BY p.codi,p.descripcio
*/

m.route(root, '/', {
  '/': {
    view: (vnode) => {
      return m(MainPage);
    },
  },
});

//On the main page we get the data and pass it to all the charts
function MainPage() {
  var values = [];
  var labels = [];
  // we get the percentages to send them to the other functions
  var percentages = [];
  //variable to get the total percentage
  var total = 0;

  return {
    //sacamos los datos de la base de datos. Todas las tablas tendrán los mismos datos
    oninit: function (vnode) {
      api_get("SELECT p.codi,p.descripcio, SUM(total) as total FROM  plan_economica p JOIN gastos g ON p.codi = SUBSTRING(g.economica,1,LENGTH(p.codi)) WHERE exercici = 2020 and (('undefined' = 'undefined' and p.codi like '_') OR g.programa like 'undefined') GROUP BY p.codi,p.descripcio").then((res) => {
        res[0].data.map((element) => {
          //the data that is less than 1 million is not added to the chart
          if (element[2] > 1000000) {
            labels.push(element[1])
            values.push(element[2]);
          }
          total += Number(element[2]);
        })
        values.map((element) => {
          percentages.push(Math.floor((element * 100) / total))
        }
        )
        console.log(values);
        m.redraw();
      }
      )
    },
    view: function (vnode) {
      return [
        m(".ui.inverted.segment", { style: "height:150px" },
          m("h1.ui.huge.centered.header", { style: "margin-top:20px;" }, "SECTOR PÚBLICO"),
          m("h6.ui.large.centered.header", { style: "font-style:italic" }, "Los datos de tu comunidad a tu alcance")),
        m(".ui.container", [
          m("div", { id: 'axis-chart' }),
          m('div', { id: 'pie-chart', style: 'margin-left:20px;margin-top:100px;' }),
          m('div', { id: 'percentage-chart' }),
          values.length > 0 ? m(AxisChart, { labels: labels, values: values }) : null,
          labels.length > 0 ? m(PieChart, { labels: labels, values: percentages }) : null,
        ]),
        //    m(Gastos)
      ]
    }
  }
}

function AxisChart() {
  return {
    view: function (vnode) {
      console.log(vnode.attrs);
      new frappe.Chart('#axis-chart', {
        data: {
          labels: vnode.attrs.labels,
          datasets: [
            { values: vnode.attrs.values }
          ]
        },
        type: 'bar',
        colors: ['red'],
        height: 200,
      })
    }
  }
}

// in this pie we have to get the percentage of each value 
function PieChart() {
  return {
    view: function (vnode) {
      console.log(vnode.attrs.values);
      new frappe.Chart("#pie-chart", {
        data: {
          labels: vnode.attrs.labels,
          datasets: [
            { values: vnode.attrs.values }
          ]
        },
        type: 'pie',
        colors: ['red'],
        height: 400,
        maxSlices: 5
      })
    }
  }
}




function Gastos() {
  var data = [];
  var values = [];
  var labels = [];
  var chartdata;

  function populateChart() {
    return {
      oninit: function () {
        console.log(data);
        console.log(data[0].data)
        data[0].data.map((element) => {
          console.log(element);
          //the data that is less than 1 milion is not added to the chart
          if (element[2] > 1000000) {
            labels.push(element[1])
            values.push(element[2]);
          }
        })
      },
      view: function () {
        console.log(labels);
        console.log(values);
      }
    }
  }

  return {
    oninit: function (vnode) {
      api_get("SELECT p.codi,p.descripcio, SUM(total) as total FROM  plan_economica p JOIN gastos g ON p.codi = SUBSTRING(g.economica,1,LENGTH(p.codi)) WHERE exercici = 2020 and (('undefined' = 'undefined' and p.codi like '_') OR g.programa like 'undefined') GROUP BY p.codi,p.descripcio").then((res) => { data = res; console.log(data); m.redraw(); })
    },
    view: function () {
      return data.length > 0 ?
        m(populateChart) : m("div");
    }
  }
}

function Grafica() {

  let chart = new frappe.Chart(m("div"), { // or DOM element
    data: {
      labels: [""],

      datasets: [
        {
          name: "Some Data", chartType: 'bar',
          values: [25, 40, 30, 35, 8, 52, 17, -4]
        },
        {
          name: "Another Set", chartType: 'bar',
          values: [25, 50, -10, 15, 18, 32, 27, 14]
        },
        {
          name: "Yet Another", chartType: 'line',
          values: [15, 20, -3, -15, 58, 12, -17, 37]
        }
      ],

      yMarkers: [{
        label: "Marker", value: 70,
        options: { labelPos: 'left' }
      }],
      yRegions: [{
        label: "Region", start: -10, end: 50,
        options: { labelPos: 'right' }
      }]
    },

    title: "My Awesome Chart",
    type: 'bar', // or 'bar', 'line', 'pie', 'percentage'
    height: 300,
    colors: ['purple', '#ffa3ef', 'light-blue'],

    tooltipOptions: {
      formatTooltipX: d => (d + '').toUpperCase(),
      formatTooltipY: d => d + ' pts',
    }
  });
  chart.export();


}
