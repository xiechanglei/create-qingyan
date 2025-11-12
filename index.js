#!/usr/bin/env node
const {getCommandOptions,downloadSubjects} = require("./src/utils");
const {startWebServer} = require("./src/webserver");
const {subjects} = require("./src/subject");

const options = getCommandOptions();

if (options.init) {
    const remoteUrl = options.remoteUrl || 'https://github.com/xiechanglei/program-study-subjects';
    downloadSubjects(remoteUrl).then(() => {
        console.log('课程材料下载成功！现在运行: yarn create qingyan (或 npx create-qingyan) 来启动服务器');
        process.exit(0);
    }).catch(err => {
        console.error('错误:', err.message);
        process.exit(1);
    });
} else {
    startWebServer(options.port, subjects);
}