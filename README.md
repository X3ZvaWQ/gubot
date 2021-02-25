# Gubot
咕！ bot，一个开源免费的用于提供剑网三相关功能的一个QQ群机器人。
A qq group robot is used to provide some jx3-related functional support
## 注意，机器人通过响应来自go-cqhttp的请求来实现自动回复消息等，该仓库可以通过github搜索找到（

# Quick Start  
首先，你需要安装依赖，本项目使用纯node实现，同时使用了mysql，只需要保证运行的机器有node环境与mysql即可。  
First of all, you need to install the dependencies. This project uses pure Node implementation and mysql at the same time. You just need to make sure that the machine you are running has the Node environment and mysql.
```bash
cd /path/to/gubot
yarn
```

然后，你需要将env.example.json更名为env.json，然后在里面填写本地环境。主要包括数据库信息，某些功能的开启、关闭与配置等。  
First, you need to rename env.example.json to env.json and fill in the local environment. It mainly includes database information, opening, closing and configuration of some functions.
```bash
mv env.example.json env.json
vi env.json
```

然后你需要创建数据库结构，程序为您准备好了这方面的东西以及帮您准备好了初始的一些有用的数据。  
Then you need to create the database structure, and the program has that stuff ready for you and some useful initial data ready for you.  
```bash
node src/database/db_sync.js
```

然后运行app.js即可
And then run app.js
```bash
node app.js
```

# Project Structure
- app.js 程序入口
- src
    - route.js 命令路由
    - main.js 主程序部分
    - handler.js 命令调用器
    - commands/ 机器人支持的所有命令
    - triggers/ 机器人自发的一些触发器，比如自动播报开服等的实现
    - service/ api接口调用的封装
    - model/ 数据库模型的封装
    - helper/ 一些辅助函数的封装
    - database/ 写他干嘛？
