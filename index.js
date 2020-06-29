import { api_get, formatoNumero } from './util.js'
//import { Grafica } from './graficas.js'
//import { Tabla } from './tablas.js'

var root = document.body;




/*
https://sql.digitalvalue.es/sql/santcugatdelvalles/SELECT p.codi,p.descripcio, SUM(total) as total FROM  plan_economica p JOIN gastos g ON p.codi = SUBSTRING(g.economica,1,LENGTH(p.codi)) WHERE exercici = 2020 and (('undefined' = 'undefined' and p.codi like '1_') OR g.programa like 'undefined') GROUP BY p.codi,p.descripcio

https://sql.digitalvalue.es/sql/santcugatdelvalles/SELECT%20p.codi,p.descripcio,%20SUM(total)%20as%20total%20FROM%20%20plan_economica%20p%20JOIN%20gastos%20g%20ON%20p.codi%20=%20SUBSTRING(g.economica,1,LENGTH(p.codi))%20WHERE%20exercici%20=%202020%20and%20(('undefined'%20=%20'undefined'%20and%20p.codi%20like%20'1_')%20OR%20g.programa%20like%20'undefined%25')%20GROUP%20BY%20p.codi,p.descripcio



Habra que hacer un api_get

SELECT * FROM gastos where exercici=2020 limit 20
DESPESES FINANCERES"

SELECT p.codi,p.descripcio, SUM(total) as total FROM  plan_economica p JOIN gastos g ON p.codi = SUBSTRING(g.economica,1,LENGTH(p.codi)) WHERE exercici = 2020 and (('undefined' = 'undefined' and p.codi like '_') OR g.programa like 'undefined%') GROUP BY p.codi,p.descripcio
*/

m.route(root, '/', {
  '/': {
    view: (vnode) => {
      return m(MainPage);
    },
  },
});


