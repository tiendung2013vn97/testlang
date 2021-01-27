module.exports = {
    up: function (queryInterface, Sequelize) {
        return Promise.all([
            queryInterface.changeColumn(
                'videos',
                'description', { 
                    type: Sequelize.TEXT('long') 
                },
            ),
        ]);
    }, 
};