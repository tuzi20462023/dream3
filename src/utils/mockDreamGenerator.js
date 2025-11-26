// Mock data for AI generation - Presets with matching image and description
const DREAM_PRESETS = [
  // 本地图片预设
  {
    imageUrl: "/images/1.jpg", // 绿色漩涡与鲸鱼
    keywords: ["漩涡", "深海", "回响"],
    description: "我沉入一片翡翠色的海洋，四周是不断旋转的水流。一头巨大的鲸鱼从漩涡中心游过，它的眼睛里倒映着我的倒影。我想跟上它，但身体却越来越轻，像是要融化在这片绿色里。"
  },
  {
    imageUrl: "/images/2.jpg", // 抽象拼贴画
    keywords: ["碎片", "星芒", "波动"],
    description: "我走进一个由记忆碎片拼成的房间。左边是黑洞，右边是刺眼的星光，中间悬浮着我认不出的符号。波纹一圈圈荡开，每荡一次，就有一段记忆被抹去。我拼命想抓住什么，却只握到了虚空。"
  },
  {
    imageUrl: "/images/3.jpg", // 窗户里的人影
    keywords: ["窥视", "蓝夜", "陌生"],
    description: "深蓝色的夜里，我站在窗外看着窗内的自己。那个人穿着我的衣服，有着我的脸，但眼神完全陌生。他似乎也在看我，嘴角有一丝我读不懂的笑意。我想敲窗，手却穿过了玻璃。"
  },
  {
    imageUrl: "/images/4.jpg", // 草地拖鞋与萤火虫
    keywords: ["萤火", "草地", "遗留"],
    description: "我发现自己站在一片发光的草地上，脚边放着一双白色拖鞋。萤火虫从四面八方飞来，它们的光芒温暖却让我想哭。这双鞋是谁的？为什么我觉得它们在等一个永远不会回来的人？"
  },
  // Unsplash 图片预设
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

export const generateMockDream = async (inputText) => {
  // Pick random preset instead of random combination
  const presetIndex = Math.floor(Math.random() * DREAM_PRESETS.length);
  const preset = DREAM_PRESETS[presetIndex];
  
  const imageUrl = preset.imageUrl;

  // Pre-load image to prevent black screen
  const loadSuccess = await new Promise((resolve) => {
    const img = new Image();
    // 远程图片需要 crossOrigin，本地图片不需要
    if (imageUrl.startsWith('http')) {
      img.crossOrigin = 'anonymous';
    }

    let timeout = setTimeout(() => {
      console.warn('Image load timeout:', imageUrl);
      resolve(false);
    }, 5000); // 5 second timeout

    img.onload = () => {
      clearTimeout(timeout);
      console.log('Image loaded successfully:', imageUrl);
      resolve(true);
    };

    img.onerror = (err) => {
      clearTimeout(timeout);
      console.error('Image load error:', imageUrl, err);
      resolve(false);
    };

    img.src = imageUrl;
  });

  // If image failed to load, fallback to first preset
  const finalPreset = loadSuccess ? preset : DREAM_PRESETS[0];

  // Add minimum delay for UX (simulate "processing")
  await new Promise(resolve => setTimeout(resolve, 800));

  return {
    imageUrl: finalPreset.imageUrl,
    keywords: finalPreset.keywords,
    description: finalPreset.description, // Use description instead of analysis
    inputText // Keep the original input
  };
};