var Grafica = {
  view: function (vnode) {
    let grafica = new frappe.Chart(vnode.attrs.div, {
      data: {
        labels: vnode.attrs.labels,
        datasets: [
          { values: vnode.attrs.values }
        ]
      },
      type: vnode.attrs.type,
      colors: ['red'],
      height: 400,
      isNavigable: 1,
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

    grafica.parent.addEventListener('data-select', (e) => {
      console.log(e);
      api_get(`SELECT p.codi, p.descripcio, SUM(total) as total FROM  plan_economica p JOIN gastos g ON p.codi = SUBSTRING(g.economica, 1, LENGTH(p.codi)) WHERE exercici = 2020 and(('undefined' = 'undefined' and p.codi like '${e.index}'_') OR g.programa like 'undefined%') GROUP BY p.codi, p.descripcio`).then((res) => console.log(res));


      /* vnode.attrs.selectedvalues;
       vnode.attrs.selectedlabels;
       vnode.attrs.selectedtype;
       m(interactiveGrafica)*/
    })
  }
}


var InteractiveGrafica = {
  view: function (vnode) {
    let grafica = new frappe.Chart(vnode.attrs.div, {
      data: {
        labels: vnode.attrs.selectedlabels,
        datasets: [
          { values: vnode.attrs.selectedvalues, }
        ],
      },
      type: vnode.attrs.selectedtype,
      isNavigable: 1,
      colors: ['red'],
    })
    console.log(grafica);
    grafica.parent.addEventListener('data-select', (e) => {
      console.log(e);
    })
  }
}



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

  var anyo = 2020;
  var ant = 2020
  var data = []

  function load(){
    api_get(`SELECT p.codi,p.descripcio, SUM(total) as total FROM  plan_economica p JOIN gastos g ON p.codi = SUBSTRING(g.economica,1,LENGTH(p.codi)) WHERE exercici = ${anyo} and (('undefined' = 'undefined' and p.codi like '_') OR g.programa like 'undefined') GROUP BY p.codi,p.descripcio`)
    .then((res) => {res[0].data.map((element) => {
      //the data that is less than 1 million is not added to the chart
      if (element[2] > 1000000) {
        labels.push(element[1])
        values.push(element[2]);
      }
      total += Number(element[2]);
    })
    values.map((element) => {
      percentages.push(Math.floor((element * 100) / total))
    })}
  )}

  return {
    //sacamos los datos de la base de datos. Todas las tablas tendrán los mismos datos
    oninit: function (vnode) {
      load()
        console.log(values);
      },
     
    view: function(vnode) {


      if  (anyo != ant) {
        ant = anyo
        load()
      }

      return [
        m(".ui.inverted.segment", { style: "height:150px" },
          m("h1.ui.huge.centered.header", { style: "margin-top:20px;" }, "SECTOR PÚBLICO"),
          m("h6.ui.large.centered.header", { style: "font-style:italic" }, "Los datos de tu comunidad a tu alcance")),
        m(".ui.centered.buttons", [
          //boton año anterior
          m("button.ui.labeled.icon.button", { onclick: () => {anyo -=1; values = []; labels = []; percentages = [];console.log(anyo, ant)}}, 
            m("i.left.chevron.icon"), anyo-1),
          //año de los datos
          m("button.ui.disabled.black.button", anyo),
          //boton año siguiente
          m("button.ui.right.labeled.icon.button", {onclick: () => { anyo+=1; values = []; labels = []; percentages = [];}},
            m("i.right.chevron.icon"),anyo+1),
          ]),
        m(".ui.container", { style: "text-align:center" }, [
          m('.ui.segment',
            m("h5.ui.large.centered.header", { style: "margin-top:10px" }, "Información de la hacienda local"),
            m("div", m(TablaGasto, {data:data, anyo:anyo}))
          ),
          m(".ui.segment", { style: "margin-top:25px" }, [
            m("h5.ui.large.centered.header", { style: "margin-top:10px" }, "Gráficas interactivas"),
            m("div", { id: 'grafica' }),
          ]),
          m('.ui.segment',
            m("h5.ui.large.centered.header", { style: "margin-top:10px" }, "Saca información de lo que elijas"),
            m(".large.ui.centered.buttons", { style: "margin:auto" }, [
              m(".ui.button", {
                class: selectedchart === 'pie' ? 'disabled' : '', onclick: function () {
                  selectedchart = 'pie'
                  vnode.attrs.graf.type = 'pie';
                }
              }, "Pie"),
              m(".ui.button", {
                class: selectedchart === 'donut' ? 'disabled' : '', onclick: function () {
                  selectedchart = 'donut'
                  vnode.attrs.graf.type = 'donut';
                }
              }, "Donut"),
              m(".ui.button", {
                class: selectedchart === 'percentage' ? 'disabled' : '', onclick: function () {
                  selectedchart = 'percentage'
                  vnode.attrs.graf.type = 'percentage';
                }
              }, "Percentage")
            ]),
            m("div", { id: "intpie" }),
            m("div", { id: "intaxis" })
          ),
          m('.ui.segment',
            m("h5.ui.large.centered.header", { style: "margin-top:10px" }, "Información de la hacienda local"),
            m("div", m(TablaGasto2))
          ),

          // values.length > 0 ? m(AxisChart, { labels: labels, values: values }) : null,
          values.length > 0 && selectedchart === 'pie' ? m(PieChart, { labels: labels, values: percentages }) : null,
          values.length > 0 && selectedchart === 'donut' ? m(DonutChart, { labels: labels, values: percentages }) : null,
          values.length > 0 && selectedchart === 'axis' ? m(Grafica, { labels: labels, values: values, div: '#grafica', type: 'bar' }) : null,
          values.length > 0 && selectedchart === 'percentage' ? m(Grafica, { labels: labels, values: percentages, div: '#grafica', type: 'percentage' }) : null,
          values.length > 0 ? m(InteractiveGrafica, { labels: labels, values: percentages, div: '#intpie', type: 'pie' }) : null,
          values.length > 0 ? m(InteractiveGrafica, { labels: labels, values: percentages, div: '#intpie', type: 'pie' }) : null,
          //sdata.length > 0 ? m(TablaGasto, {data : data}) : null
        ]),
        //    m(Gastos)
      ]
    }
  }
}

//función comun a casi todas las gráficas sin interacción. Se le pasa el tipo y los datos. Y el div en el que se pobla
/*function Grafica() {

}*/


//Pie Chart con interacción. Una vez clicas te sale una gráfica a partir de ella
/*function InteractiveGrafica() {
  return {
    view: function (vnode) {
      console.log(vnode.attrs.values);
      let grafica = new frappe.Chart(vnode.attrs.div, {
        data: {
          labels: vnode.attrs.labels,
          datasets: [
            { values: vnode.attrs.values, }
          ],
          yMarkers: [{ label: "Marker", value: 70 }],

          yRegions: [{ label: "Region", start: -10, end: 50 }]
        },
        type: vnode.attrs.type,
        isNavigable: 1,
        colors: ['red'],
      })
      console.log(grafica);
      grafica.parent.addEventListener('data-select', (e) => {
        console.log(e);
      })
    }
  }
}*/


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


function TablaGasto(vnode) {
  var data = [];
  let sumas = [];
  var i = 1;
  //podria ser Date.getYear()
  var anyo = 2020;

  return {
      view: function(vnode) {
        i=1;
          return data.length > 0 ? [
            m(".ui.buttons", [
              //boton año anterior
              m("button.ui.labeled.icon.button", { onclick: () => {
                  anyo-=1; 
                  api_get(`SELECT p.codi,p.descripcio, SUM(total) as total FROM  plan_economica p JOIN gastos g ON p.codi = SUBSTRING(g.economica,1,LENGTH(p.codi)) WHERE exercici = ${anyo} and (('undefined' = 'undefined' and p.codi like '_') OR g.programa like 'undefined') GROUP BY p.codi,p.descripcio`)
                  .then((res) => {data = res[0].data; i=1; sumas=[]; m.redraw()})}
                }, 
                m("i.left.chevron.icon"), anyo-1),
              //año de los datos
              m("button.ui.disabled.black.button", anyo),
              //boton año siguiente
              m("button.ui.right.labeled.icon.button", {onclick: () => {
                  anyo+=1; 
                  api_get(`SELECT p.codi,p.descripcio, SUM(total) as total FROM  plan_economica p JOIN gastos g ON p.codi = SUBSTRING(g.economica,1,LENGTH(p.codi)) WHERE exercici = ${anyo} and (('undefined' = 'undefined' and p.codi like '_') OR g.programa like 'undefined') GROUP BY p.codi,p.descripcio`)
                  .then((res) => { data = res[0].data; i=1; m.redraw()})}
                },
                anyo+1, m("i.right.chevron.icon")),
            ]),
          m("table.ui.selectable.celled.orange.table", [
              m("thead", 
                  m("tr", [
                      m("th", "CAPÍTULOS DE GASTOS(€)"),
                      m("th.right aligned", "Creditos iniciales")
                  ])
              ),
              m("tbody", [data.map((entry) => {
                 //Codigo para calculo de costes por capitulos
                 sumas[0] = 0;
                 sumas[i] = sumas[i-1] + parseFloat(entry[2],10)
                 i++
                 console.log(i)
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
                  m("td.right aligned", {}, m("b", formatoNumero(sumas[data.length])))//dato = dato[0].dato.slice(0,4)[2].reduce((a,b) => a+b))
                ])
              ]
              )
          ])] : [
            m(".ui.buttons", [
            //boton año anterior
            m("button.ui.labeled.icon.button", { onclick: () => {
                anyo-=1; 
                api_get(`SELECT p.codi,p.descripcio, SUM(total) as total FROM  plan_economica p JOIN gastos g ON p.codi = SUBSTRING(g.economica,1,LENGTH(p.codi)) WHERE exercici = ${anyo} and (('undefined' = 'undefined' and p.codi like '_') OR g.programa like 'undefined') GROUP BY p.codi,p.descripcio`)
                .then((res) => {data = res[0].data; i=1; sumas=[]; m.redraw()})}
              }, 
              m("i.left.chevron.icon"), anyo-1),
            //año de los datos
            m("button.ui.disabled.black.button", anyo),
            //boton año siguiente
            m("button.ui.right.labeled.icon.button", {onclick: () => {
                anyo+=1; 
                api_get(`SELECT p.codi,p.descripcio, SUM(total) as total FROM  plan_economica p JOIN gastos g ON p.codi = SUBSTRING(g.economica,1,LENGTH(p.codi)) WHERE exercici = ${anyo} and (('undefined' = 'undefined' and p.codi like '_') OR g.programa like 'undefined') GROUP BY p.codi,p.descripcio`)
                .then((res) => { data = res[0].data; i=1; m.redraw()})}
              },
              anyo+1, m("i.right.chevron.icon")),
          ]),
            m("table.ui.celled.table", 
            m("thead", 
                m("tr", [
                    m("th", "CAPÍTULOS DE GASTOS(€)"),
                    m("th.right aligned", "Creditos iniciales")
                ])
            )
          )]
          } 
    
  }
}

function TablaGasto2() {
  var data = []
  var anyo = 2020

  return {
    oninit: function (vnode) {
      api_get(`SELECT * FROM gastos where exercici = ${anyo} limit 10`).then((res) => { data = res[0].data; console.log(data); })
    },
    view: function (vnode) {
      return data.length > 0 ? [
        m(BotoneraAños, {data: data, anyo: anyo}),
        m("table.ui.selectable.celled.red.table", [
        m("thead",
          m("tr", [
            m("th", "CAPÍTULOS DE GASTOS(€)"),
            m("th.right aligned", "Creditos iniciales")
          ])
        ),
        m("tbody", [data.map((entry) => {
          return m("tr", [
            m("td", {}, entry[5]),
            m("td.right aligned", {}, formatoNumero(entry[6]))
          ])
        }),
        ]
        )
      ])] : m("table.ui.celled.table",
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

var BotoneraAños = function(vnode) {
  let data = vnode.attrs.data
  let anyo = vnode.attrs.anyo
  return{
     view: function (vnode) {
        return m(".ui.buttons", [
        //boton año anterior
        m("button.ui.labeled.icon.button", { onclick: () => {
            anyo-=1; 
            api_get(`SELECT p.codi,p.descripcio, SUM(total) as total FROM  plan_economica p JOIN gastos g ON p.codi = SUBSTRING(g.economica,1,LENGTH(p.codi)) WHERE exercici = ${anyo} and (('undefined' = 'undefined' and p.codi like '_') OR g.programa like 'undefined') GROUP BY p.codi,p.descripcio`)
            .then((res) => {data = res[0].data; vnode.attrs.data = res[0].data; m.redraw()})}
          }, 
          m("i.left.chevron.icon"), anyo-1),
        //año de los datos
        m("button.ui.disabled.black.button", anyo),
        //boton año siguiente
        m("button.ui.right.labeled.icon.button", {onclick: () => {
            anyo+=1; 
            api_get(`SELECT p.codi,p.descripcio, SUM(total) as total FROM  plan_economica p JOIN gastos g ON p.codi = SUBSTRING(g.economica,1,LENGTH(p.codi)) WHERE exercici = ${anyo} and (('undefined' = 'undefined' and p.codi like '_') OR g.programa like 'undefined') GROUP BY p.codi,p.descripcio`)
            .then((res) => { data = res[0].data; m.redraw()})}
          },
          anyo+1, m("i.right.chevron.icon")),
      ])
     }
   }
  }
  

/*m("input", {type:"range",  list:"anyos"}),
          m("datalist", {id:"anyos"}, [
            m("option", {value:"2015", label:"2015"}),
            m("option", {value:"2016", label:"2016"}),
            m("option", {value:"2017", label:"2017"}),
            m("option", {value:"2018", label:"2018"}),
            m("option", {value:"2019", label:"2019"}),
            m("option", {value:"2020", label:"2020"})
          ]),
*/