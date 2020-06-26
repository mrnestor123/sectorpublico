import { api_get } from './util.js'
import { Grafica } from './graficas.js'
//import { Tabla } from './tablas.js'

var root = document.body;




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
        //m.render(document.body, m(".ui.inverted.segment", { style: "height:150px" },
          //m(".ui.huge.centered.header", { style: "margin:auto" }, "Sector Público"))),
        //m.render(document.body, m('div', { id: 'frost-chart' })),
        m("div", m(TablaGasto2)),
        m("div",{style: "padding-top: 20px"}, m(TablaGasto)),
        //m("div", m(Gastos))
      ]
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
          labels.push(element[1])
          values.push(element[2]);
        })
      },
      view: function () {
        console.log(labels);
        console.log(values);
        chartdata = {
          labels: labels,
          datasets: [
            { values: values }
          ]
        }
        return new frappe.Chart("body", {
          data: chartdata,
          type: 'bar',
          colors: ['red'],
          height: 200
        });
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

function formatoNumero(numero){
    let numFloat = parseFloat(numero,10)
    return new Intl.NumberFormat("de-DE").format(numFloat)
}


function TablaGasto(){
  var data = []
  let suma1 = 0;
  let sumas = [];
  let i = 1;

  return {
      oninit: function (vnode) {
          api_get("SELECT p.codi,p.descripcio, SUM(total) as total FROM  plan_economica p JOIN gastos g ON p.codi = SUBSTRING(g.economica,1,LENGTH(p.codi)) WHERE exercici = 2020 and (('undefined' = 'undefined' and p.codi like '_') OR g.programa like 'undefined') GROUP BY p.codi,p.descripcio").then((res) => { data = res[0].data; console.log(data[0].data); m.redraw()})
      },
      view: function(vnode) {
          return data.length > 0 ? m("table.ui.selectable.celled.orange.table", [
              m("thead", 
                  m("tr", [
                      m("th", "CAPÍTULOS DE GASTOS(€)"),
                      m("th.right aligned", "Creditos iniciales")
                  ])
              ),
              m("tbody", [data.map((entry) => {
                 //Codigo para calculo de costes por capitulos
                 sumas[0] = 0;
                 suma1 += formatoNumero(entry[2])
                 sumas.push(sumas[i-1] + parseFloat(entry[2],10))
                 i++
                 
                return m("tr", [
                  m("td", {}, entry[1]),
                  m("td.right aligned", {}, formatoNumero(entry[2]))
                ])
              }),
                m("tr.active", [
                  m("td", "OPERACIONES CORRIENTES CAP.(1/4)"),
                  m("td.right aligned", {}, formatoNumero(sumas[4]))//dato = dato[0].dato.slice(0,4)[2].reduce((a,b) => a+b))
                ]),
                m("tr.active", [
                  m("td", "OPERACIONES CORRIENTES CAP.(1/7)"),
                  m("td.right aligned", {}, formatoNumero(sumas[7]))//dato = dato[0].dato.slice(0,4)[2].reduce((a,b) => a+b))
                ]),
                m("tr.active", [
                  m("td", m("OPERACIONES CORRIENTES CAP.(1/9)")),
                  m("td.right aligned", {}, formatoNumero(sumas[9]))//dato = dato[0].dato.slice(0,4)[2].reduce((a,b) => a+b))
                ])
              ]
              )
          ]): m("table.ui.celled.table", 
            m("thead", 
                m("tr", [
                    m("th", "CAPÍTULOS DE GASTOS(€)"),
                    m("th.right aligned", "Creditos iniciales")
                ])
            )
          )
      } 
    
  }
}

function TablaGasto2(){
  var data = []
  return {
      oninit: function (vnode) {
          api_get("SELECT * FROM gastos where exercici=2020 limit 10").then((res) => { data = res; console.log(data[0].data); })
      },
      view: function(vnode) {
          return data.length > 0 ? m("table.ui.selectable.celled.red.table", [
              m("thead", 
                  m("tr", [
                      m("th", "CAPÍTULOS DE GASTOS(€)"),
                      m("th.right aligned", "Creditos iniciales")
                  ])
              ),
              m("tbody", [data[0].data.map((entry) => {
                return m("tr", [
                  m("td", {}, entry[5]),
                  m("td.right aligned", {}, formatoNumero(entry[6]))
                ])
              }),
            ]
              )
          ]): m("table.ui.celled.table",
                m("thead", 
                    m("tr", [
                        m("th", "CAPÍTULOS DE GASTOS(€)"),
                          m("th.right aligned", "Creditos iniciales")
                    ])
                )
              );
      } 
    
  }
}

/*
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


}*/
