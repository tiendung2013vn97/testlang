module.exports = {
    up: function (queryInterface, Sequelize) {
        return Promise.all([
            queryInterface.addColumn(
                'users',
                'history_status', { type: Sequelize.STRING, defaultValue: 'active' }
            ),
        ]);
    },
};