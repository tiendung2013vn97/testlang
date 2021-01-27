/*
 * sets i18n.locale and state.locale if possible
 * redirects if not with locale
 * redirects if some page required login to access
 */
export default function ({ app, store, route }) {
    const url = '';
    store.dispatch('user/authentication', { url, route });
}