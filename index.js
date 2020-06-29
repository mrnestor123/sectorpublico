import { api_get, formatoNumero, getData } from './util.js'
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
  oninit: function (vnode) {
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
        formatTooltipY: d => formatoNumero(d) + ' €',
      }
    })
    grafica.parent.addEventListener('data-select', (e) => {
      console.log(e);
      vnode.attrs.selectedtitle = e.label;
      var index = Number(e.index) + 1;
      api_get(`SELECT p.codi,p.descripcio, SUM(total) as total FROM  plan_economica p JOIN gastos g ON p.codi = SUBSTRING(g.economica,1,LENGTH(p.codi)) WHERE exercici = 2020 and (('undefined' = 'undefined' and p.codi like '${index}_') OR g.programa like 'undefined') GROUP BY p.codi,p.descripcio`).then(
        (res) => {
          vnode.attrs.selected.title = e.label;
          vnode.attrs.selected.list = getData(res);
          vnode.attrs.selected.type = 'pie';
          console.log(vnode.attrs);
          m.redraw();
        });
    })
  },
  view: function (vnode) {

  }
}

var InteractiveSegment = {
  view: function (vnode) {
    console.log(vnode.attrs);
    return m(".ui.segment", [
      m("h5.ui.large.centered.header", { style: "margin-top:10px" }, vnode.attrs.selected.title),
      m(".large.ui.centered.buttons", { style: "margin:auto" }, [
        m(".ui.button", {
          class: vnode.attrs.selected.type === 'pie' ? 'disabled' : '', onclick: function () {
            vnode.attrs.selected.type = 'pie';
          }
        }, "Pie"),
        m(".ui.button", {
          class: vnode.attrs.selected.type === 'donut' ? 'disabled' : '', onclick: function () {
            vnode.attrs.selected.type = 'donut';
          }
        }, "Donut"),
        m(".ui.button", {
          class: vnode.attrs.selected.type === 'percentage' ? 'disabled' : '', onclick: function () {
            vnode.attrs.selected.type = 'percentage';
          }
        }, "Percentage")
      ]),
      m("div", { id: "selected_chart" }),
      m(InteractiveGrafica, vnode.attrs.selected)
    ])
  }
}


var InteractiveGrafica = {
  view: function (vnode) {
    //console.log(vnode.attrs)
    let grafica = new frappe.Chart('#selected_chart', {
      data: {
        labels: vnode.attrs.list[0],
        datasets: [
          { values: vnode.attrs.list[2], }
        ],
      },
      type: vnode.attrs.type,
      colors: ['red'],
    })
  }
}


//On the main page we get the data and pass it to all the charts
function MainPage() {
  //el grafico de barras. Tiene un paramétro selected para saber que ha seleccionado
  var axischart = { values: [], labels: [], selected: {}, div: '#grafica', type: 'bar', percentages: [] }

  var data = [];
  var dataTabla = [];

  var anyo = 2020;
  var ant = 2020;

  function load(){
    api_get(`SELECT p.codi,p.descripcio, SUM(total) as total FROM  plan_economica p JOIN gastos g ON p.codi = SUBSTRING(g.economica,1,LENGTH(p.codi)) WHERE exercici = ${anyo} and (('undefined' = 'undefined' and p.codi like '_') OR g.programa like 'undefined') GROUP BY p.codi,p.descripcio`)
    .then((res) => {
      data = getData(res);
      dataTabla = res[0].data
      axischart.values = data[1];
      axischart.labels = data[0];
      axischart.percentages = data[2];
      m.redraw();
    }
  )}

  return {
    //sacamos los datos de la base de datos. Todas las tablas tendrán los mismos datos
    oninit: function (vnode) {
      load()
        console.log(axischart.values);
      },
     
    view: function(vnode) {


      if  (anyo != ant) {
        ant = anyo
        load()
      }

      /*api_get("SELECT p.codi,p.descripcio, SUM(total) as total FROM  plan_economica p JOIN gastos g ON p.codi = SUBSTRING(g.economica,1,LENGTH(p.codi)) WHERE exercici = 2020 and (('undefined' = 'undefined' and p.codi like '_') OR g.programa like 'undefined') GROUP BY p.codi,p.descripcio").then((res) => {
        data = getData(res);
        axischart.values = data[1];
        axischart.labels = data[0];
        axischart.percentages = data[2];
        console.log(vnode.attrs.first.values.length);
        m.redraw();
      })*/

      return [
        m(".ui.inverted.segment", { style: "height:150px" },
          m("h1.ui.huge.centered.header", { style: "margin-top:20px;" }, "SECTOR PÚBLICO"),
          m("h6.ui.large.centered.header", { style: "font-style:italic" }, "Los datos de tu comunidad a tu alcance")),
          m(".ui.container", { style: "text-align:center" }, [
          m(".ui.segment", [
        m(".ui.buttons", [
          //boton año anterior
          m("button.ui.labeled.icon.button", { onclick: () => {anyo -=1; axischart.values = []; axischart.labels = []; axischart.percentages = [];}}, 
            m("i.left.chevron.icon"), anyo-1),
          //año de los datos
          m("button.ui.disabled.black.button", anyo),
          //boton año siguiente
          m("button.ui.right.labeled.icon.button", {onclick: () => { anyo+=1; axischart.values = []; axischart.labels = []; axischart.percentages = [];}},
            m("i.right.chevron.icon"),anyo+1),
          ]),
       
          m('.ui.segment',
            m("h5.ui.large.centered.header", { style: "margin-top:10px" }, "Información de la hacienda local"),
            m("div", { id: 'tabla' }),
            axischart.values.length > 0 ? m(TablaGasto, {dataTabla}) : null,
          ),
          m(".ui.segment", { style: "margin-top:25px" }, [
            m("h5.ui.large.centered.header", { style: "margin-top:10px" }, "Gráficas interactivas"),
            m("div", { id: 'grafica' }),
            axischart.values.length > 0 ? m(Grafica, axischart) : null,
          ]),
          Object.keys(axischart.selected).length > 0 ? m(InteractiveSegment, axischart) : null,
        ]),
      ]) //    m(Gastos)
      ]
    }
  }
}


function TablaGasto(vnode) {
  var data = vnode.attrs.dataTabla;
  let sumas = [];
  var i = 1;
  //podria ser Date.getYear()

  return {
      view: function(vnode) {
        i=1;
          return data ? [
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
            m("table.ui.celled.table", 
            m("thead", 
                m("tr", [
                    m("th", "CAPÍTULOS DE GASTO0S(€)"),
                    m("th.right aligned", "Creditos iniciales")
                ])
            )
          )]
          } 
    
  }
}