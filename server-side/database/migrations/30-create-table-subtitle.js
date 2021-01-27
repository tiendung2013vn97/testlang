module.exports = {
    up: (queryInterface, Sequelize) =>
    queryInterface.createTable('subtitle', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        start: {
            type: Sequelize.INTEGER,
        },
        end: {
            type: Sequelize.INTEGER,
        },
        full_mean: {
            type: Sequelize.TEXT,
        },
        default_mean: {
            type: Sequelize.TEXT,
        },
        raw_mean: {
            type: Sequelize.TEXT,
        },
        pronunciation: {
            type: Sequelize.TEXT,
        },
        video_id: {
            type: Sequelize.INTEGER,
            references: {
                model: "videos",
                key: "id"
            }
        },
        
        // Timestamps
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    }),
    down: (queryInterface, Sequelize) => queryInterface.dropTable('subtitle'),
};