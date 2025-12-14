import { dreamStorage } from './dreamStorage';

// Mock data for AI generation - Presets with matching image and description (所有使用在线图片)
const DREAM_PRESETS = [
  {
    imageUrl: "https://images.unsplash.com/photo-1579547945413-497e1b99dac0?q=80&w=1000&auto=format&fit=crop",
    keywords: ["漩涡", "深海", "回响"],
    description: "我沉入一片翡翠色的海洋，四周是不断旋转的水流。一头巨大的鲸鱼从漩涡中心游过，它的眼睛里倒映着我的倒影。我想跟上它，但身体却越来越轻，像是要融化在这片绿色里。"
  },
  {
    imageUrl: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?q=80&w=1000&auto=format&fit=crop",
    keywords: ["碎片", "星芒", "波动"],
    description: "我走进一个由记忆碎片拼成的房间。左边是黑洞，右边是刺眼的星光，中间悬浮着我认不出的符号。波纹一圈圈荡开，每荡一次，就有一段记忆被抹去。我拼命想抓住什么，却只握到了虚空。"
  },
  {
    imageUrl: "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?q=80&w=1000&auto=format&fit=crop",
    keywords: ["窥视", "蓝夜", "陌生"],
    description: "深蓝色的夜里，我站在窗外看着窗内的自己。那个人穿着我的衣服，有着我的脸，但眼神完全陌生。他似乎也在看我，嘴角有一丝我读不懂的笑意。我想敲窗，手却穿过了玻璃。"
  },
  {
    imageUrl: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?q=80&w=1000&auto=format&fit=crop",
    keywords: ["萤火", "草地", "遗留"],
    description: "我发现自己站在一片发光的草地上，脚边放着一双白色拖鞋。萤火虫从四面八方飞来，它们的光芒温暖却让我想哭。这双鞋是谁的？为什么我觉得它们在等一个永远不会回来的人？"
  },
  {
    imageUrl: "https://images.unsplash.com/photo-1464802686167-b939a6910659?q=80&w=1000&auto=format&fit=crop",
    keywords: ["虚空", "星尘", "漂流"],
    description: "我漂浮在一片紫色的星云之中，四周没有声音，只有远处恒星微弱的脉搏。我感觉不到身体的重量，仿佛我也变成了这无尽宇宙中的一粒尘埃，孤独却又无比自由。"
  },
  {
    imageUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1000&auto=format&fit=crop",
    keywords: ["寒冷", "折射", "彼岸"],
    description: "眼前是一片望不到边际的冰原，天空被巨大的棱镜分割成无数碎片。我赤脚走在冰面上，脚下倒映出的不是我自己，而是另一个我不认识的人。"
  },
  {
    imageUrl: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=1000&auto=format&fit=crop",
    keywords: ["极光", "召唤", "边界"],
    description: "绿色的光带在头顶舞动，像某种古老生物的触须。我站在世界的边缘，风很大，但我听到的只有那光带发出的低频嗡嗡声，它在召唤我去往另一个维度。"
  },
  {
    imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop",
    keywords: ["俯瞰", "渺小", "归途"],
    description: "我以神祇的视角俯瞰着这颗蓝色的星球，云层在下方缓慢旋转。我试图寻找我的家，却发现所有的城市都变成了发光的微小神经元，而我只是一个路过的观察者。"
  },
  {
    imageUrl: "https://images.unsplash.com/photo-1518066000714-58c45f1a2c0a?q=80&w=1000&auto=format&fit=crop",
    keywords: ["几何", "秩序", "迷宫"],
    description: "这是一个由纯粹几何体构成的空间，没有有机生命，只有不断变幻的数学公式。我被困在一个正十二面体的房间里，墙壁在不断向内坍缩，我必须解开谜题才能醒来。"
  }
];

// Supabase 配置
const SUPABASE_URL = "https://pcolyjkqfznorelcxkvb.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjb2x5amtxZnpub3JlbGN4a3ZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2ODg4OTAsImV4cCI6MjA4MTI2NDg5MH0.drUwcasIa0tN1p7niQxypUKZt6BgsXHr3RXKWzv_svs";

export const generateMockDream = async (inputText) => {
  try {
    // 调用 Supabase Edge Function 生成 AI 梦境
    console.log('🌙 调用 AI 生成梦境:', inputText);

    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/generate-dream`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ inputText }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Edge Function 错误:', errorText);
      throw new Error('AI 生成失败');
    }

    const data = await response.json();
    console.log('✨ AI 梦境生成成功:', data);

    // Pre-load image to prevent black screen
    const loadSuccess = await new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      let timeout = setTimeout(() => {
        console.warn('Image load timeout:', data.imageUrl);
        resolve(false);
      }, 10000); // 10 second timeout for AI generated images

      img.onload = () => {
        clearTimeout(timeout);
        console.log('Image loaded successfully:', data.imageUrl);
        resolve(true);
      };

      img.onerror = (err) => {
        clearTimeout(timeout);
        console.error('Image load error:', data.imageUrl, err);
        resolve(false);
      };

      img.src = data.imageUrl;
    });

    if (!loadSuccess) {
      throw new Error('图片加载失败');
    }

    const dreamData = {
      imageUrl: data.imageUrl, // 保存完整的 base64 图片
      keywords: data.keywords,
      description: data.description,
      inputText: data.inputText,
      isUserCreated: true,
      isAIGenerated: true
    };

    // 保存前检查数量，最多保存 5 个梦境
    const existingDreams = dreamStorage.getAllDreams();
    if (existingDreams.length >= 5) {
      console.log('📦 梦境已达上限，删除最旧的梦境');
      dreamStorage.deleteOldest();
    }

    // 保存梦境到 localStorage（包含 AI 生成的 base64 图）
    dreamStorage.saveDream(dreamData);

    return dreamData;

  } catch (error) {
    console.error('❌ 生成梦境失败，使用预设:', error);

    // 如果 AI 生成失败，降级到预设图片
    const presetIndex = Math.floor(Math.random() * DREAM_PRESETS.length);
    const preset = DREAM_PRESETS[presetIndex];

    // Add minimum delay for UX
    await new Promise(resolve => setTimeout(resolve, 800));

    const dreamData = {
      imageUrl: preset.imageUrl, // 预设图片 URL
      keywords: preset.keywords,
      description: preset.description,
      inputText,
      isUserCreated: true,
      isAIGenerated: false // 标记不是 AI 生成（使用预设图）
    };

    // 保存前检查数量
    const existingDreams = dreamStorage.getAllDreams();
    if (existingDreams.length >= 5) {
      console.log('📦 梦境已达上限，删除最旧的梦境');
      dreamStorage.deleteOldest();
    }

    // 保存梦境到 localStorage (使用预设图片)
    dreamStorage.saveDream(dreamData);

    return dreamData;
  }
};
