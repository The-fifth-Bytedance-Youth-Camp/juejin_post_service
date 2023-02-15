const cron = require('node-cron');
const database = require('./database');
const moment = require('moment/moment');
const express = require('express');

function withCRUD(table, router = express.Router()) {
    // 传入 { 字段名: 值 } 插入数据
    router.post('/insert', async (req, res) => {
        console.log('==========');
        const gmt_created = moment().format('YYYY-MM-DD HH:mm:ss');
        try {
            const result = await database.insert(table, {
                ...req.body, gmt_created, gmt_modified: gmt_created,
            }).execute();
            res.json({ code: 200, ...result });
        } catch (err) {
            res.json({ code: 500, err: err.message });
        }
    });

    // 根据 id 删除数据
    router.post('/delete', async (req, res) => {
        const { id } = req.body;
        try {
            const result = await database
                .delete(table)
                .where('id', id)
                .execute();
            res.json({ code: 200, ...result });
        } catch (err) {
            res.json({ code: 500, err: err.message });
        }
    });

    // 根据 id 更新数据
    router.post('/update', async (req, res) => {
        const { id, newData } = req.body;
        try {
            const result = await database
                .update(table, newData)
                .where('id', id)
                .where('is_delete', 0)
                .execute();
            res.json({ code: 200, ...result });
        } catch (err) {
            res.json({ code: 500, err: err.message });
        }
    });

    // 根据 id 查找数据
    router.get('/find', async (req, res) => {
        const { id } = req.query;
        const result = await database
            .select('*')
            .from(table)
            .where('id', id)
            .where('is_delete', 0)
            .queryRow();
        res.json(result);
    });

    // 获取所有数据
    router.get('/all', async (req, res) => {
        const { page, rows } = req.query;
        const result = await database
            .select('*')
            .from(table)
            .where('is_delete', 0)
            .queryListWithPaging(page, rows);
        res.json(result);
    });

    return router;
}

function withBin(table) {
    const router = express.Router();

    // 每天删除时间超过30天的数据
    cron.schedule('0 0 0 * * *', () => {
        const oneMonthAgo = moment().subtract(30, 'days')
            .format('YYYY-MM-DD HH:mm:ss');
        database
            .delete(table)
            .where('is_delete', 1)
            .where('gmt_modified', oneMonthAgo, 'lt')
            .execute();
    });

    router.get('/search', async (req, res) => {
        const { keyword, field = 'name' } = req.query;
        let keywordStr = '';
        keyword.split(' ').forEach(keyword => {
            keywordStr += `%${ keyword }%`;
        });
        try {
            const result = await database.sql(`
                SELECT *
                FROM ${ table }
                WHERE ${ field } LIKE '${ keywordStr }'
                  AND is_delete != 1
            `).execute();
            res.json({ code: 200, result });
        } catch (err) {
            res.json({ code: 500, err: err.message });
        }
    });

    // 根据 id 删除数据
    router.post('/delete', async (req, res) => {
        const { id } = req.body;
        try {
            const result = await database
                .update(table, { is_delete: 1 })
                .where('id', id)
                .execute();
            res.json({ code: 200, ...result });
        } catch (err) {
            res.json({ code: 500, err: err.message });
        }
    });

    // 获取回收站内的数据
    router.get('/bin', async (req, res) => {
        const { page, rows } = req.query;
        try {
            const result = await database
                .select('*')
                .from(table)
                .where('is_delete', 1)
                .queryListWithPaging(page, rows);
            res.json({ code: 200, ...result });
        } catch (err) {
            res.json({ code: 500, err: err.message });
        }
    });

    // 清空回收站
    router.post('/bin/clear', async (req, res) => {
        try {
            const result = await database
                .delete(table)
                .where('is_delete', 1)
                .execute();
            res.json({ code: 200, ...result });
        } catch (err) {
            res.json({ code: 500, err: err.message });
        }
    });

    return withCRUD(table, router);
}

module.exports = { withCRUD, withBin };