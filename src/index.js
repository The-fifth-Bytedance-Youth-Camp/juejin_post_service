const app = require('../app');
const postRouter = require('./routes/post');
const coverRouter = require('./routes/cover');
const websiteRouter = require('./routes/website');
const { withBin } = require('./utils/routerFactory');

app.use('/post', postRouter);
app.use('/cover', coverRouter);
app.use('/website', websiteRouter);
app.use('/tag', withBin('tag'));
app.use('/category', withBin('category'));

module.exports = app;