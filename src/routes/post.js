const { withCRUD } = require('../utils/routerFactory');
const database = require('../utils/database');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const express = require('express');
const router = express.Router();
const uploadsPath = path.join(__dirname, '../../public/uploads');

const findBy = (field, value, page, rows) => {
    return database.select('*')
        .from('post')
        .where(field, value)
        .queryListWithPaging(page, rows);
};

router.get('/find/category', async (req, res) => {
    const { category, page, rows } = req.query;
    try {
        const result = await findBy('category', category, page, rows);
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

router.get('/find/tag', async (req, res) => {
    const { tag, page, rows } = req.query;
    try {
        const result = await database.select('*')
            .from('tag_post')
            .where('tag', tag)
            .queryListWithPaging(page, rows);
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

router.get('/find/author', async (req, res) => {
    const { author, page, rows } = req.query;
    try {
        const result = await findBy('author', author, page, rows);
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

router.get('/find/state', async (req, res) => {
    const { state, page, rows } = req.query;
    try {
        const result = await findBy('state', state, page, rows);
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

// 根据 id 删除数据
// 删除中间表的数据
// 删除文章封面
router.post('/delete', async (req, res) => {
    const { id } = req.body;
    try {
        await database
            .delete('post')
            .where('id', id)
            .execute();
        await database
            .delete('tag_post')
            .where('post', id)
            .execute();
        let filePath = path.join(uploadsPath, `./jpeg/${ id }.jpeg`);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        filePath = path.join(uploadsPath, `./webp/${ id }.webp`);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        res.json({ code: 200 });
    } catch ({ message }) {
        res.json({ code: 500, msg: message });
    }
});

// 阅读量统计
router.get('/watch', async (req, res) => {
    const { id } = req.query;
    try {
        const result = await database.sql(`
            UPDATE post
            SET watch_num = post.watch_num + 1
            WHERE id = ?
        `, [ id ]);
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
            code: 304,
            msg: '没有权限添加文章',
        });
    }
    const gmt_created = moment().format('YYYY-MM-DD HH:mm:ss');
    const body = req.body;
    const images = body?.images || [];
    delete body?.images;
    const tags = body?.tags;
    delete body?.tags;
    try {
        const result = await database.insert('post', {
            ...body, author: id, gmt_created, gmt_modified: gmt_created,
        }).execute();
        for (const image of images) {
            await database.insert('image', {
                post: result?.insertId,
                image,
                gmt_created,
                gmt_modified: gmt_created,
            }).execute();
        }
        for (const tag of tags) {
            await database.insert('tag_post', {
                post: result?.insertId, tag, gmt_created,
                gmt_modified: gmt_created,
            }).execute();
        }
        // 删除缓存
        await database.delete('cache')
            .where('id', id)
            .execute();
        await database.delete('tag_cache')
            .where('admin', id)
            .execute();
        res.json({ code: 200, ...result });
    } catch (err) {
        res.json({ code: 500, err: err.message });
    }
});

module.exports = withCRUD('post', router);