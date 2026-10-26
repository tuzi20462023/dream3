import { GoogleGenAI } from "@google/genai";
import express from "express";
import cors from "cors";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// 初始化 Google AI
const ai = new GoogleGenAI({
  apiKey: "AIzaSyBkngjkoFwKQWWqAWO8GOl62RqjifhAnuk"
});

// 中间件
app.use(cors());
app.use(express.json());

// 确保生成的图片目录存在
const generatedDir = path.join(__dirname, "public", "generated");
if (!fs.existsSync(generatedDir)) {
  fs.mkdirSync(generatedDir, { recursive: true });
}

// 根据参考图片风格构建提示词
function buildDreamPrompt(userInput) {
  const styleDescription = `Abstract collage art with dreamlike surreal atmosphere.
Soft textured painting with pastel spray paint effect.
Mix of geometric shapes and organic forms.
Muted color palette with beige, dusty blue, black, white, and subtle warm accents.
Ethereal, layered composition with transparent overlays.
Symbols like stars, moons, eyes, or abstract shapes.
Dreamy, mysterious, contemplative mood.`;

  return `${styleDescription}

Dream content: ${userInput}

Create an abstract, dreamlike artistic interpretation of this dream. Use soft textures, muted colors, and surreal symbolic elements. The composition should feel like a memory fragment or subconscious visualization.`;
}

// 提取关键词
function extractKeywords(description) {
  const themeWords = [
    ["虚空", "漂流", "星尘"],
    ["碎片", "回响", "波动"],
    ["迷雾", "幻影", "时空"],
    ["深渊", "微光", "回忆"],
    ["涟漪", "寂静", "边界"],
    ["折射", "幻象", "彼岸"],
    ["萤火", "暮色", "归途"],
    ["漩涡", "深海", "召唤"]
  ];
  const randomIndex = Math.floor(Math.random() * themeWords.length);
  return themeWords[randomIndex];
}

// API 端点：生成梦境
app.post("/api/generate-dream", async (req, res) => {
  try {
    const { inputText } = req.body;

    if (!inputText) {
      return res.status(400).json({ error: "梦境内容不能为空" });
    }

    console.log("🌙 开始生成梦境:", inputText);

    // 构建提示词
    const prompt = buildDreamPrompt(inputText);
    console.log("📝 提示词:", prompt.substring(0, 100) + "...");

    // 调用 Gemini AI 生成图片 - 使用和您一样的代码
    console.log("🤖 调用 Gemini API...");
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: prompt,
    });

    console.log("✨ Gemini 响应成功");

    // 提取图片数据 - 和您的代码一样
    let imageData = null;
    for (const part of response.candidates[0].content.parts) {
      if (part.text) {
        console.log("📝 文本:", part.text.substring(0, 100));
      } else if (part.inlineData) {
        imageData = part.inlineData.data;
        console.log("🎨 找到图片数据，长度:", imageData.length);
        break;
      }
    }

    if (!imageData) {
      console.warn("⚠️ 未找到图片数据");
      throw new Error("AI 未返回图片数据");
    }

    // 保存图片到 public/generated 目录
    const timestamp = Date.now();
    const filename = `dream_${timestamp}.png`;
    const filepath = path.join(generatedDir, filename);
    const buffer = Buffer.from(imageData, "base64");
    fs.writeFileSync(filepath, buffer);

    console.log("💾 图片已保存:", filename);

    // 生成关键词
    const keywords = extractKeywords(inputText);

    // 返回结果
    res.json({
      success: true,
      imageUrl: `/generated/${filename}`,
      keywords: keywords,
      description: inputText,
      inputText: inputText
    });

  } catch (error) {
    console.error("❌ 生成梦境失败:", error);
    res.status(500).json({
      error: "生成梦境失败",
      message: error.message
    });
  }
});

// 健康检查
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "梦境生成服务运行中" });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 梦境生成服务器运行在 http://localhost:${PORT}`);
  console.log(`📡 API 端点: http://localhost:${PORT}/api/generate-dream`);
});
