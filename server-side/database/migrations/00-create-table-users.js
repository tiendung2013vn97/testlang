module.exports = {
    up: (queryInterface, Sequelize) =>
    queryInterface.createTable('users', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        email: Sequelize.STRING,
        username: Sequelize.STRING,
        password: Sequelize.STRING,
        account_type: Sequelize.STRING,
        mail_token: Sequelize.STRING,
        forgot_token: Sequelize.STRING,
        status: {
            type: Sequelize.STRING,
            defaultValue: 'inactive'
        },
        avatar: Sequelize.STRING,
        facebook_id: Sequelize.STRING,
        google_id: Sequelize.STRING,

        // Timestamps
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    }),
    down: (queryInterface, Sequelize) => queryInterface.dropTable('users'),
};
