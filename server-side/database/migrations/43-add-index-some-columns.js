module.exports = {
    up: function (queryInterface, Sequelize) {
        return Promise.all([
            queryInterface.addIndex(
                'categories',
                ['title', 'slug']
            ),
            queryInterface.addIndex(
                'videos',
                ['title', 'slug']
            ),
            queryInterface.addIndex(
                'news',
                ['title', 'slug']
            ),
            queryInterface.addIndex(
                'channel',
                ['title', 'slug']
            ),
            queryInterface.addIndex(
                'pages',
                ['title', 'slug']
            ),
        ]);
    }, 
};