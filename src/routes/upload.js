const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const tinify = require('tinify');
const uuid = require('uuid');

const upload = multer({ storage: multer.memoryStorage() });
const uploadsPath = path.join(__dirname, '../../public/uploads');
const basicURL = `http://localhost:${ process.env.PORT }/uploads`;
tinify.key = process.env.TINIFY_API_KEY;

// 截取随机部分
function generateRandomEight(str) {
    let start = Math.floor(Math.random() * (str.length - 8));
    let end = start + 8;
    return str.substring(start, end);
}

/**
 * 上传图片后自动压缩
 * https://tinify.com
 */
router.post('/image', upload.single('file'), async (req, res) => {
    const { downlink } = req.headers;
    const pid = generateRandomEight(uuid.v4());
    try {
        const source = tinify.fromBuffer(req.file.buffer);
        await source.toFile(path.join(uploadsPath, `/jpeg/${ pid }.jpeg`));
        await source.toFile(path.join(uploadsPath, `/webp/${ pid }.webp`));
        res.json({
            code: 200,
            pid,
            url: downlink === '4g' ? `${ basicURL }/jpeg/${ pid }.jpeg` : `${ basicURL }/webp/${ pid }.webp`,
        });
    } catch ({ message }) {
        res.json({
            code: 500,
            msg: message,
        });
    }
});

module.exports = router;
