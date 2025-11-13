#!/usr/bin/env node
const {getCommandOptions, downloadSubjects, packageJson} = require("./src/utils");
const {startWebServer} = require("./src/webserver");

const options = getCommandOptions();
console.log(`欢迎使用轻言课程材料管理工具，当前版本（${packageJson.version}），具体使用方法请参照文档: https://www.npmjs.com/package/create-qingyan`);
if (options.init) {
    const remoteUrl = options.remoteUrl || 'https://github.com/xiechanglei/program-study-subjects';
    downloadSubjects(remoteUrl).then(() => {
        console.log('课程材料下载成功！现在运行: yarn create qingyan (或 npx create-qingyan) 来启动服务器');
    }).catch(err => {
        console.error('错误:', err.message);
    }).finally(() => {
        process.exit(0);
    });
} else {
    startWebServer(options.port);
}