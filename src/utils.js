const {program} = require("commander");

/**
 * 从package.json中获取版本号
 */
const packageJson = require('../package.json');

/**
 * 从命令行参数中获取端口号
 * @return {number} 端口号
 */
const getPortFromCommand = () => {
    program.version(packageJson.version)
        .description(packageJson.description)
        .option("--port <number>", "set server port", "3000")
        .parse(process.argv);

    const options = program.opts();
    return parseInt(options.port, 10);
}

module.exports = {
    getPortFromCommand
}