const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const basePath = path.resolve(__dirname, 'subjects');
/**
 * 使用sha-256算法根据name生成id
 * @param name
 */
const buildId = (name) => {
    return crypto.createHash('sha256').update(name).digest('hex');
}
/**
 * subjects下面的所有目录做为subject,然后每个subject下面的所有目录做为lesson，每个lesson下面的所有.md文件做为document
 */
const subjects = fs.readdirSync(basePath)
    .filter(file => fs.statSync(path.join(basePath, file)).isDirectory()) // 过滤出目录
    .map(subjectDir => {
        let documentCount = 0;
        const lessons = fs.readdirSync(path.join(basePath, subjectDir))
            .filter(lessonDir => fs.statSync(path.join(basePath, subjectDir, lessonDir)).isDirectory())
            .map(lessonDir => {
                const docs = fs.readdirSync(path.join(basePath, subjectDir, lessonDir))
                    .filter(file => file.toLocaleLowerCase().endsWith('.md'))
                    .map(docFile => {
                        documentCount++;
                        return {
                            id: buildId(docFile),
                            name: docFile.substring(0, docFile.length - 3),
                            originalFileName: docFile
                        }
                    });
                return {
                    id: buildId(lessonDir),
                    name: lessonDir,
                    docs
                }
            });
        return {
            id: buildId(subjectDir),
            path: path.join(basePath, subjectDir),
            name: subjectDir,
            documentCount,
            lessons: lessons
        }
    });

module.exports = {
    subjects
}