# create-qingyan

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
# use yarn
yarn create qingyan
# or use npm
npx create-qingyan
```

执行以上命令之后，服务将会启动，默认监听 3000 端口，可以通过 `--port` 参数指定端口号：

```bash
# use yarn
yarn create qingyan --port 4000
# or use npm
npx create-qingyan --port 4000
```

## 自定义初始化

另外当当前目录为空的时候，支持使用 `--init` 参数 从一个远程地址下载zip格式的文件并解压到当前目录，用以初始化当前目录：

```bash
# use yarn
yarn create qingyan --init --remote https://example.com/your-zip-file.zip
# or use npm
npx create-qingyan --init --remote https://example.com/your-zip-file
```

`--remote` 参数指定远程 zip 文件地址，如果不指定则使用默认的远程地址: https://github.com/xiechanglei/program-study-subjects

## 全局安装
由于create 的机制会每次都重新安装依赖，如果你希望加快启动速度，可以选择全局安装：

```bash
# use yarn
yarn global add create-qingyan
# or use npm
npm install -g create-qingyan
```

安装完成之后，就可以直接使用 `create-qingyan` 命令启动服务：

```bash
create-qingyan
```

对应的参数与上面介绍的一样。

如果你需要更新版本，可以使用下面的命令：

```bash
# use yarn
yarn global upgrade create-qingyan
# or use npm
npm update -g create-qingyan
```