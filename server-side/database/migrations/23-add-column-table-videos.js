module.exports = {
    up: function (queryInterface, Sequelize) {
        return Promise.all([
            queryInterface.addColumn(
                'videos',
                'duration',
                {
                    type: Sequelize.FLOAT,
                    defaultValue: 0
                }
            ),
            queryInterface.addColumn(
                'videos',
                'subtitles', Sequelize.TEXT
            ),
        ]);
    }, 
};