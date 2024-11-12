import { createApp } from 'vue'
import './style.scss'
import App from './App.vue'
import { RaiderApi } from './services/RaiderApi'
import { Persistence } from './services/Persistence'

const app = createApp(App)

app.provide('raiderApi', new RaiderApi())
app.provide('persistence', new Persistence())
app.mount('#app')
