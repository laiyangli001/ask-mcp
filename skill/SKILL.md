---
name: ask-mcp
description: |
  通过免费 AI 网页版（ChatGPT / Claude / DeepSeek / 豆包）完成提问、代码审查、长文本分析、
  图片理解等任务，无需 API token。当用户需要外部 AI 回答、审查代码、分析日志/长文本、
  描述图片时，自动选择最合适的 ask_* 服务，失败时按降级链切换。
---

## 触发条件

用户要求"问问 XX AI"、"帮我审查这段代码"、"分析这个日志/长文档"、"描述这张图"等
需要外部 AI 回答的任务，且 ask-mcp 的 MCP 服务已安装并加载。

## 服务选择

| 任务类型 | 首选服务 | 工具 |
|---------|---------|------|
| 通用问答 / 代码审查 / 长文本 | DeepSeek（零 token，稳定） | `ask_deepseek` |
| 需要 Claude 能力或截图 | Claude Mirror | `ask_claude_mirror` / `take_screenshot` |
| 需要 GPT 能力 | ChatGPT Mirror / Official | `ask_chatgpt_mirror` / `ask_chatgpt_official` |
| 图片/文件理解、生成 PPT 并下载 | 豆包 | `ask_doubao` / `download_doubao_file` |

## 调用方式

每个 `ask_*` 工具参数一致：

- `question`：要发送的问题（必填）
- `template`：模板名（可选），见 `shared/templates/`
- `attachments`：文件绝对路径数组（可选，总 ≤100MB）

可用模板：`code_review`、`long_text`、`vision_analysis`、`batch_task`、`format_task`。

## 降级链

首选服务失败（限流、未登录、网络不可达）时，按顺序切换：

1. DeepSeek → 2. Claude Mirror → 3. ChatGPT Mirror → 4. ChatGPT Official → 5. 豆包

## 注意事项

- 首次调用某个服务可能需要用户手动登录对应网站；服务会提示并等待登录。
- 浏览器 profile 持久化在服务目录下，登录态可跨会话复用。
- 生成的回答由对应 AI 网页版产出，非本地模型。
