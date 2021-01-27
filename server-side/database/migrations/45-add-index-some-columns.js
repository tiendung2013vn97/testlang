module.exports = {
    up: function (queryInterface, Sequelize) {
        return Promise.all([
            queryInterface.addIndex(
                'categories',
                ['id']
            ),
            queryInterface.addIndex(
                'category_news',
                ['id', 'category_id', 'new_id']
            ),
            queryInterface.addIndex(
                'category_videos',
                ['id', 'category_id', 'video_id']
            ),
            queryInterface.addIndex(
                'channel',
                ['id', 'user_id']
            ),
            queryInterface.addIndex(
                'comments',
                ['id', 'user_id', 'video_id', 'parentId']
            ),
            queryInterface.addIndex(
                'history',
                ['id', 'user_id', 'video_id']
            ),
            queryInterface.addIndex(
                'langs',
                ['id', 'code']
            ),
            queryInterface.addIndex(
                'news',
                ['id']
            ),
            queryInterface.addIndex(
                'pages',
                ['id']
            ),
            queryInterface.addIndex(
                'payment_metas',
                ['id', 'payment_id', 'key']
            ),
            queryInterface.addIndex(
                'payments',
                ['id', 'code']
            ),
            queryInterface.addIndex(
                'settings',
                ['id', 'key']
            ),
            queryInterface.addIndex(
                'subscribes',
                ['id', 'channel_id', 'user_id']
            ),
            queryInterface.addIndex(
                'subtitle',
                ['id', 'start', 'end', 'video_id']
            ),
            queryInterface.addIndex(
                'transactions',
                ['id', 'payment_id', 'user_id', 'transaction_code', 'type']
            ),
            queryInterface.addIndex(
                'translate',
                ['id', 'words', 'translate', 'lang_id', 'count', 'type', 'lang_translate']
            ),
            queryInterface.addIndex(
                'users',
                ['id', 'account_type', 'history_status']
            ),
            queryInterface.addIndex(
                'video_payment',
                ['id', 'video_id', 'user_buy', 'user_sell']
            ),
            queryInterface.addIndex(
                'video_user',
                ['id', 'type', 'video_id', 'user_id']
            ),
            queryInterface.addIndex(
                'videos',
                ['id', 'title', 'user_id', 'lang_id', 'lang_translate']
            ),
        ]);
    }, 
};