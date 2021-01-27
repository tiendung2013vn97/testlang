module.exports = {
    up: function (queryInterface, Sequelize) {
        return Promise.all([
            queryInterface.addColumn(
                'users',
                'phone', Sequelize.STRING
            ),

        ]);
    }, 
};