import OneTimePassword from './components/OneTimePassword.vue'

export default {
	install: (app, options) => {
		app.component("OneTimePassword", OneTimePassword)
	}
}
