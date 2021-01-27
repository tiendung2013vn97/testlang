module.exports = {
    up: function (queryInterface, Sequelize) {
        return Promise.all([
            queryInterface.renameColumn('translate', 'raw', 'words'),
            queryInterface.renameColumn('translate', 'pronoun', 'translate'),
        ]);
    }, 
};