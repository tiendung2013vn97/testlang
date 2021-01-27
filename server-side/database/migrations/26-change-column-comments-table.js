module.exports = {
    up: function (queryInterface, Sequelize) {
        return Promise.all([
            queryInterface.changeColumn(
                'comments',
                'content', 
                {
                    type: Sequelize.TEXT('long')
                }
            ),
        ]);
    }, 
};