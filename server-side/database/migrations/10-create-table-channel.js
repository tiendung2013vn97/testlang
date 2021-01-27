module.exports = {
    up: (queryInterface, Sequelize) => queryInterface.createTable('channel', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        user_id: {
            type: Sequelize.INTEGER,
            references: {
                model: "users",
                key: "id"
            }
        },
        title: Sequelize.STRING,
        slug: Sequelize.STRING,
        banner: Sequelize.STRING,
        status: {
            type: Sequelize.STRING,
            defaultValue: "active"
        },
        subcribes: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        },
        statusSub: {
            type: Sequelize.STRING,
            defaultValue: "show"
        },
        description: Sequelize.TEXT,

        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE
    }),
    down: (queryInterface, Sequelize) => queryInterface.dropTable("channel"),
};