const http = require('http');
const fs = require('fs');
const path = require('path');
const {buildHtml, parseRequest, writeFileToResponse, write404ToResponse} = require("./html.builder");
const {subjects, watcher} = require("./subject");


const handles = {}

/**
 * 处理根请求，展示课程列表
 * @param res - 响应对象
 */
handles.handleRootRequest = (res) => {
    const html = buildHtml("Programing Study").addCssLink("/css/index.css").addCssLink("/css/base.css")
    const content = html.addBody(` 
        <div id='pageContent'>
            <div class="page-header">
                <h1>Available Subjects</h1>
                <p>Choose a subject to explore lessons and documentation</p>
            </div>
            <div class="subject-list">
                ${subjects.map(subject => {
                    return `<a target='_blank' class='subject-block btn' href="/${subject.id}">
                        <h3>${subject.name}</h3>
                        <div class='subject-desc'>
                            <div class="subject-stats">
                                <span class="lesson-count">${subject.lessons.length} lessons</span>
                                <span class="doc-count">${subject.documentCount} documents</span>
                            </div>
                        </div>
                    </a>`
                }).join("")}
            </div>
        </div>
    `).build();

    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    res.end(content);
}

handles.handleRootRequest.canServe = (type) => {
    return type === '';
}

/**
 * 处理静态资源请求
 * @param res - 响应对象
 * @param reqUriDesc - 请求描述对象
 */
handles.handleAssetsRequest = (res, reqUriDesc) => {
    writeFileToResponse(res, path.resolve(__dirname) + '/../assets/' + reqUriDesc.uri);
}
handles.handleAssetsRequest.canServe = (type) => {
    return ['css', 'js', 'images', 'font'].includes(type);
}

/**
 * 处理node_modules资源请求
 * @param res - 响应对象
 * @param reqUriDesc - 请求描述对象
 */
handles.handleNodeModulesRequest = (res, reqUriDesc) => {
    let nodeModulesPath = path.resolve(__dirname) + '/../node_modules/' + reqUriDesc.resource;
    if (!fs.existsSync(nodeModulesPath)) { // 全局安装的模块，依赖可能在更上层的node_modules目录中
        nodeModulesPath = path.resolve(__dirname) + '/../../' + reqUriDesc.resource;
    }
    writeFileToResponse(res, nodeModulesPath);

}
handles.handleNodeModulesRequest.canServe = (type) => {
    return type === 'node_modules';
}

/**
 * 处理subject请求
 */
handles.handleSubjectRequest = (res, reqUriDesc) => {
    if (reqUriDesc.segments.length === 0) {
        write404ToResponse(res);
    } else {
        const subject = subjects.find(subject => subject.id === reqUriDesc.segments[0]);
        if (subject === undefined) {
            write404ToResponse(res);
        } else {
            if (reqUriDesc.segments.length === 1) {
                // 重新加载subject下的详细内容，防止新增课程后无法及时展示
                const content = buildHtml(`${subject.name}`)
                    .addCssLink("/css/subject.css")
                    .addCssLink("/css/base.css")
                    .addJsLink("/js/subject.js")
                    .addBody(`
                        <div id='pageContent'>
                            <div class="subject-header">
                                <h1 class='pro-title'>${subject.name}</h1>
                            </div>
                            
                            <div class="lesson-tabs-container">
                                <div class="lesson-tabs">
                                    ${subject.lessons.map(lesson => `<span class="lesson-tab" lesson="${lesson.id}">${lesson.name} <span class="lesson-count-badge">${lesson.docs.length}</span></span>`).join("")}
                                </div>
                            </div>
                            
                            ${subject.lessons.map(lesson => `<div class="lesson-list" lesson="${lesson.id}"><div class="lesson-grid">${lesson.docs.map(doc => `<a target="_blank" class="lesson-item btn" href="/${subject.id}/${lesson.id}/${doc.id}" ><h3>${doc.name}</h3></a>`).join("")}</div></div>`).join("")}
                        </div>
                    `)
                    .build();

                res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
                res.end(content);
            } else {
                const lesson = subject.lessons.find(lesson => lesson.id === reqUriDesc.segments[1]);
                let doc = undefined;
                if (lesson !== undefined) {
                    reqUriDesc.segments[1] = lesson.name
                    doc = lesson.docs.find(doc => doc.id === reqUriDesc.segments[2]);
                    if (doc !== undefined) {
                        reqUriDesc.segments[2] = doc.originalFileName
                    }
                }
                const filePath = path.resolve(subject.path, ...reqUriDesc.segments.slice(1));
                if (doc === undefined) {
                    writeFileToResponse(res, filePath);
                } else {
                    // 如果文件不存在，则返回404
                    if (!fs.existsSync(filePath)) {
                        write404ToResponse(res);
                    } else {
                        const m1 = fs.readFileSync(filePath)
                        // 使用base64编码，防止特殊字符导致的解析错误
                        const mdContent = m1.toString('base64');
                        const content = buildHtml(`${doc.name}`)
                            .addCssLink("/css/prism.min.css")
                            .addCssLink("/css/base.css")
                            .addCssLink("/css/doc.css")
                            .addCssLink("/css/github-markdown.css")
                            .addJsLink("/node_modules/marked/lib/marked.umd.js")
                            .addJsLink("/node_modules/prismjs/prism.js")
                            .addJsLink("/node_modules/prismjs/plugins/autoloader/prism-autoloader.js")
                            .addJsLink("/js/markdown-renderer.js")
                            .addBody(`
                                <div id="pageContent">
                                    <div class="doc-container">
                                        <div class="doc-header">
                                            <h1 class="pro-title">${doc.name}</h1>
                                        </div>
                                        <div id="docBlock" class="doc-content"></div>
                                    </div>
                                </div>
                                <div class="back-to-top" title="Back to top">↑</div>
                            `)
                            .addBody(`<template id="md-content">${mdContent}</template>`)
                            .build();
                        res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
                        res.end(content);
                    }
                }
            }
        }
    }

}


/**
 * 启动一个web服务展示学习的课程
 * @param {number} port - 监听的端口号
 */
const startWebServer = (port = 3000) => {
    const server = http.createServer((req, res) => {
        const reqUriDesc = parseRequest(req);
        const handle = Object.values(handles).find(handle => handle.canServe && handle.canServe(reqUriDesc.type)) || handles.handleSubjectRequest;
        // Pass subjects to handle function so it uses the latest version
        if (handle === handles.handleSubjectRequest) {
            handle(res, reqUriDesc);
        } else {
            handle(res, reqUriDesc);
        }
    });
    server.on('error', (e) => console.log(e.message));
    server.listen(port, () => console.log(`\nServer is running at http://localhost:${port}`));
}

module.exports = {
    startWebServer
};