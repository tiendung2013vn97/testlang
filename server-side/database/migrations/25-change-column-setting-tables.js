module.exports = {
    up: function (queryInterface, Sequelize) {
        return Promise.all([
            queryInterface.changeColumn(
                'settings',
                'value', 
                {
                    type: Sequelize.TEXT('long')
                }
            ),
        ]);
    }, 
};