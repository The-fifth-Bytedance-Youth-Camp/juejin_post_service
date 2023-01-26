const { withCRUD } = require('../utils/routerFactory');
const database = require('../utils/database');
const fs = require('fs');
const path = require('path');
const router = withCRUD('post');
const uploadsPath = path.join(__dirname, '../../public/uploads');

const findBy = (field, value, page, rows) => {
    return database.select('*')
        .from('post')
        .where(field, value)
        .queryListWithPaging(page, rows);
};

router.get('/find/category', async (req, res) => {
    const { category, page, rows } = req.query;
    const result = await findBy('category', category, page, rows);
    res.json(result);
});

router.get('/find/tag', async (req, res) => {
    const { tag, page, rows } = req.query;
    const result = await database.select('*')
        .from('tag_post')
        .where('tag', tag)
        .queryListWithPaging(page, rows);
    res.json(result);
});

router.get('/find/author', async (req, res) => {
    const { author, page, rows } = req.query;
    const result = await findBy('author', author, page, rows);
    res.json(result);
});

router.get('/find/state', async (req, res) => {
    const { state, page, rows } = req.query;
    const result = await findBy('state', state, page, rows);
    res.json(result);
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
        res.json({ success: true });
    } catch (err) {
        res.json({ success: false, err });
    }
});

module.exports = router;