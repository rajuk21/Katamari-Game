import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let renderer, scene, camera, beach_ball;

const load = (url) => new Promise((resolve, reject) => {
  const loader = new GLTFLoader();
  loader.load(url, (gltf) => resolve(gltf.scene), undefined, reject);
});

window.init = async () => {
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(10, 10, 10);
  camera.lookAt(0, 0, 0);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 10);
  scene.add(directionalLight);
  
  const geometry = new THREE.PlaneGeometry(1, 1);
  const texture = new THREE.TextureLoader().load('./assets/plane.jpg');
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(50, 50);
  const material = new THREE.MeshBasicMaterial({
    map: texture,
  });
  const plane = new THREE.Mesh(geometry, material);
  plane.rotateX(-Math.PI / 2);
  plane.scale.set(100, 100, 100);
  scene.add(plane);

  beach_ball = await load('./assets/beach_ball/scene.gltf');
  scene.add(beach_ball);
  beach_ball.scale.set(0.2, 0.2, 0.2);

  console.log('made a scene', beach_ball);
  
};
window.loop = (dt, input) => {
  if (beach_ball) {
    const movementSpeed = 0.005; // Movement speed
    const rollSpeed = 0.01; // Adjust this for the size of the ball

    // Forward and backward movement - along the Z-axis
    if (input.keys.has('ArrowUp')) {
      beach_ball.position.z -= movementSpeed * dt;
      beach_ball.rotation.y += movementSpeed * dt / (Math.PI * beach_ball.scale.y); 
    }
    if (input.keys.has('ArrowDown')) {
      beach_ball.position.z += movementSpeed * dt;
      // Roll around the X-axis in the opposite direction
      beach_ball.rotation.y += movementSpeed * dt / (Math.PI * beach_ball.scale.y); 
    }

    // Left and right movement - along the X-axis
    if (input.keys.has('ArrowLeft')) {
      beach_ball.position.x -= movementSpeed * dt;
      // Roll around the Y-axis
      beach_ball.rotation.y += movementSpeed * dt / (Math.PI * beach_ball.scale.y); // Assuming the beach_ball's diameter is 1 unit
    }
    if (input.keys.has('ArrowRight')) {
      beach_ball.position.x += movementSpeed * dt;
      // Roll around the Y-axis in the opposite direction
      beach_ball.rotation.y -= movementSpeed * dt / (Math.PI * beach_ball.scale.y); 
    }

    // Clamp the beach_ball's position to the plane's boundaries
    const planeBoundaryX = 50 / 2; // half the width
    const planeBoundaryZ = 50 / 2; // half the depth
    beach_ball.position.x = Math.max(-planeBoundaryX, Math.min(planeBoundaryX, beach_ball.position.x));
    beach_ball.position.z = Math.max(-planeBoundaryZ, Math.min(planeBoundaryZ, beach_ball.position.z));

    // Keep the camera looking at the beach_ball
    camera.lookAt(beach_ball.position);
  }

  // scene Rendering 
  renderer.render(scene, camera);

};



//References: Took Reference from example repository 