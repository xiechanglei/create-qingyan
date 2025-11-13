# create-qingyan

项目以女儿的名字命名，轻言 (qingyan)，祝她一生平安，健康快乐。

## 环境准备

本项目基于nodejs的项目运行，所以你可以检查以下你的电脑上是否安装了nodejs环境：

```bash
node -v
```

如果没有安装，则需要先安装nodejs环境，建议版本为16及以上，可以从 [nodejs官网](https://nodejs.org/) 下载并安装。

安装之后，nodejs默认采用自带的npm包管理器，比如我们想使用npm安装一个东西，那么命令如下：

```bash
npm install <package-name>
```

当然，我们也可以选择安装自己喜欢的包管理器，比如yarn，安装命令如下：

```bash
# use npm to install yarn
npm install -g yarn
```

如果执行的过程中报错，大部分情况下发生在windows操作系统上，可以选择将报错信息复制到网上搜索解决方案，或者尝试使用管理员权限运行命令行工具。

比如你的报错提示是：**执行yarn报错： yarn.ps1，因为在此系统上禁止运行脚本` ,那么可以尝试以下命令解决：**

```bash
set-ExecutionPolicy RemoteSigned
# 根据提示选择 Y 确认
```

之后，我们就可以使用yarn来安装包了：

```bash
yarn add <package-name>
```

最后，由于国外的源访问速度较慢，建议配置国内的npm源，例如淘宝源：

```bash
# 配置yarn的镜像源
yarn config set registry https://registry.npmmirror.com
# 或者配置npm的镜像源
npm config set registry https://registry.npmmirror.com
````

> 下面的命令中，我提供了使用yarn和npm两种方式，你可以根据自己的喜好选择其中一种即可。

## 简单约定

这是一个简单的将当前目录做为一个学习网站的静态站点生成器。

学习资料需要满足以下要求：

1. 当前目录为程序的根目录，应该包含一系列的文件夹，每个文件夹表示一个学科
2. 学科下的文件夹为分类，分类下包含一系列的 Markdown 文件，表示该分类下的学习资料
3. 学科下也可以直接包含 Markdown 文件，表示该学科下的学习资料，回自动归到“未分类”分类下
4. 目前学科下只支持一级目录，意思只能有一级分类

## 启动服务

启动脚本：

```bash
# 使用yarn
yarn create qingyan
# 或者使用npm
npx create-qingyan
```

执行以上命令之后，服务将会启动，默认监听 3000 端口，可以通过 `--port` 参数指定端口号：

```bash
# 使用yarn
yarn create qingyan --port 4000
# 或者使用npm
npx create-qingyan --port 4000
```

## 自定义初始化

另外当当前目录为空的时候，支持使用 `--init` 参数 从一个远程地址下载zip格式的文件并解压到当前目录，用以初始化当前目录：

```bash
# 使用yarn
yarn create qingyan --init --remote https://example.com/your-zip-file.zip
# 或者使用npm
npx create-qingyan --init --remote https://example.com/your-zip-file
```

`--remote` 参数指定远程 zip 文件地址，如果不指定则使用默认的远程地址: https://github.com/xiechanglei/program-study-subjects

## 全局安装

由于create 的机制会每次都重新安装依赖，如果你希望加快启动速度，可以选择全局安装：

```bash
# 使用yarn
yarn global add create-qingyan
# 或者使用npm
npm install -g create-qingyan
```

安装完成之后，就可以直接使用 `create-qingyan` 命令启动服务：

```bash
create-qingyan
```

当然，为了不啰嗦，也提供了一个简短的命令：

```bash
qingyan
```

对应的参数与上面介绍的一样。

如果你需要更新版本，可以使用下面的命令：

```bash
# 使用yarn
yarn global upgrade create-qingyan
# 或者使用npm
npm update -g create-qingyan
```