
var root = document.body;

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