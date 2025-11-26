// Mock data for AI generation
const MOCK_IMAGES = [
  // 本地图片 (放在 public/images/ 目录下，已压缩)
  "/images/1.jpg",
  "/images/2.jpg",
  "/images/3.jpg",
  "/images/4.jpg",
  // Unsplash 预设图片
  "https://images.unsplash.com/photo-1464802686167-b939a6910659?q=80&w=1000&auto=format&fit=crop", // Galaxy
  "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1000&auto=format&fit=crop", // Abstract landscape
  "https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=1000&auto=format&fit=crop", // Northern lights
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop", // Earth from space
  "https://images.unsplash.com/photo-1518066000714-58c45f1a2c0a?q=80&w=1000&auto=format&fit=crop", // Crystal
];

const MOCK_KEYWORDS = [
  "升华", "洞察", "自由", "神秘", "空灵",
  "潜意识", "觉醒", "漂浮", "光辉", "虚空",
  "连接", "孤独", "和谐", "混沌", "律动"
];

const MOCK_TEMPLATES = [
  "此梦境暗示您渴望超越当前局限，从更高视角审视人生。",
  "图像揭示了与未知深处的连结，敦促您拥抱不确定性。",
  "内在平静的显化，在日常喧嚣中寻求宁静。",
  "您的潜意识投射出对逻辑与情感之间平衡的需求。",
  "鲜艳的色彩预示着您清醒生活中即将迸发的创造力。"
];

export const generateMockDream = async (inputText) => {
  // Pick random image first
  const imageIndex = Math.floor(Math.random() * MOCK_IMAGES.length);
  let imageUrl = MOCK_IMAGES[imageIndex];

  // Pick 3 random keywords
  const shuffledKeywords = [...MOCK_KEYWORDS].sort(() => 0.5 - Math.random());
  const keywords = shuffledKeywords.slice(0, 3);

  // Pick random analysis
  const analysisIndex = Math.floor(Math.random() * MOCK_TEMPLATES.length);
  const analysis = MOCK_TEMPLATES[analysisIndex];

  // Pre-load image to prevent black screen
  // Wait for image to be fully loaded before returning
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

  // If image failed to load, use first image as fallback (Galaxy - most reliable)
  if (!loadSuccess) {
    console.warn('Falling back to default image');
    imageUrl = MOCK_IMAGES[0];
  }

  // Add minimum delay for UX (simulate "processing")
  await new Promise(resolve => setTimeout(resolve, 800));

  return {
    imageUrl,
    keywords,
    analysis,
    inputText // Keep the original input
  };
};
