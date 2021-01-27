module.exports = {
    up: function (queryInterface, Sequelize) {
        return Promise.all([
            queryInterface.addColumn(
                'videos',
                'price',
                {
                    type: Sequelize.FLOAT,
                    defaultValue: 0
                }
            ),
        ]);
    }, 
};