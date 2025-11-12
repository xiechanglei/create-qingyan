const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * 使用sha-256算法根据name生成id
 * @param name
 */
const buildId = (name) => {
    return crypto.createHash('sha256').update(name).digest('hex');
}

/**
 * 检查给定路径是否为目录
 */
const isDirectory = (source) => {
    return fs.lstatSync(source).isDirectory();
};

/**
 * 从指定基础路径加载课程
 */
const loadSubjectsFromPath = (basePath) => {
    if (!fs.existsSync(basePath)) {
        return [];
    }

    return fs.readdirSync(basePath)
        .filter(file => {
            const filePath = path.join(basePath, file);
            return isDirectory(filePath); // 过滤出目录
        })
        .map(subjectDir => {
            let documentCount = 0;
            const subjectPath = path.join(basePath, subjectDir);
            const lessons = [{
                id: buildId('root_lessons_placeholder'),
                name: '未分类',
                docs: []
            }]
            fs.readdirSync(subjectPath)
                .forEach(lessonDir => {
                    const absLessonPath = path.join(subjectPath, lessonDir);
                    if (isDirectory(absLessonPath)) {
                        const lessonPath = path.join(subjectPath, lessonDir);
                        const docs = fs.readdirSync(lessonPath)
                            .filter(file => file.toLocaleLowerCase().endsWith('.md'))
                            .map(docFile => {
                                documentCount++;
                                return {
                                    id: buildId(docFile),
                                    name: docFile.substring(0, docFile.length - 3),
                                    originalFileName: docFile
                                }
                            });
                        lessons.push({
                            id: buildId(lessonDir),
                            name: lessonDir,
                            docs
                        })
                    } else {
                        // 处理根目录下的文档
                        if (lessonDir.toLocaleLowerCase().endsWith('.md')) {
                            documentCount++;
                            lessons[0].docs.push({
                                id: buildId(lessonDir),
                                name: lessonDir.substring(0, lessonDir.length - 3),
                                originalFileName: lessonDir
                            });
                        }
                    }
                });

            return {
                id: buildId(subjectDir),
                path: path.join(basePath, subjectDir),
                name: subjectDir,
                documentCount,
                lessons: lessons.filter(lesson => lesson.docs.length > 0)
            }
        }).filter(subject => subject.lessons.length > 0); // 只保留有课程的学科
};

let localSubjects = [];

const loadSubjects = () => {
    // Load subjects from both the packaged directory and the current working directory
    const localBasePath = process.cwd();
// Load subjects from both locations
    localSubjects = loadSubjectsFromPath(localBasePath);
}

loadSubjects();

module.exports = {
    subjects: localSubjects
}