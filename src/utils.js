const {program} = require("commander");
const https = require('https');
const fs = require('fs');
const path = require('path');

/**
 * 从package.json中获取版本号
 */
const packageJson = require('../package.json');

/**
 * 从命令行参数中获取所有选项
 * @return {Object} 包含所有命令选项的对象
 */
const getCommandOptions = () => {
    program.version(packageJson.version)
        .description(packageJson.description)
        .option("--port <number>", "设置服务器端口", "3000")
        .option("--init", "从远程仓库下载课程材料")
        .option("--remote <url>", "自定义课程材料的远程URL")
        .parse(process.argv);

    const options = program.opts();
    return {
        port: parseInt(options.port, 10),
        init: options.init || false,
        remoteUrl: options.remote || null
    };
}

/**
 * 将可读流内容写入指定文件，带进度条
 * @param stream {http.IncomingMessage} - 可读流
 * @param filePath
 * @param totalSize - 总大小，用于计算进度
 */
const transferStreamToFile = async (stream, filePath, totalSize) => {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filePath);
        let downloadedSize = 0;
        stream.on('data', (chunk) => {
            downloadedSize += chunk.length;
            if (totalSize && totalSize > 0) {
                const progress = ((downloadedSize / totalSize) * 100).toFixed(2);
                process.stdout.write(`\r下载进度: ${progress}% (${(downloadedSize / 1024 / 1024).toFixed(2)}MB / ${(totalSize / 1024 / 1024).toFixed(2)}MB)`);
            } else {
                process.stdout.write(`\r已下载: ${(downloadedSize / 1024 / 1024).toFixed(2)}MB`);
            }
        });

        stream.pipe(file);

        file.on('finish', () => {
            file.close();
            process.stdout.write('\n'); // New line after progress
            resolve();
        });
        file.on('error', (err) => {
            fs.unlink(filePath, () => {
            }); // Delete the file async
            reject(err);
        });
    });
}

/**
 * 从远程URL下载并解压课程材料
 * @param {string} remoteUrl - 远程URL
 * @return {Promise<void>}
 */
const downloadSubjects = async (remoteUrl) => {
    const downloadPath = process.cwd();
    
    // 检查当前目录是否为空
    const files = fs.readdirSync(downloadPath);
    if (files.length > 0) {
        throw new Error('当前目录不为空，请清空目录后重试。如有自己的课程文件，请先备份到其他位置，init成功后再移动回来。');
    }
    
    const tempZipPath = path.join(process.cwd(), 'online-subjects.zip');

    let downloadUrl = remoteUrl;
    if (remoteUrl.includes('github.com') && !remoteUrl.includes('archive')) {
        const match = remoteUrl.match(/github\.com\/([^\/]+\/[^\/]+)/);
        if (match) {
            downloadUrl = `https://github.com/${match[1]}/archive/refs/heads/master.zip`;
        }
    }
    console.log(`正在从以下地址下载: ${downloadUrl}`);
    // Download the zip file from remote URL, handling redirects
    await new Promise((resolve, reject) => {
        https.get(downloadUrl, (response) => {
            if (response.statusCode === 301 || response.statusCode === 302) {
                const redirectUrl = response.headers.location;
                if (redirectUrl) {
                    https.get(redirectUrl, (redirectResponse) => {
                        if (redirectResponse.statusCode !== 200) {
                            reject(new Error(`重定向后下载失败: ${redirectResponse.statusCode} ${redirectResponse.statusMessage}`));
                            return;
                        }
                        const totalSize = parseInt(redirectResponse.headers['content-length'], 10);
                        transferStreamToFile(redirectResponse, tempZipPath, totalSize).then(resolve).catch(reject);
                    }).on('error', (err) => {
                        reject(err);
                    });
                } else {
                    reject(new Error(`重定向时没有位置头信息: ${response.statusCode}`));
                }
            } else if (response.statusCode !== 200) {
                reject(new Error(`下载失败: ${response.statusCode} ${response.statusMessage}`));
            } else {
                const totalSize = parseInt(response.headers['content-length'], 10);
                transferStreamToFile(response, tempZipPath, totalSize).then(resolve).catch(reject);
            }
        }).on('error', reject);
    });

    console.log('下载完成。正在解压文件...');

    // Extract the zip file
    const AdmZip = require('adm-zip');
    const zip = new AdmZip(tempZipPath);

    // Extract to a temporary directory first to get the root folder name
    const zipEntries = zip.getEntries();
    if (zipEntries.length === 0) {
        throw new Error('下载的归档文件为空');
    }

    // Get the base directory name from the zip (usually the repo name with branch suffix)
    const baseDir = zipEntries[0].entryName.split('/')[0];

    // Extract the contents, but skip the base directory
    const filesToExtract = zipEntries.filter(entry => {
        const relativePath = entry.entryName.substring(baseDir.length + 1);
        return relativePath && !entry.isDirectory;
    });

    console.log(`正在解压 ${filesToExtract.length} 个文件...`);

    filesToExtract.forEach((entry, index) => {
        const relativePath = entry.entryName.substring(baseDir.length + 1);
        const fullPath = path.join(downloadPath, relativePath);

        // Ensure directory exists
        const dirPath = path.dirname(fullPath);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, {recursive: true});
        }

        // Extract file
        zip.extractEntryTo(entry, dirPath, false, true);

        // Show extraction progress
        const progress = ((index + 1) / filesToExtract.length * 100).toFixed(2);
        process.stdout.write(`\r解压进度: ${progress}% (${index + 1}/${filesToExtract.length} 个文件)`);
    });

    process.stdout.write('\n'); // New line after extraction progress
    console.log('解压完成。');

    fs.unlinkSync(tempZipPath);
};

module.exports = {
    getCommandOptions,
    downloadSubjects,
    packageJson
}