const express = require('express');
const database = require('../utils/database');
const moment = require('moment');
const router = express.Router();

router.get('/', async (req, res) => {
    const { id } = req.auth;
    try {
        const result = await database.select('*')
            .from('cache')
            .where('id', id)
            .queryRow();
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

router.post('/insert', async (req, res) => {
    const { id, isAdmin } = req.auth;
    if (!isAdmin) {
        res.json({
            code: 403,
            msg: '没有权限创建文章，请使用管理员账号',
        });
    }
    const { content } = req.body;
    const gmt_created = moment().format('YYYY-MM-DD HH:mm:ss');
    try {
        const result = await database.sql(`
            INSERT INTO cache (id, content, gmt_created, gmt_modified)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE content=?
        `, [ id, content, gmt_created, gmt_created, content ]).execute();
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