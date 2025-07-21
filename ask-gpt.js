// 文件路径：api/ask-gpt.js

export default async function handler(req, res) {
  const { taskText } = req.body;

  if (!taskText) {
    return res.status(400).json({ error: "Missing taskText" });
  }

  const apiKey = process.env.ZHIPU_API_KEY; // 从环境变量读取

  const prompt = `我想完成一件事：“${taskText}”。

请你将这个目标拆解成 7～10 个具体的小步骤，每个步骤必须是立刻就可以执行的动作，1～3 秒内完成，避免使用抽象词汇如思考、规划、准备等。

返回格式如下：
1. xxx
2. xxx`;

  try {
    const apiRes = await fetch("https://open.bigmodel.cn/api/paas/v4/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "glm-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5,
      }),
    });

    const data = await apiRes.json();
    const text = data.choices?.[0]?.message?.content || "";
    const steps = text.split('\n').filter(line => line.match(/^\d+\./));
    const result = steps.map(line => line.replace(/^\d+\.\s*/, '').trim());

    res.status(200).json({ steps: result });
  } catch (err) {
    console.error("中转失败：", err);
    res.status(500).json({ error: "内部调用失败" });
  }
}
