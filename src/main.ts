import "./assets/tailwind.css"

import { createApp } from "vue"
import App from "./App.vue"
import router from "./router"
import { clerkPlugin } from "@clerk/vue"
import { clerkOptions } from "./lib/clerk"

const app = createApp(App)

app.use(router)
app.use(clerkPlugin, clerkOptions)

app.mount("#app")
