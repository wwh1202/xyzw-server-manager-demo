# xyzw-server-manager-demo

《咸鱼之王》连接诊断开发骨架，面向微信小程序与安卓 APP 的后续兼容适配。

> 重要：此仓库当前不包含经过验证的游戏协议适配器，也不会自动登录游戏。诊断命令、TCP 探测和协议样本脱敏都不等于游戏连接成功。不要提交账号密码、Token、Cookie、完整登录包或其他凭据。

## 环境要求

- Node.js 18 或更高版本
- npm（随 Node.js 安装）
- 当前最小版本不需要安装第三方依赖

## 本地启动

```bash
npm test
npm start -- doctor
```

诊断目标平台：

```bash
# macOS / Linux
XYZW_PLATFORM=wechat-mini-program npm start -- doctor
XYZW_PLATFORM=android-app npm start -- doctor

# Windows PowerShell
$env:XYZW_PLATFORM="wechat-mini-program"; npm start -- doctor
$env:XYZW_PLATFORM="android-app"; npm start -- doctor
```

## 检查已知服务器地址的 TCP 可达性

只有在你已经从可信配置或官方资料中确认了主机和端口后才执行。不要猜测游戏服务器地址。

```bash
npm start -- probe --host example.com --port 443
```

该命令只检查 DNS 与 TCP 建连，不发送登录数据，不代表游戏协议、TLS、鉴权或游戏会话可用。请将 `example.com:443` 替换为你已确认的目标。

## 脱敏检查协议样本

将本地样本通过标准输入传入；先自行删除账号标识、用户 ID 和任何不需要分析的字段：

```bash
npm start -- inspect-protocol < sample.json
```

工具会尽可能识别 JSON、统计字节数和顶层字段，并脱敏常见凭据字段。不要将原始抓包或凭据提交到 GitHub。

## 微信小程序与安卓 APP 连接下一步

1. 在对应客户端登录游戏并确认游戏版本。
2. 在你有权检查的设备/测试环境中，确认实际失败阶段（DNS、TCP/TLS、登录/会话、协议响应或业务请求）。
3. 只提供脱敏后的错误信息、时间戳、客户端版本、已知域名/端口和必要的协议结构。
4. 基于可验证的协议样本实现独立适配器，并为登录、心跳、断线重连和只读请求添加测试。
5. 在真实客户端与测试账号上验证后，才能将适配器标记为可用。

微信小程序和安卓 APP 可能使用不同的登录凭据、会话生命周期和网络栈；不能仅凭平台名称推断协议一致。此骨架不会绕过登录、安全校验或平台限制。

## 命令

| 命令 | 行为 |
|---|---|
| `doctor` | 显示运行时、平台配置和适配器状态 |
| `probe --host HOST --port PORT` | 对明确指定的地址进行 DNS/TCP 连通性检查 |
| `inspect-protocol` | 从标准输入读取并脱敏分析协议样本 |

## 当前限制

- 没有真实游戏 WebSocket/BON 协议实现。
- 没有微信扫码、Token/BIN 导入或账号存储。
- 没有自动领取奖励、钓鱼、日常、爬塔等游戏操作。
- 没有真实游戏连接成功的测试结果。

请不要把“诊断通过”当成“游戏连接成功”。
