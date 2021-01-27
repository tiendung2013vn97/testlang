module.exports = {
    up: function (queryInterface, Sequelize) {
        return Promise.all([
            queryInterface.addColumn(
                'channel',
                'avatar', Sequelize.STRING
            ),
        ]);
    }, 
};