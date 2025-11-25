varying vec2 vUv;
varying vec3 vColor;

uniform float uThreshold;
uniform float uEdgeSoftness;
uniform float uOpacity;
uniform float uBrightness;
uniform float uSharpness; // New control

float getBrightness(vec3 color) {
  return dot(color, vec3(0.299, 0.587, 0.114));
}

void main() {
  // Circular particle shape with soft glow
  // Instead of a hard discard, we use a smooth gradient
  vec2 center = gl_PointCoord - 0.5;
  float dist = length(center);
  
  // Soft glow particle: alpha drops from 1.0 at center to 0.0 at edge (0.5)
  // uSharpness controls how "solid" the core is. 
  // If uSharpness is 0.0, start fade at 0.0 (fully soft).
  // If uSharpness is 0.8, start fade at 0.4 (almost solid circle).
  float alphaStart = 0.5 * uSharpness;
  float particleAlpha = 1.0 - smoothstep(alphaStart, 0.5, dist);
  
  // Thresholding
  float brightness = getBrightness(vColor);
  if (brightness < uThreshold) discard;
  
  // Radial Mask / Vignette for the whole image
  // vUv is 0,0 at one corner, 1,1 at diagonal. Center is 0.5, 0.5.
  float distFromCenter = length(vUv - 0.5);
  
  // Vignette logic:
  // We want the edges (dist > 0.4 or so) to fade out.
  // uEdgeSoftness controls the width of the fade.
  // Let's define the outer limit as 0.5 (radius of unit quad).
  // We smoothstep from (0.5 - softness) to 0.5.
  // If softness is 0.0, it's a hard cut at 0.5.
  // If softness is 0.5, it fades from center to edge.
  float vignette = 1.0 - smoothstep(0.5 - clamp(uEdgeSoftness, 0.0, 0.5), 0.5, distFromCenter);
  
  // Combine alphas
  float finalAlpha = particleAlpha * vignette * uOpacity;
  
  gl_FragColor = vec4(vColor * uBrightness, finalAlpha);
}