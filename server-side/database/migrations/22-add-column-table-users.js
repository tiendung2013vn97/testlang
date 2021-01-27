module.exports = {
    up: function (queryInterface, Sequelize) {
        return Promise.all([
            queryInterface.addColumn(
                'users',
                'balance',
                {
                    type: Sequelize.FLOAT,
                    defaultValue: 0
                }
            ),
        ]);
    }, 
};