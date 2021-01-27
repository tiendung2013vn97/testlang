module.exports = {
    up: function (queryInterface, Sequelize) {
        return Promise.all([
            queryInterface.renameColumn(
                'video_payment', 
                'user_id', 
                'user_buy'
            ),
            queryInterface.addColumn(
                'video_payment',
                'user_sell',
                {
                    type: Sequelize.INTEGER,
                    references: {
                        model: "users",
                        key: "id"
                    }
                }
            ),
            queryInterface.addColumn(
                'video_payment',
                'price', Sequelize.FLOAT,
            ),
            queryInterface.addColumn(
                'video_payment',
                'amount_buyer', Sequelize.FLOAT,
            ),
            queryInterface.addColumn(
                'video_payment',
                'amount_seller', Sequelize.FLOAT,
            ),
            queryInterface.addColumn(
                'video_payment',
                'commission', Sequelize.INTEGER,
            ),
        ]);
    }, 
};