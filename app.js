const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const app = require('./src');
const cron = require('node-cron');
const fs = require('fs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, './public/uploads')));

function delDir(dir) {
    let files = fs.readdirSync(dir);
    for (let file of files) {
        let newPath = path.join(dir, file);
        let stats = fs.statSync(newPath);
        if (stats.isFile()) {
            fs.unlinkSync(newPath);
        } else {
            delDir(newPath);
        }
    }
}

// 两天清理一次日志
cron.schedule('0 0 0 */2 * *', () => {
    delDir(path.join(__dirname, './logs'));
});

module.exports = app;
