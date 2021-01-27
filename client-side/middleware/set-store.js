/*
 * Call Vuex actions to store some data
 */
export default function ({ app, store, route }) {
    if(!process.server) {
        store.dispatch('nuxtServerInit', { route, store });
    }
}