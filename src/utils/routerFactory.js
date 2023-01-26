const cron = require('node-cron');
const database = require('./database');
const moment = require('moment/moment');
const express = require('express');

function withCRUD(table) {
    const router = express.Router();

    // 传入 { 字段名: 值 } 插入数据
    router.post('/insert', async (req, res) => {
        const gmt_create = moment().format('YYYY-MM-DD HH:mm:ss');
        try {
            const result = await database.insert(table, { ...req.body, gmt_create });
            res.json({ success: true, result });
        } catch (err) {
            res.json({ success: false, err });
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
            res.json({ success: true, result });
        } catch (err) {
            res.json({ success: false, err });
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
            res.json({ success: true, result });
        } catch (err) {
            res.json({ success: false, err });
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
    const router = withCRUD(table);

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

    // 根据 id 删除数据
    router.post('/delete', async (req, res) => {
        const { id } = req.body;
        try {
            const result = await database
                .update(table, { is_delete: 1 })
                .where('id', id);
            res.json({ success: true, result });
        } catch (err) {
            res.json({ success: false, err });
        }
    });

    // 获取回收站内的数据
    router.post('/bin', async (req, res) => {
        const { page, rows } = req.query;
        const result = await database
            .select('*')
            .from(table)
            .where('is_delete', 1)
            .queryListWithPaging(page, rows);
        res.json(result);
    });

    // 清空回收站
    router.post('/bin/clear', async (req, res) => {
        try {
            const result = await database
                .delete(table)
                .where('is_delete', 1)
                .execute();
            res.json({ success: true, result });
        } catch (err) {
            res.json({ success: false, err });
        }
    });

    return router;
}

module.exports = { withCRUD, withBin };