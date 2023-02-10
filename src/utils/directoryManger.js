const fs = require('fs');

class DirectoryManger {
    directoryPath = null;
    // 缓存文件夹信息
    cache = null;
    cacheModifiedTime = null;

    constructor(directoryPath) {
        this.directoryPath = directoryPath;
    }

    get themes() {
        const stats = fs.statSync(this.directoryPath);
        if (this.cacheModifiedTime === null || this.cacheModifiedTime !== stats.mtime.getTime()) {
            this.cacheModifiedTime = stats.mtime.getTime();
            // 扫描文件夹下的 css 文件
            const themes = fs.readdirSync(this.directoryPath)
                .filter(file => file.endsWith('.css'))
                .map(file => file.slice(0, -4));
            // 更新缓存
            this.cache = themes;
            return themes;
        } else {
            // 如果文件夹修改时间没有发生变化，直接返回缓存数据
            return this.cache;
        }
    }
}

module.exports = DirectoryManger;