// Mock data for AI generation
const MOCK_IMAGES = [
  "https://images.unsplash.com/photo-1464802686167-b939a6910659?q=80&w=1000&auto=format&fit=crop", // Galaxy
  "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1000&auto=format&fit=crop", // Abstract landscape
  "https://images.unsplash.com/photo-1506318137071-a8bcbf6d919d?q=80&w=1000&auto=format&fit=crop", // Mountains mist
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop", // Earth from space
  "https://images.unsplash.com/photo-1518066000714-58c45f1a2c0a?q=80&w=1000&auto=format&fit=crop", // Crystal
  "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=1000&auto=format&fit=crop", // Cosmic (replaced broken link)
  "https://images.unsplash.com/photo-1510942201312-84e7962f6dbb?q=80&w=1000&auto=format&fit=crop", // Neon
  "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?q=80&w=1000&auto=format&fit=crop", // Night sky
];

const MOCK_KEYWORDS = [
  "Ascension", "Clarity", "Freedom", "Mystery", "Ethereal", 
  "Subconscious", "Awakening", "Drifting", "Luminous", "Void",
  "Connection", "Solitude", "Harmony", "Chaos", "Pulse"
];

const MOCK_TEMPLATES = [
  "This dream suggests a desire to transcend current limitations and view your life from a higher perspective.",
  "The imagery reveals a deep connection to the unknown, urging you to embrace uncertainty.",
  "A manifestation of inner peace and the search for silence amidst the noise of daily existence.",
  "Your subconscious is projecting a need for balance between the logical and the emotional realms.",
  "The vibrant colors indicate a burst of creativity waiting to be unleashed in your waking life."
];

export const generateMockDream = async (inputText) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

  // Pick random image (in a real app, this would depend on input)
  // We use a simple hash of input to make it semi-deterministic or just random
  const imageIndex = Math.floor(Math.random() * MOCK_IMAGES.length);
  const imageUrl = MOCK_IMAGES[imageIndex];

  // Pick 3 random keywords
  const shuffledKeywords = [...MOCK_KEYWORDS].sort(() => 0.5 - Math.random());
  const keywords = shuffledKeywords.slice(0, 3);

  // Pick random analysis
  const analysisIndex = Math.floor(Math.random() * MOCK_TEMPLATES.length);
  const analysis = MOCK_TEMPLATES[analysisIndex];

  // Return direct URL to avoid blob URL memory leaks
  // Blob URLs were causing "Could not load blob" errors and WebGL context loss
  return {
    imageUrl,
    keywords,
    analysis,
    inputText // Keep the original input
  };
};
