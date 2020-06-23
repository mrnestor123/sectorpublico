import { api_get } from './util.js'
import { Chart } from "frappe-charts"

var root = document.body;

/*
https://sql.digitalvalue.es/sql/santcugatdelvalles/SELECT p.codi,p.descripcio, SUM(total) as total FROM  plan_economica p JOIN gastos g ON p.codi = SUBSTRING(g.economica,1,LENGTH(p.codi)) WHERE exercici = 2020 and (('undefined' = 'undefined' and p.codi like '_') OR g.programa like 'undefined%') GROUP BY p.codi,p.descripcio

Habra que hacer un api_get
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
        m(".ui.inverted.segment", { style: "height:150px" }, m(".ui.huge.centered.header", { style: "margin:auto" }, "Sector Público")),

      ]
    }
  }
}