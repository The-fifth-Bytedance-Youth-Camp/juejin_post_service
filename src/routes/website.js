const express = require('express');
const database = require('../utils/database');
const router = express.Router();

// 当日网站阅读量
router.get('/watch', async (req, res) => {
    const { id } = req.query;
    try {
        const result = await database.sql(`
            UPDATE post
            SET watch_num = post.watch_num + 1
            WHERE id = ?
        `, [ id ]).execute();
        res.json({
            code: 200,
            ...result,
        });
    } catch ({ message }) {
        res.json({
            code: 500,
            msg: message,
        });
    }
});

// 作者文章阅读量排行榜
router.get('/list/post', async (req, res) => {
    const { limit } = req.query;
    try {
        const result = await database.sql(`
            SELECT author, SUM(watch_num) AS total_watch_num
            FROM post
            GROUP BY author
            ORDER BY total_watch_num DESC
            LIMIT ?
        `, [ limit ]).execute();
        res.json({
            code: 200,
            ...result,
        });
    } catch ({ message }) {
        res.json({
            code: 500,
            msg: message,
        });
    }
});

// 网站日全部阅读量
router.get('/watch/daily', async (req, res) => {
    const { start, end } = req.query;
    try {
        const result = await database.sql(`
            SELECT *
            FROM website
            WHERE date BETWEEN ? AND ?
        `, [ start, end ]).execute();
        res.json({
            code: 200,
            ...result,
        });
    } catch ({ message }) {
        res.json({
            code: 500,
            msg: message,
        });
    }
});

module.exports = router;