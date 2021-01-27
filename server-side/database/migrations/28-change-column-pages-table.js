module.exports = {
    up: function (queryInterface, Sequelize) {
        return Promise.all([
            queryInterface.changeColumn(
                'pages',
                'content', { 
                    type: Sequelize.TEXT('long') 
                },
            ),
            queryInterface.changeColumn(
                'pages',
                'seo_content', { 
                    type: Sequelize.TEXT('long') 
                },
            ),
        ]);
    }, 
};