uniform float uTime;
uniform float uOpacity;
uniform vec2 uResolution;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform vec3 uColor4;

varying vec2 vUv;

// --------------------------------------------------------
// Noise functions
// --------------------------------------------------------
// 2D Random
float random (in vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))
                 * 43758.5453123);
}

// 2D Noise based on Morgan McGuire @morgan3d
// https://www.shadertoy.com/view/4dS3Wd
float noise (in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    // Smooth Interpolation

    // Cubic Hermine Curve.  Same as SmoothStep()
    vec2 u = f*f*(3.0-2.0*f);
    // u = smoothstep(0.,1.,f);

    // Mix 4 coorners percentages
    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

// Fractional Brownian Motion
#define OCTAVES 4
float fbm(in vec2 st) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 0.0;
    
    // Loop of octaves
    for (int i = 0; i < OCTAVES; i++) {
        value += amplitude * noise(st);
        st *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}

void main() {
    vec2 st = vUv;
    
    // 1. Slow down time
    float t = uTime * 0.2;
    
    // 2. Domain Warping
    // We distort the coordinate space 'q' with fbm
    vec2 q = vec2(0.);
    q.x = fbm( st + 0.00*t );
    q.y = fbm( st + vec2(1.0) );

    // Then we distort 'r' using 'q'
    vec2 r = vec2(0.);
    r.x = fbm( st + 1.0*q + vec2(1.7,9.2)+ 0.15*t );
    r.y = fbm( st + 1.0*q + vec2(8.3,2.8)+ 0.126*t );

    // Finally we calculate the fbm value using 'r'
    float f = fbm(st + r);

    // 3. Color Mixing based on the warped value 'f'
    // We use the length of 'q' and 'r' to mix colors too, creating depth
    
    // Base dark indigo/black
    vec3 color = mix(vec3(0.0), uColor1, clamp(f*f*4.0, 0.0, 1.0));
    
    // Mix in secondary color (Violet) based on 'q' length
    color = mix(color, uColor2, clamp(length(q), 0.0, 1.0));
    
    // Mix in tertiary color (Cyan/Blue) based on 'r' length
    color = mix(color, uColor3, clamp(length(r.x), 0.0, 1.0));
    
    // Add warm highlights (Orange/Gold) at peaks
    // Using a steeper curve for 'f' to isolate highlights
    float highlight = smoothstep(0.6, 1.0, f);
    color = mix(color, uColor4, highlight * 0.8); // 0.8 intensity
    
    // 4. Vignette / Masking
    // Soft edges to fade into black (for the holographic look)
    float d = distance(st, vec2(0.5));
    float alpha = 1.0 - smoothstep(0.3, 0.5, d); 
    // Wait, we want it to fill the plane but maybe soft edges?
    // Let's keep alpha 1.0 for now, the glass will handle boundaries.
    // Or actually, let's make it slightly organic
    
    // Output
    gl_FragColor = vec4(color, uOpacity);
}