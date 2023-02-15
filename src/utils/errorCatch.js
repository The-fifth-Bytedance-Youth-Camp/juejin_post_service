const errorCatch = (err, req, res, next) => {
    // 这次错误是由 token 解析失败导致的
    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({
            code: 401,
            msg: '无效的token',
        });
    }
    res.status(500).json({
        code: 500,
        msg: err?.name || '未知的错误',
    });
    next();
};

module.exports = errorCatch;