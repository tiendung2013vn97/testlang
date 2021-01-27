module.exports = {
    up: function (queryInterface, Sequelize) {
        return Promise.all([
            queryInterface.changeColumn(
                'subtitle',
                'start', { 
                    type: Sequelize.FLOAT
                },
            ),
            queryInterface.changeColumn(
                'subtitle',
                'end', { 
                    type: Sequelize.FLOAT
                },
            ),
        ]);
    }, 
};