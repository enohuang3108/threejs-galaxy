import GUI from "lil-gui";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

/**
 * Base
 */
// Debug
const gui = new GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

const parameters = {
  count: 100000,
  size: 0.01,
  radius: 10,
  branches: 3,
  spin: 1,
  randomness: 0,
  randomnessPower: 3,
  insideColor: "#ff6030",
  outsideColor: "#1b3984",
};

let geomertry;
let material;
let point;

/*
 * *
 * Galaxy
 */

const colorInside = new THREE.Color(parameters.insideColor);
const colorOutside = new THREE.Color(parameters.outsideColor);

const generateGalaxy = () => {
  if (point != null) {
    geomertry.dispose();
    material.dispose();
    scene.remove(point);
  }

  geomertry = new THREE.BufferGeometry();
  const position = new Float32Array(parameters.count * 3);
  const color = new Float32Array(parameters.count * 3);

  for (let i = 0; i < parameters.count; i++) {
    //position
    const radius = (1 - Math.pow(Math.random(), 1 / 2)) * parameters.radius;
    const spinAngle = parameters.spin * radius;
    const randomX =
      Math.pow(Math.random(), parameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1);
    const randomY =
      Math.pow(Math.random(), parameters.randomnessPower + 2) *
      (Math.random() < 0.5 ? 1 : -1);
    const randomZ =
      Math.pow(Math.random(), parameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1);
    const branchAngle =
      ((i % parameters.branches) / parameters.branches) * Math.PI * 2;

    const i3 = i * 3;
    position[i3 + 0] = Math.cos(branchAngle + spinAngle) * radius + randomX;
    position[i3 + 1] = randomY * (Math.random() - 0.5) * 3;
    position[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

    //color
    const mixColor = colorInside.clone();
    mixColor.lerp(colorOutside, radius / parameters.radius);

    color[i3 + 0] = mixColor.r;
    color[i3 + 1] = mixColor.g;
    color[i3 + 2] = mixColor.b;
  }

  geomertry.setAttribute("position", new THREE.BufferAttribute(position, 3));
  geomertry.setAttribute("color", new THREE.BufferAttribute(color, 3));

  /**
   * Material
   */
  material = new THREE.PointsMaterial({
    size: parameters.size,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
  });
  /**
   * Point
   */
  point = new THREE.Points(geomertry, material);
  scene.add(point);
};

generateGalaxy();

gui
  .add(parameters, "count")
  .min(1)
  .max(100000)
  .step(100)
  .onFinishChange(generateGalaxy);
gui
  .add(parameters, "size")
  .min(0.001)
  .max(0.1)
  .step(0.001)
  .onFinishChange(generateGalaxy);

gui
  .add(parameters, "radius")
  .min(0.01)
  .max(20)
  .step(0.01)
  .onFinishChange(generateGalaxy);

gui
  .add(parameters, "branches")
  .min(2)
  .max(20)
  .step(1)
  .onFinishChange(generateGalaxy);
gui
  .add(parameters, "spin")
  .min(-5)
  .max(5)
  .step(0.1)
  .onFinishChange(generateGalaxy);
gui
  .add(parameters, "randomness")
  .min(0)
  .max(2)
  .step(0.01)
  .onFinishChange(generateGalaxy);
gui
  .add(parameters, "randomnessPower")
  .min(1)
  .max(10)
  .step(1)
  .onFinishChange(generateGalaxy);
gui.addColor(parameters, "insideColor").onFinishChange(generateGalaxy);
gui.addColor(parameters, "outsideColor").onFinishChange(generateGalaxy);
/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.x = 3;
camera.position.y = 3;
camera.position.z = 3;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  if (point) {
    point.rotation.y = elapsedTime * 0.01;
  }

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
