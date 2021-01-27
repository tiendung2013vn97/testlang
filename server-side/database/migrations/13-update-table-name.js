
module.exports = {
    up: function (queryInterface, Sequelize) {
        return Promise.all([
            queryInterface.renameTable('channel_users', 'subscribes'),
        ]);
    }, 
};