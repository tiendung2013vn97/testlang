module.exports = {
    up: (queryInterface, Sequelize) =>
    queryInterface.createTable('translate', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        raw: Sequelize.STRING,
        pronoun: Sequelize.STRING,
        status: {
            type: Sequelize.STRING,
            defaultValue: 'active'
        },
        description: Sequelize.STRING,
        lang_id: {
            type: Sequelize.INTEGER,
            references: {
                model: "langs",
                key: "id"
            }
        },

        // Timestamps
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    }),
    down: (queryInterface, Sequelize) => queryInterface.dropTable('translate'),
};