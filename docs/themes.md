# 主题配色

`src/themes/codexThemes.js` 保存本机 Codex Visual style 主题的配色数据，共 29 个家族、16 个浅色和 28 个深色版本。`source` 字段记录原始资源文件名；只迁移配色数据，不包含 Codex 的运行代码。

来源为本次安装的桌面应用 `app.asar` 中的主题注册清单和调色板。部分主题只有深色版本，Proof 只有浅色版本；菜单按原清单展示可用模式。

`src/themes/codex.css` 使用 shadcn 标准变量：文章卡片对应原始 editor 背景和文字色，侧边栏及主区域使用原始 sideBar 背景色，primary 对应原始链接或按钮强调色。原调色板未提供的边框、次级表面、悬停和弱化文字色由背景与文字色混合生成，primary-foreground 在浅色与深色主题中均统一使用浅色文字。因此这是配色迁移，并非 Codex 组件样式或字体的复制。

原有 Nextflux 主题和用户选择保留。新增主题与现有系统模式、浅色/深色独立选择、持久化和系统主题监听共用同一套逻辑。

设置导航、侧边栏和文章外部区域统一使用 sidebar；设置内容面板与文章详情（包括窄屏和浮动侧边栏模式）统一使用 popover。Codex 配色的 sidebar 在原始颜色上分别混入 5%（浅色）或 15%（深色）黑色以增强与文章背景的区分；默认浅色 sidebar 混入 4% 黑色，默认深色 sidebar 使用 background。
