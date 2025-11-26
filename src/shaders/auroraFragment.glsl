uniform float uTime;
uniform float uOpacity;
uniform float uDisplace; // Added displacement control
uniform vec2 uResolution;
uniform vec3 uColor1; // Deep Base
uniform vec3 uColor2; // Secondary
uniform vec3 uColor3; // Tertiary
uniform vec3 uColor4; // Highlight

varying vec2 vUv;

// --------------------------------------------------------
// Noise functions (Optimized)
// --------------------------------------------------------
float random (in vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

float noise (in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    vec2 u = f*f*(3.0-2.0*f);
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
    return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

#define OCTAVES 5
float fbm(in vec2 st) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 0.0;
    for (int i = 0; i < OCTAVES; i++) {
        value += amplitude * noise(st);
        st *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}

void main() {
    vec2 st = vUv;
    // Center coordinates for vignette
    vec2 center = st - 0.5;
    
    // 1. Slow, Organic Time
    float t = uTime * 0.15; // Very slow flow
    
    // 2. Advanced Domain Warping (Liquid Effect)
    vec2 q = vec2(0.);
    q.x = fbm( st + 0.00*t );
    q.y = fbm( st + vec2(1.0) );

    vec2 r = vec2(0.);
    r.x = fbm( st + uDisplace*q + vec2(1.7,9.2)+ 0.15*t );
    r.y = fbm( st + uDisplace*q + vec2(8.3,2.8)+ 0.126*t );

    float f = fbm(st + r);

    // 3. Color Mixing - "Soul Nebula" Palette
    // Start with Deep Base (Indigo/Black)
    vec3 color = uColor1; // Base
    
    // Mix secondary (Violet) - mid tones
    float mix2 = smoothstep(0.2, 0.8, f);
    color = mix(color, uColor2, mix2);
    
    // Mix tertiary (Cyan) - swirls
    float mix3 = smoothstep(0.0, 1.0, length(q));
    color = mix(color, uColor3, mix3 * 0.8);
    
    // Mix highlight (Warm Orange/White) - peaks only
    float mix4 = smoothstep(0.7, 1.0, f*length(r));
    color = mix(color, uColor4, mix4);
    
    // 4. Soft Organic Vignette (The "Void" fade)
    // Distance from center
    float dist = length(center);
    // Smooth fade out at edges: 0.0 at center, 1.0 at corners.
    // We want 1.0 opacity at center, 0.0 at edges.
    // Use a "cloudy" mask to make edges irregular? 
    // For now, smooth radial is safest for "sealed in crystal" look.
    float mask = 1.0 - smoothstep(0.25, 0.5, dist); // Starts fading at 0.25, gone at 0.5
    
    // Apply Vignette to Color and Opacity
    color *= mask; // Darken edges
    
    // Final Alpha
    float alpha = uOpacity * mask; 
    
    gl_FragColor = vec4(color, alpha);
}