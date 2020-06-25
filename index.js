import { api_get } from './util.js'
import { Grafica } from './graficas.js'

var root = document.body;

const API = 'https://sql.digitalvalue.es/sql/santcugatdelvalles';


/*
https://sql.digitalvalue.es/sql/santcugatdelvalles/SELECT p.codi,p.descripcio, SUM(total) as total FROM  plan_economica p JOIN gastos g ON p.codi = SUBSTRING(g.economica,1,LENGTH(p.codi)) WHERE exercici = 2020 and (('undefined' = 'undefined' and p.codi like '_') OR g.programa like 'undefined%') GROUP BY p.codi,p.descripcio

Habra que hacer un api_get

SELECT * FROM gastos where exercici=2020 limit 10

SELECT p.codi,p.descripcio, SUM(total) as total FROM  plan_economica p JOIN gastos g ON p.codi = SUBSTRING(g.economica,1,LENGTH(p.codi)) WHERE exercici = 2020 and (('undefined' = 'undefined' and p.codi like '_') OR g.programa like 'undefined%') GROUP BY p.codi,p.descripcio
*/

m.route(root, '/', {
  '/': {
    view: (vnode) => {
      return m(MainPage);
    },
  },
});

function MainPage() {
  return {
    view: function (vnode) {
      return [
        m.render(document.body, m(".ui.inverted.segment", { style: "height:150px" },
          m(".ui.huge.centered.header", { style: "margin:auto" }, "Sector Público"))),
        m.render(document.body, m('div', { id: 'frost-chart' })),
        m(Gastos)
      ]
    }
  }
}

function Gastos() {
  return {
    view : function() {
      return null;
    }
  }
}


function getData() {
  var data;
  api_get("https://sql.digitalvalue.es/sql/santcugatdelvalles/SELECT * FROM gastos where exercici=2020 limit 10").then((res) => { console.log(res); })
}

getData();





/**function Gastos() {
  var data;
  let chart = new frappe.Chart("#frost-chart", { // or DOM element
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

  return {
    oninit: function (vnode) {
      api_get("SELECT * FROM gastos where exercici=2020 limit 10").then((res) => data = res)
    },
    view: function (vnode) {
      return m('div')

    }
  }
}
*/
