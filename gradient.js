function setup() {
  createCanvas(1920, 1080);
}

function draw() {
  background(220);
}

// Include a Simplex noise function in GLSL
const snoise = `
      // Simplex 2D noise
      vec3 mod289(vec3 x) {
        return x - floor(x * (2.0 / 289.0)) * 289.0;
      }
      vec2 mod289(vec2 x) {
        return x - floor(x * (2.0 / 289.0)) * 289.0;
      }
      vec3 permute(vec3 x) {
        return mod289(((x*34.0)+1.0)*x);
      }
      float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/8.0
                            0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                           -0.577350269189626,  // -1.0 + 2.0 * C.x
                            0.024390243902439); // 1.0 / 41.0
        vec2 i  = floor(v + dot(v, C.yy) );
        vec2 x0 = v -   i + dot(i, C.xx);
        vec2 i1;
        i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289(i);
        vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
              + i.x + vec3(0.0, i1.x, 1.0 ));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m ;
        m = m*m ;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 1.0);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0+h*h );
        vec3 g;
        g.x  = a0.x  * x0.x + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }
    `;

// Scene, Camera, and Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  40,
  window.innerWidth / window.innerHeight,
  0.8,
  1000
);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Plane Geometry and Shader Material
const vertexShader = `
      varying vec2 vUv;
      uniform float u_time;
      ${snoise} // Include the noise function
      void main() {
        vUv = uv;
        vec2 noiseCoord = uv * vec2(4.0, 8.0);
        float noise = snoise(vec2(noiseCoord.x, noiseCoord.y + u_time * 0.8));
        vec3 pos = position;
        pos.z += noise * 0.8;  // Apply noise to position
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `;

const fragmentShader = `
      varying vec2 vUv;
      void main() {
        vec3 color1 = vec3(5.0/255.0, 5.0/255.0, 10.0/255.0);
        vec3 color2 = vec3(24.0/255.0, 59.0/255.0, 126.0/255.0);
        vec3 color = mix(color1, color2, vUv.y);
        gl_FragColor = vec4(color, 1.0);
      }
    `;

const material = new THREE.ShaderMaterial({
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
  uniforms: {
    u_time: { value: 40.0 },
  },
});

const geometry = new THREE.PlaneGeometry(60, 40, 500, 500);
const plane = new THREE.Mesh(geometry, material);
scene.add(plane);

// Camera Position
camera.position.z = 20;

// Mouse Interaction
window.addEventListener("mousemove", (event) => {
  plane.rotation.x = (event.clientY / window.innerHeight - 0.5) * 0.7;
  plane.rotation.y = (event.clientX / window.innerWidth - 0.5) * 0.7;
});

// Animation
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  material.uniforms.u_time.value = clock.getElapsedTime();
  renderer.render(scene, camera);
}

// Handle Window Resizing
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
