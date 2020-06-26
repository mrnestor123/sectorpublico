import { api_get, formatoNumero } from './util.js'
//import { Grafica } from './graficas.js'
//import { Tabla } from './tablas.js'

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

  //axis|pie|donut|percentage
  var selectedchart = 'axis';

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
        m(".ui.container", { style: "text-align:center" }, [
          m(".ui.segment", { style: "margin-top:25px" }, [
            m("h5.ui.large.centered.header", { style: "margin-top:10px" }, "Utiliza diferentes gráficas"),
            m(".large.ui.centered.buttons", { style: "margin:auto" }, [
              m(".ui.button", {
                class: selectedchart === 'axis' ? 'disabled' : '', onclick: function () {
                  selectedchart = 'axis'
                }
              }, "xAxis"),
              m(".ui.button", {
                class: selectedchart === 'pie' ? 'disabled' : '', onclick: function () {
                  selectedchart = 'pie'
                }
              }, "Pie"),
              m(".ui.button", {
                class: selectedchart === 'donut' ? 'disabled' : '', onclick: function () {
                  selectedchart = 'donut'
                }
              }, "Donut"),
              m(".ui.button", {
                class: selectedchart === 'percentage' ? 'disabled' : '', onclick: function () {
                  selectedchart = 'percentage'
                }
              }, "Percentage")
            ]),
            m("div", { id: 'grafica' }),
          ]),
          m('.ui.segment',
            m("h5.ui.large.centered.header", { style: "margin-top:10px" }, "Saca información de lo que elijas"),
            m("div", { id: "intpie" })
          ),
          m('.ui.segment',
            m("h5.ui.large.centered.header", { style: "margin-top:10px" }, "Información de la hacienda local"),
            m("div", m(TablaGasto))
          ),


          // values.length > 0 ? m(AxisChart, { labels: labels, values: values }) : null,
          values.length > 0 && selectedchart === 'pie' ? m(PieChart, { labels: labels, values: percentages }) : null,
          values.length > 0 && selectedchart === 'donut' ? m(DonutChart, { labels: labels, values: percentages }) : null,
          values.length > 0 && selectedchart === 'axis' ? m(Grafica, { labels: labels, values: values, div: '#grafica', type: 'bar' }) : null,
          values.length > 0 && selectedchart === 'percentage' ? m(Grafica, { labels: labels, values: percentages, div: '#grafica', type: 'percentage' }) : null,
          values.length > 0 ? m(InteractiveGrafica, { labels: labels, values: percentages, div: '#intpie', type: 'pie' }) : null,

        ]),
        //    m(Gastos)
      ]
    }
  }
}

//función comun a casi todas las gráficas sin interacción. Se le pasa el tipo y los datos. Y el div en el que se pobla
function Grafica() {
  return {
    view: function (vnode) {
      new frappe.Chart(vnode.attrs.div, {
        data: {
          labels: vnode.attrs.labels,
          datasets: [
            { values: vnode.attrs.values }
          ]
        },
        type: vnode.attrs.type,
        colors: ['red'],
        height: 400,
        truncateLegends: true,
        tooltipOptions: {
          formatTooltipX: d => (d + '').toUpperCase(),
          formatTooltipY: d => d + ' €',
        },
        axisOptions: {
          yAxisMode: 'span',   // Axis lines, default
          xAxisMode: 'tick',   // No axis lines, only short ticks        // Allow skipping x values for space
          // default: 0
        },
      })
    }
  }
}


//Pie Chart con interacción. Una vez clicas te sale una gráfica a partir de ella
function InteractiveGrafica() {
  return {
    view: function (vnode) {
      console.log(vnode.attrs.values);
      let grafica = new frappe.Chart(vnode.attrs.div, {
        data: {
          labels: vnode.attrs.labels,
          datasets: [
            { values: vnode.attrs.values }
          ]
        },
        type: vnode.attrs.type,
        colors: ['red'],
        height: 400
      })
      grafica.parent.addEventListener('data-select', (e) => {
        console.log(e);
      })
    }
  }
}


function AxisChart() {
  return {
    view: function (vnode) {
      console.log(vnode.attrs);
      new frappe.Chart('#grafica', {
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
      new frappe.Chart("#grafica", {
        data: {
          labels: vnode.attrs.labels,
          datasets: [
            { values: vnode.attrs.values }
          ]
        },
        type: 'pie',
        colors: ['red'],
        height: 400
      })
    }
  }
}


function DonutChart() {
  return {
    view: function (vnode) {
      console.log(vnode.attrs.values);
      new frappe.Chart("#grafica", {
        data: {
          labels: vnode.attrs.labels,
          datasets: [
            { values: vnode.attrs.values }
          ]
        },
        type: 'donut',
        colors: ['red'],
        height: 400
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
                 sumas.push(sumas[i-1] + parseFloat(entry[2],10))
                 i++
                 
                return m("tr", [
                  m("td", {}, entry[1]),
                  m("td.right aligned", {}, formatoNumero(entry[2]))
                ])
              }),
                m("tr.active", [
                  m("td", m("b","OPERACIONES CORRIENTES CAP.(1/4)")),
                  m("td.right aligned", {}, m("b", formatoNumero(sumas[4])))//dato = dato[0].dato.slice(0,4)[2].reduce((a,b) => a+b))
                ]),
                m("tr.active", [
                  m("td", m("b","OPERACIONES NO FINANCIERAS CAP.(1/9)")),
                  m("td.right aligned", {}, m("b", formatoNumero(sumas[7])))//dato = dato[0].dato.slice(0,4)[2].reduce((a,b) => a+b))
                ]),
                m("tr.active", [
                  m("td", m("b","OPERACIONES EJERCICIO CAP.(1/9)")),
                  m("td.right aligned", {}, m("b", formatoNumero(sumas[9])))//dato = dato[0].dato.slice(0,4)[2].reduce((a,b) => a+b))
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
