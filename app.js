const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const cron = require('node-cron');
const fs = require('fs');
const rotatingFileStream = require('rotating-file-stream');
const morgan = require('morgan');
const dotenv = require('dotenv');
dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

const app = express();

const logPath = path.join(__dirname, './logs');
if (!fs.existsSync(logPath)) fs.mkdirSync(logPath);

const proLogger = morgan('combined', {
    immediate: false,
    skip(req, res) {
        return res.statusCode < 400;
    },
    stream: rotatingFileStream(() => `access-${ new Date().toISOString().slice(0, 10) }.log`, {
        interval: '1d',
        path: logPath,
    }),
});

app.use(isProduction ? proLogger : morgan('dev'));
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

// 每个月清理一次日志
cron.schedule('0 0 */30 * *', () => {
    delDir(logPath);
});

module.exports = app;
