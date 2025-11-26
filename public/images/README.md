# 图片资源目录

## 使用说明

将梦境图片放在此文件夹中，然后在 `src/utils/mockDreamGenerator.js` 中引用：

```javascript
const MOCK_IMAGES = [
  "/images/your-image-1.jpg",
  "/images/your-image-2.png",
  // ...
];
```

## 推荐规格

- **格式**: JPG, PNG, WebP
- **分辨率**: 1000x1000 或更高
- **大小**: 建议 < 500KB（优化性能）
- **命名**: 使用有意义的名称，如 `cosmic-nebula.jpg`

## 示例

```
public/images/
├── cosmic-nebula.jpg
├── abstract-landscape.png
├── crystal-formation.webp
└── starfield.jpg
```

## 部署到 Vercel

这些图片会自动包含在部署中，无需额外配置！
