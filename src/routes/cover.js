const express = require('express');
const router = express.Router();
const sharp = require('sharp');
const imageSize = require('image-size');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();
const basicURL = `http://localhost:${ process.env.PORT }`;

const uploadsPath = path.join(__dirname, '../../public/uploads');

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, path.join(uploadsPath, './cache'));
    },
    filename(req, file, cb) {
        cb(null, new Date().getTime() + file.originalname);
    },
});

router.post('/upload', multer({ storage }).single('cover'), async (req, res) => {
    const { id } = req.body;
    const filePath = req.file.path;
    try {
        let { width } = imageSize(filePath);
        if (width > 1130) width = 1130;
        const sharpObj = sharp(filePath);
        await sharpObj
            .webp({ quality: 40 })
            .resize(width)
            .toFile(path.join(uploadsPath, `./webp/${ id }.webp`));
        await sharpObj
            .jpeg({ quality: 40 })
            .resize(width)
            .toFile(path.join(uploadsPath, `./jpeg/${ id }.jpeg`));
        res.send({
            success: true,
            url: [ `${ basicURL }/webp/${ id }.webp`, `${ basicURL }/jpeg/${ id }.jpeg` ],
        });
    } catch (err) {
        res.send({ success: false, err });
    } finally {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
});

module.exports = router;