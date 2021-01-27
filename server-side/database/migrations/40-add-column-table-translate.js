module.exports = {
    up: function (queryInterface, Sequelize) {
        return Promise.all([
            queryInterface.addColumn(
                'translate',
                'type',
                {
                    type: Sequelize.STRING,
                }
            ),
            queryInterface.addColumn(
                'translate',
                'lang_translate',
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