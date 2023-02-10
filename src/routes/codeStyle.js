const express = require('express');
const router = express.Router();
const DirectoryManger = require('../utils/directoryManger');
const path = require('path');

router.get('/search', (req, res) => {
    const { keyword } = req.query;
    try {
        const codeStyleManger = new DirectoryManger(path.join(__dirname, '../../public/codeStyle'));
        const result = codeStyleManger.themes?.filter(item => item.includes(keyword));
        res.json({
            code: 200,
            result,
        });
    } catch ({ message }) {
        res.json({
            code: 500,
            msg: message,
        });
    }
});

// 上传文件
router.post('/insert', () => {

});

module.exports = router;
