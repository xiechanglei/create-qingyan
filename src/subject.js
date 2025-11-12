const chokidar = require('chokidar');
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
 * 加载指定学科目录下的课程
 * @param subjectPath
 * @return {{id: string, path: string, name: *, documentCount: number, lessons: {id: string, name: string, docs: *[]}[]}}
 */
const loadSubjectInfoFromDir = (subjectPath) => {
    //如果文件不存在，直接返回null
    if (!fs.existsSync(subjectPath)) {
        return {
            lessons: []
        };
    }
    let documentCount = 0;
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
    const name = path.basename(subjectPath);
    return {
        id: buildId(name),
        path: subjectPath,
        name,
        documentCount,
        lessons: lessons.filter(lesson => lesson.docs.length > 0)
    }
}

/**
 * 从指定基础路径加载课程
 */
const loadSubjectsFromPath = (basePath) => {
    if (!fs.existsSync(basePath)) {
        return [];
    }
    return fs.readdirSync(basePath)
        .map(file => path.join(basePath, file))
        .filter(isDirectory)
        .map(loadSubjectInfoFromDir)
        .filter(subject => subject.lessons.length > 0); // 只保留有课程的学科
};


// exports
let subjects = loadSubjectsFromPath(process.cwd());

let autoReloadTimer = null;
const needReloadDirs = new Set();

const checkDirs = () => {
    needReloadDirs.forEach(dirName => {
        console.log(`检测到变动，重新加载目录: ${dirName}`);
        const absPath = path.join(process.cwd(), dirName);
        if (!isDirectory(absPath)) {
            return;
        }
        if (!fs.existsSync(absPath)) {
            subjects = subjects.filter(s => s.name !== dirName);
        } else {
            const subject = loadSubjectInfoFromDir(absPath);
            if(subject.lessons.length === 0 || subject.documentCount === 0) {
                subjects = subjects.filter(s => s.id !== subject.id);
                return;
            }
            const existingSubject = subjects.find(s => s.id === subject.id);
            if (existingSubject) {
                existingSubject.documentCount = subject.documentCount;
                existingSubject.lessons = subject.lessons;
            } else {
                subjects.push(subject);
            }
        }
    });
    needReloadDirs.clear();
}

const watcher = chokidar.watch(process.cwd(), {
    ignored: /(^|[\/\\])\../,  // 忽略隐藏文件
    persistent: true,
    ignoreInitial: true,  // 忽略初始的 add 事件
    followSymlinks: false,  // 不跟随符号链接
    depth: 2  // 监听的最大目录深度
});

watcher.on('all', (event, filePath) => {
    const relativePath = path.relative(process.cwd(), filePath);
    const pathSegments = relativePath.split(path.sep);
    if (pathSegments.length > 0) {
        const subjectDir = pathSegments[0];
        if (subjectDir === '' || subjectDir.startsWith('.')) {
            return; // 忽略根目录和隐藏目录
        }
        if (isDirectory(path.join(process.cwd(), subjectDir)) === false) {
            return; // 忽略非目录的变动
        }
        needReloadDirs.add(subjectDir);
        clearTimeout(autoReloadTimer);
        autoReloadTimer = setTimeout(checkDirs, 1000); // 1秒内的多次变动合并为一次重新加载
    }
})
module.exports = {
    subjects
}