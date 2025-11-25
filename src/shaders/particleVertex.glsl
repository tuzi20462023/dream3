varying vec2 vUv;
varying vec3 vColor;
varying float vVisible;

attribute vec3 aRandom;

uniform sampler2D uTexture;
uniform float uDisplacementStrength;
uniform float uSize;
uniform float uRandomness;
uniform float uTime;
uniform float uDispersion;
uniform float uCurlStrength;
uniform float uJitter;
uniform vec2 uMouse;
uniform float uMouseRadius;
uniform float uMouseStrength;
uniform float uMouseDisp;
uniform float uDispersionZone;
uniform float uDetailStrength; // Controls how much brightness reduces size

// Simplex 3D Noise 
// by Ian McEwan, Ashima Arts
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
float snoise(vec3 v) { 
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 = v - i + dot(i, C.xxx) ;
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
  vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y
  i = mod289(i); 
  vec4 p = permute( permute( permute( 
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
  float n_ = 0.142857142857; // 1.0/7.0
  vec3  ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,N)
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)
  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                dot(p2,x2), dot(p3,x3) ) );
}

vec3 curlNoise(vec3 p) {
  const float e = 0.1;
  vec3 dx = vec3(e, 0.0, 0.0);
  vec3 dy = vec3(0.0, e, 0.0);
  vec3 dz = vec3(0.0, 0.0, e);
  
  vec3 p_x0 = snoise(p - dx) * vec3(1.0);
  vec3 p_x1 = snoise(p + dx) * vec3(1.0);
  vec3 p_y0 = snoise(p - dy) * vec3(1.0);
  vec3 p_y1 = snoise(p + dy) * vec3(1.0);
  vec3 p_z0 = snoise(p - dz) * vec3(1.0);
  vec3 p_z1 = snoise(p + dz) * vec3(1.0);
  
  float x = p_y1.z - p_y0.z - p_z1.y + p_z0.y;
  float y = p_z1.x - p_z0.x - p_x1.z + p_x0.z;
  float z = p_x1.y - p_x0.y - p_y1.x + p_y0.x;
  
  const float divisor = 1.0 / (2.0 * e);
  return normalize(vec3(x, y, z) * divisor);
}

// Function to get brightness from color
float getBrightness(vec3 color) {
  return dot(color, vec3(0.299, 0.587, 0.114));
}

void main() {
  vUv = uv;
  
  // Sample the texture
  vec4 texColor = texture2D(uTexture, uv);
  vColor = texColor.rgb;
  
  // Calculate brightness for displacement
  float brightness = getBrightness(vColor);
  
  // --- 1. Base Position with Scatter ---
  vec3 pos = position;
  pos += aRandom * uRandomness;

  // --- 2. Radial Dispersion (Explode Edges) ---
  float distFromCenter = length(uv - 0.5);
  // Safe zone: 0.0 to uDispersionZone is safe. Then it ramps up.
  float dispersionFactor = smoothstep(uDispersionZone, uDispersionZone + 0.4, distFromCenter);
  
  // Push particles away from center based on dispersion
  vec3 dispersionDir = normalize(pos); 
  // Non-linear push for more "explosion" at far edges
  pos += dispersionDir * pow(dispersionFactor, 2.0) * uDispersion * 8.0;

  // --- 3. Curl Noise (Flow) ---
  // Lower scale = larger, smoother waves (less wrinkled)
  vec3 noisePos = pos * 0.1 + vec3(0.0, 0.0, uTime * 0.2);
  vec3 curl = curlNoise(noisePos);
  
  // Apply curl more at the edges (mix based on dispersionFactor)
  // Center is stable, edges flow like nebula
  pos += curl * uCurlStrength * dispersionFactor * 2.0;

  // --- 4. High-Frequency Jitter (Star Twinkle) ---
  vec3 jitterOffset = vec3(
    sin(uTime * 20.0 + aRandom.x * 100.0),
    cos(uTime * 20.0 + aRandom.y * 100.0),
    sin(uTime * 20.0 + aRandom.z * 100.0)
  );
  // Jitter increases at edges too
  pos += jitterOffset * uJitter * (0.05 + dispersionFactor * 0.1); 

  // --- 5. Mouse Interaction (Water Ripple / Repulsion) ---
  float mouseDist = distance(pos.xy, uMouse);
  float mouseFactor = exp(-(mouseDist * mouseDist) / (uMouseRadius * 0.5));
  
  vec3 mouseDir = normalize(pos - vec3(uMouse, 0.0));
  pos.xy += mouseDir.xy * mouseFactor * uMouseStrength;
  pos.z += mouseFactor * uMouseDisp;

  // --- 6. Z-Displacement (The Image Relief) ---
  pos.z += brightness * uDisplacementStrength;
  
  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  
  // Size attenuation
  // Center = Normal Size (Sharp)
  // Edges = Larger Size (Nebula/Cloudy)
  
  // Smart Sizing: Bright areas (high detail) get smaller particles for sharpness
  // Dark areas (background) get default size
  float detailFactor = mix(1.0, 0.3, brightness * uDetailStrength);
  
  float nebulaSize = uSize * (1.0 + dispersionFactor * 3.0) * detailFactor;
  gl_PointSize = nebulaSize * (300.0 / -mvPosition.z);
  
  // Pass visibility info (optional, can be done in fragment)
  vVisible = 1.0;
}