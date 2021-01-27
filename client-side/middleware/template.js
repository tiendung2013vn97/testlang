/*
 * Set layouts template
 */
export default function ({ store, route }) {
    let { fullPath } = route;

    const template = fullPath.split('/')[1] ? fullPath.split('/')[1] : '';
    store.commit('setTemplate', template); // set store
}