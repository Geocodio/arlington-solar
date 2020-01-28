import Vue from 'vue'
import App from './App.vue'
import router from './router'
import VueLayers from 'vuelayers'
import 'vuelayers/lib/style.css'

Vue.config.productionTip = false

Vue.use(VueLayers)

var app = new Vue({
  router,
  render: h => h(App)
}).$mount('#app')

window.vm = app;