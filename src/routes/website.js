const express = require('express');
const database = require('../utils/database');
const router = express.Router();

// 作者文章数量以及排行榜
router.get('/list/post', async (req, res) => {
    // 记得取消引入注释 database.xxx
    // res.json(req.query); 记得删，不写的话 eslint 报错
    const { name }=req.query;
    try{
        const result= await database.select('name','rankList')
            .from('watch')
            .where('name',name)
            .queryList();
        res.json({
            code: 200,
            ...result,
        });
    }catch ({ message }) {
        res.json({
            code: 500,
            msg: message,
        });
    }
});

// 网站日全部阅读量
router.get('/watch/daily', async (req, res) => {

    const { date }=req.query;
    try{
        const result= await database.select('num')
            .from('watch')
            .where('date',date)
            .queryList();
        res.json({
            code: 200,
            ...result,
        });
    }catch ({ message }) {
        res.json({
            code: 500,
            msg: message,
        });
    }
});

// 网站月全部阅读量
router.get('/watch/month', (req, res) => {
    res.json(req.query);
});

module.exports = router;