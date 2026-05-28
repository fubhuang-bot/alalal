# Family Location Alert

这是一个为 4-6 位亲友设计的跨平台位置通知原型。

目标是让用户 A 在网页上点击一个按钮后，把：

- 当前经纬度
- 预设短讯
- 可选补充说明
- 地图链接

发送给用户 B，并让用户 B 在手机或电脑上收到通知。

## 这版原型已经实现了什么

- 一个可直接打开的前端页面
- 浏览器读取当前位置
- 预设短讯选择
- 通过 `ntfy` 主题发送通知
- 自动生成 Google Maps 点击链接

## 为什么推荐 ntfy

`ntfy` 很适合你这种小范围、跨平台、跨国使用场景：

- iPhone 和 Android 都有现成客户端
- 电脑可以用网页或 PWA 接收通知
- 可以自建在 NAS 上
- 前端只需要发一个 HTTP POST，请求很简单
- 4-6 人使用完全够用

根据 ntfy 官方文档：

- ntfy 支持通过简单 HTTP POST/PUT 发送推送通知  
  来源: https://docs.ntfy.sh/
- Web/PWA 可在桌面和移动设备上接收通知，iOS 16.4+ 可通过加入主屏幕的方式接收 Web Push  
  来源: https://docs.ntfy.sh/subscribe/web/  
  来源: https://docs.ntfy.sh/subscribe/pwa/
- 自建服务器可以配合 Web Push，iOS 的即时通知需要按官方文档额外配置 upstream  
  来源: https://docs.ntfy.sh/config/

## 目录说明

- `index.html`: 原型页面
- `styles.css`: 样式
- `app.js`: 发送通知逻辑
- `nas/docker-compose.yml`: NAS 部署示例
- `nas/server.yml.example`: ntfy 配置示例

## 如何本地试用

直接在浏览器打开 `index.html` 可以看界面，但很多浏览器在 `file://` 下不会允许定位或跨域请求。

更稳妥的试法是：

1. 在项目目录启动一个本地静态服务器
2. 用浏览器访问 `http://你的电脑IP:端口`
3. 允许定位权限
4. 把通知服务器和主题改成可用值

如果你电脑上有 Python 3，可以在这个目录运行：

```bash
python3 -m http.server 8080
```

然后打开：

```text
http://localhost:8080
```

## 推荐的真实部署方式

### 方案 A：最快上线

- 通知服务器直接先用 `https://ntfy.sh`
- 发送方打开这个网页
- 接收方在 ntfy App 或 ntfy Web 中订阅同一个私密主题

优点：

- 几乎零部署
- 立刻可用

缺点：

- 不完全由你自己掌控
- 敏感信息不如自建放心

### 方案 B：部署到你的 NAS

你的 Berlin 公寓里的 24 小时 NAS 很适合部署 ntfy。

建议结构：

- 反向代理：Nginx 或 NAS 自带 Web 入口
- 通知服务：ntfy
- 域名：例如 `notify.yourdomain.com`
- HTTPS：Let's Encrypt

这样你就得到：

- 自己的通知服务器
- 固定域名
- 可让亲友手机 App 直接订阅
- 后续还能加入登录、主题权限、发送日志

## 注意事项

### 1. iPhone 的限制

iPhone 对后台和推送限制比 Android 严很多。

如果你想做的是：

- A 打开页面，点一下按钮，立即发一次位置

这是比较稳的。

如果你想做的是：

- A 不打开页面，系统持续后台自动上传实时位置

那就更适合以后做原生 App，不建议把第一版目标定得太高。

### 2. 浏览器定位权限

浏览器通常要求：

- HTTPS
- 用户主动授权定位

所以正式使用时，网页最好部署到 HTTPS 域名。

### 3. 主题安全

不要使用太简单的主题名，例如：

- `family`
- `location`
- `help`

更建议使用随机字符串，例如：

- `fam-berlin-9x2k-alert`

## 下一步建议

最推荐的顺序是：

1. 先用 `ntfy.sh` 跑通亲友之间的消息收发
2. 确认体验没问题后，把 ntfy 部署到你的 NAS
3. 再决定要不要做真正登录系统和联系人管理

## 第二阶段我建议可以加的功能

- 发送人昵称
- 多个收件人分组
- 预设按钮快捷发送
- 历史记录
- 一键复制 Apple Maps / Google Maps 链接
- 多语言界面
- 登录和权限控制
