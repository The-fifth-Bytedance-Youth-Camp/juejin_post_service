const express = require('express');
const DirectoryManger = require('../utils/directoryManger');
const path = require('path');
const router = express.Router();

router.get('/search', (req, res) => {
    const { keyword } = req.query;
    try {
        const themeManger = new DirectoryManger(path.join(__dirname, '../../public/theme'));
        const result = themeManger.themes?.filter(item => item.includes(keyword));
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