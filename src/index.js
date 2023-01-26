const express = require('express');
const postRouter = require('./routes/post');
const coverRouter = require('./routes/cover');
const { withBin } = require('./utils/routerFactory');
const app = express();

app.use('/post', postRouter);
app.use('/cover', coverRouter);
app.use('/category', withBin('category'));
app.use('/tag', withBin('tag'));

module.exports = app;