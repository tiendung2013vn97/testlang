module.exports = {
    up: function (queryInterface, Sequelize) {
        return Promise.all([
            queryInterface.addColumn(
                'videos',
                'lang_id',
                {
                    type: Sequelize.INTEGER,
                    references: {
                        model: "langs",
                        key: "id"
                    }
                }
            ),
        ]);
    }, 
};