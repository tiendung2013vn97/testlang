module.exports = {
    up: function (queryInterface, Sequelize) {
        return Promise.all([
            queryInterface.addColumn(
                'translate',
                'count',
                {
                    type: Sequelize.INTEGER,
                    defaultValue: 1
                }
            ),
        ]);
    }, 
};