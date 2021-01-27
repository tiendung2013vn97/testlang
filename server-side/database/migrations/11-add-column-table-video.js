module.exports = {
    up: function (queryInterface, Sequelize) {
        return Promise.all([
            queryInterface.addColumn(
                'videos',
                'view', Sequelize.INTEGER
            ),

        ]);
    }, 
};