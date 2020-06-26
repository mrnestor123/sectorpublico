function Tabla(){
    return {
        view: function(vnode) {
            return m(".ui.celled.table", [
                m("thead", 
                    m("tr", [
                        m("th", "CAPÍTULOS DE INGRESOS"),
                        m("th", "Previsiones iniciales")
                    ])
                ),
                m("tbody", [
                    m("tr", [
                        m("td", {"data-label": "CAPITULOS DE INGRESOS"}, "1.- IMPUESTOS DIRECTOS"),
                        m("td", {"data-label": "Previsiones iniciales"}, "39.097.913,61")
                    ]),
                    m("tr", [
                        m("td", {"data-label": "CAPITULOS DE INGRESOS"}, "2.- IMPUESTOS INDIRECTOS"),
                        m("td", {"data-label": "Previsiones iniciales"}, "34.836.281,07")
                    ]),
                    m("tr.active", [
                        m("td", {"data-label": "CAPITULOS DE INGRESOS"}, "OPERACIONES CORRIENTES CAP.(1/5)"),
                        m("td", {"data-label": "Previsiones iniciales"}, "461.327.023,88")
                    ])
                ])
            ])
        }
    }
}

export { Tabla }