const express = require('express');
// const database = require('../utils/database');
const router = express.Router();

// 作者文章数量以及排行榜
router.get('/list/post', (req, res) => {
    // 记得取消引入注释 database.xxx
    // res.json(req.query); 记得删，不写的话 eslint 报错
    res.json(req.query);
});

// 网站日全部阅读量
router.get('/watch/daily', (req, res) => {
    res.json(req.query);
});

// 网站月全部阅读量
router.get('/watch/month', (req, res) => {
    res.json(req.query);
});

module.exports = router;