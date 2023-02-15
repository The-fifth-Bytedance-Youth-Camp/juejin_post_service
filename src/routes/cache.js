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
        const tags = (await database.select('tag')
            .from('tag_cache')
            .where('admin', id)
            .queryList())
            .map(t => t.tag);
        res.json({
            code: 200,
            ...result,
            tags,
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
    const { title, category, cover, content, tags, theme, code_style } = req.body;
    const gmt_created = moment().format('YYYY-MM-DD HH:mm:ss');
    try {
        if ((await database.select('id').from('cache').where('id', id).queryList())?.length) {
            let updateObj = { title, category, cover, content, theme, code_style };
            for (const k in updateObj) if (updateObj[k] === undefined) delete updateObj[k];
            if (Object.keys(updateObj).length) {
                await database.update('cache', updateObj)
                    .where('id', id)
                    .execute();
            }
        } else {
            await database.insert('cache', {
                id,
                title,
                category,
                cover,
                content,
                gmt_created,
                gmt_modified: gmt_created,
            }).execute();
        }
        if (tags) {
            await database.delete('tag_cache')
                .where('admin', id).execute();
            for (const tag of tags) {
                await database.insert('tag_cache', {
                    admin: id,
                    tag,
                    gmt_created,
                    gmt_modified: gmt_created,
                }).execute();
            }
        }
        res.json({
            code: 200,
            msg: '保存成功',
        });
    } catch ({ message }) {
        res.json({
            code: 500,
            msg: message,
        });
    }
});

module.exports = router;