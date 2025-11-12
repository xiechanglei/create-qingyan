const chokidar = require('chokidar');
const path = require('path');

/**
 * 文件变化监听器
 */
class FileWatcher {
    constructor() {
        this.watchers = new Map();
    }

    /**
     * 监听指定目录
     * @param {string} dirPath - 要监听的目录路径
     * @param {Function} callback - 文件变化时的回调函数
     */
    watch(dirPath, callback) {
        if (this.watchers.has(dirPath)) {
            // 如果已经存在监听器，先关闭它
            this.unwatch(dirPath);
        }

        // 使用 chokidar 监听目录变化
        const watcher = chokidar.watch(dirPath, {
            ignored: /(^|[\/\\])\../,  // 忽略隐藏文件
            persistent: true,
            ignoreInitial: true,  // 忽略初始的 add 事件
            followSymlinks: false,  // 不跟随符号链接
            depth: 10  // 监听的最大目录深度
        });

        // 监听各种事件
        watcher
            .on('add', (filePath) => {
                console.log(`文件新增: ${filePath}`);
                callback('add', filePath);
            })
            .on('change', (filePath) => {
                console.log(`文件变动: ${filePath}`);
                callback('change', filePath);
            })
            .on('unlink', (filePath) => {
                console.log(`文件删除: ${filePath}`);
                callback('unlink', filePath);
            })
            .on('addDir', (dirPath) => {
                console.log(`目录新增: ${dirPath}`);
                callback('addDir', dirPath);
            })
            .on('unlinkDir', (dirPath) => {
                console.log(`目录删除: ${dirPath}`);
                callback('unlinkDir', dirPath);
            })
            .on('error', (error) => {
                console.error(`监听出错: ${error}`);
            })
            .on('ready', () => {
                console.log(`开始监听目录: ${dirPath}`);
            });

        this.watchers.set(dirPath, watcher);
    }

    /**
     * 停止监听指定目录
     * @param {string} dirPath - 要停止监听的目录路径
     */
    unwatch(dirPath) {
        const watcher = this.watchers.get(dirPath);
        if (watcher) {
            watcher.close();
            this.watchers.delete(dirPath);
        }
    }

    /**
     * 停止所有监听
     */
    unwatchAll() {
        for (const [dirPath, watcher] of this.watchers) {
            watcher.close();
        }
        this.watchers.clear();
    }
}

module.exports = FileWatcher;