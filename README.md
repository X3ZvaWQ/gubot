# Gubot
咕！ bot，一个开源免费的用于提供剑网三相关功能的一个QQ群机器人。  
**注意，机器人通过响应来自[go-cqhttp](https://github.com/Mrs4s/go-cqhttp)的请求来实现自动回复消息等**  
由于忙于学(mo)业(yu)，缺乏时间写机器人，然后由于大部分够用了就有些懒得写了Orz 有兴趣的小伙伴可以自己写着玩噢。欢迎贡献源代码（

# TODOLIST
- [ ] 开服播报/奇遇播报
- [ ] 全群广播
- [ ] 斗图功能
- [ ] 语音生成
- [ ] 更聪明的对话
- [ ] websocket自动重连
- [ ] 各种命令回显的美化
- [ ] ~~抄其他机器人的功能~~

# 快速开始 Quick Start  
首先，你需要安装依赖，本项目使用纯node实现，同时使用了mysql、redis等服务，只需要保证运行的机器有node环境与mysql即可。 redis并不是必备的服务 
```bash
cd /path/to/gubot
npm install
```

然后，你需要创建env.json作为机器人的配置文件，项目为您提供了配置模板将env.example.json，您只需要将其复制一份进行自己的修改。
配置文件主要包括数据库信息，某些api的token，某些功能的开启、关闭与配置等。  
```bash
cp env.example.json env.json
vi env.json
//进行机器人配置
```
然后你需要创建数据库结构，程序为您准备好了迁移文件，您只需要创建好对应的mysql数据库执行下述脚本即可。  
```bash
node src/database/db_sync.js
```
然后确保go-cqhttp处于运行状态，运行app.js即可
```bash
node app.js
```

# 项目结构 Project Structure
- app.js **程序入口**
- env.example.json **项目配置模板**
- src
    - assets/ **资源文件夹，您并不需要关注**
        - json/ **存放需要用到的一些json数据**
        - images/ **存放可能需要用到的一些图片**
    - commands/ **命令文件夹，需要添加新的功能的时候在这里添加，具体可以参考文档的“添加新功能”部分**
    - database/ **存放了一些数据库结构迁移相关的脚本**
    - model/ **数据实体的定义，包括群，别名，用户等**
    - service/ **服务**
        - iamges.js **提供图片支持，支持从url抓取图片/从数组生成图片，使用html模板生产图片等**
        - api.js **需要重构，提供api调用服务**
        - cqhttp.js **需要重构，是go-cqhttp的抽象**
        - bot.js **需要重构，项目本身运行实例的抽象**
    - templates **存放图片模板的位置，使用art-template模板引擎**
    - main.js **主程序部分**

# 项目配置项
咕咕咕

# 项目讲解
咕咕咕

# 咕咕咕
懒得写文档了Orz 我好懒 为什么会有我这么懒的人
