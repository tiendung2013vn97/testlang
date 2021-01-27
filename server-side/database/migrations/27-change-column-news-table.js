module.exports = {
    up: function (queryInterface, Sequelize) {
        return Promise.all([
            queryInterface.changeColumn(
                'news',
                'content', { 
                    type: Sequelize.TEXT('long') 
                },
            ),
            queryInterface.changeColumn(
                'news',
                'comments', {
                    type: Sequelize.INTEGER,
                    defaultValue: 0,
                },
            ),
        ]);
    }, 
};