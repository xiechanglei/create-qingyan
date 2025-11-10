const fs = require('fs');

const HtmlBuilder = function (title) {
    this.headerHtml = "";
    this.bodyHtml = "";
    this.footerHtml = "";
    if (title) {
        this.addHeader(`<title>${title}</title>`);
    }
}

HtmlBuilder.prototype.addHeader = function (html) {
    this.headerHtml += html;
    return this;
}

HtmlBuilder.prototype.addBody = function (html) {
    this.bodyHtml += html;
    return this;
}

HtmlBuilder.prototype.addFooter = function (html) {
    this.footerHtml += html;
    return this;
}


HtmlBuilder.prototype.addCssLink = function (cssPath) {
    this.addHeader(`<link rel="stylesheet" href="${cssPath}">`);
    return this;
}

HtmlBuilder.prototype.addJsLink = function (jsPath) {
    this.addFooter(`<script src="${jsPath}" type="module"></script>`);
    return this;
}

HtmlBuilder.prototype.build = function () {
    return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">${this.headerHtml}</head><body>${this.bodyHtml}</body>${this.footerHtml}</html>`;
}


/**
 * html builder
 * @param {string|undefined} title
 * @return {HtmlBuilder}
 */
const buildHtml = (title) => {
    return new HtmlBuilder(title);
}


/**
 * 解析请求
 * @param req - 请求对象
 */
const parseRequest = (req) => {
    const segments = req.url.split("/").filter(seg => seg.length > 0);
    if (segments.length === 0) {
        return {type: ''};
    } else {
        return {
            type: segments[0],
            segments: segments,
            uri: req.url,
            resource: segments.slice(1).join("/")
        }
    }
}


/**
 * 根据文件路径获取Content-Type
 * @param filePath {string} 文件路径
 * @return {string} Content-Type
 */
const getContentTypeByFilePath = (filePath) => {
    const ext = filePath.split('.').pop().toLowerCase();
    switch (ext) {
        case "css":
            return "text/css; charset=utf-8";
        case "js":
            return "application/javascript; charset=utf-8";
        case "png":
            return "image/png";
        case "jpg":
        case "jpeg":
            return "image/jpeg";
        case "gif":
            return "image/gif";
        case "svg":
            return "image/svg+xml; charset=utf-8";
        case "html":
            return "text/html; charset=utf-8";
        case "woff":
            return "font/woff";
        case "woff2":
            return "font/woff2";
        case "ttf":
            return "font/ttf";
        case "eot":
            return "application/vnd.ms-fontobject";
        case "otf":
            return "font/otf";
        default:
            return "application/octet-stream";
    }
}

const write404ToResponse = (res) => {
    res.writeHead(404, {'Content-Type': 'text/plain; charset=utf-8'});
    res.end("404 Not Found");
}

const writeFileToResponse = (res, filePath) => {
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const contentType = getContentTypeByFilePath(filePath);
        res.writeHead(200, {'Content-Type': contentType});
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
        res.on('close', () => fileStream.destroy());
    } else {
        write404ToResponse(res);
    }
}

module.exports = {
    buildHtml, getContentTypeByFilePath, parseRequest,writeFileToResponse,write404ToResponse
}