const errorCatch = (err, req, res) => {
    // 这次错误是由 token 解析失败导致的
    if (err.name === 'UnauthorizedError') {
        return res.json({
            status: 401,
            message: '无效的token',
        });
    }
    res.json({
        status: 500,
        message: '未知的错误',
    });
};

module.exports = errorCatch;