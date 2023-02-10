const app = require('../app');
const postRouter = require('./routes/post');
const uploadRouter = require('./routes/upload');
const websiteRouter = require('./routes/website');
const cacheRouter = require('./routes/cache');
const themeRouter = require('./routes/theme');
const codeStyleRouter = require('./routes/codeStyle');
const { withBin } = require('./utils/routerFactory');
const errorCatch = require('./utils/errorCatch');

app.use('/post', postRouter);
app.use('/cache', cacheRouter);
app.use('/theme', themeRouter);
app.use('/upload', uploadRouter);
app.use('/website', websiteRouter);
app.use('/codeStyle', codeStyleRouter);
app.use('/tag', withBin('tag'));
app.use('/category', withBin('category'));

// 错误处理
app.use(errorCatch);

module.exports = app;