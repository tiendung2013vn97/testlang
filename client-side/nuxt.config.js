const pkg = require('./package')
const fs = require('fs');
const path = require('path');

module.exports = {
    // server: {
    //     https: {
    //       key: fs.readFileSync(path.resolve(__dirname, 'localhost.key')),
    //       cert: fs.readFileSync(path.resolve(__dirname, 'localhost.crt'))
    //     }
    //   },
    mode: 'universal',

    /*
    ** Headers of the page
    */
    head: {
        title: 'Langadvisor',
        meta: [
            { charset: 'utf-8' },
            { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        ],
        link: [
            { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        ]
    },

    /*
    ** Customize the progress-bar color
    */
    loading: { color: '#fff' },

    /*
    ** Global CSS
    */
    css: [
    ],

    /*
    ** Plugins to load before mounting the App
    */
    plugins: [
        { src: '~/plugins/app.js', ssr: false }
    ],

    /*
    ** Nuxt.js modules
    */
    modules: [
    ],

    env: {
        API_PORT: 3001,
        SOCKET_PORT: 5001,
        CRON_SOCKET_PORT: 5002,
        SITE_NAME: 'Langadvisor',
        SALT_OBJECT: '123qwe!@#-gl',
        SALT_DECODE: 'langadvisor',
        YOUTUBE_API_KEY: 'AIzaSyBOn3FmdoRG7xGYnq7REuFaDhEA60vDjCo'
    },

    /*
    ** Build configuration
    */
    build: {
        /*
        ** You can extend webpack config here
        */
        extend(config, ctx) {
            vendor: ['vue-i18n']
        },
        maxChunkSize: 300000
    },

    performance: {
        hints: false
    },

    /*
    ** Router middleware
    */
    router: {
        middleware: [
            'template',
            'authentication',
            'set-store',
        ],
        scrollBehavior(to, from, savedPosition) {
            if (savedPosition) {
                return savedPosition
            }else {
                let position = {}
                if (to.matched.length < 2) {
                    position = { x: 0, y: 0 }
                }else if (to.matched.some(r => r.components.default.options.scrollToTop)) {
                    position = { x: 0, y: 0 }
                }
                if (to.hash) {
                    position = { selector: to.hash }
                }
                return position
            }
        }
    }
}
