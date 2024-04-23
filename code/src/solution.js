import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let renderer, scene, camera, beach_ball;

const load = (url) => new Promise((resolve, reject) => {
  const loader = new GLTFLoader();
  loader.load(url, (gltf) => resolve(gltf.scene), undefined, reject);
});

const checkCollision = (object1, object2) => {
  if (object1.geometry && object2.geometry) {
    const distance = object1.position.distanceTo(object2.position);
    const combinedRadius = object1.geometry.boundingSphere.radius + object2.geometry.boundingSphere.radius;
    return distance < combinedRadius;
  }
  return false;
};

window.init = async () => {
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(5, 5, 5);
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
  beach_ball.name="main";
  scene.add(beach_ball);
  beach_ball.scale.set(0.2, 0.2, 0.2);
  beach_ball.position.set(0,0,0);

  const lava_planet1 = await load('./assets/lava_planet/scene.gltf');
  lava_planet1.position.set(1, 0, 3); // Set position for the first lava_planet
  scene.add(lava_planet1);
  lava_planet1.name="planet1";
  console.log("Hi 1", lava_planet1);

 const lava_planet2 = await load('./assets/lava_planet/scene.gltf');
 lava_planet2.position.set(0, 0, 5); // Set position for the second lava_planet
 scene.add(lava_planet2);
 lava_planet2.name="planet2";
 const lava_planet3 = await load('./assets/lava_planet/scene.gltf');
 lava_planet3.position.set(1, 0, 7); // Set position for the third lava_planet
 scene.add(lava_planet3);
 lava_planet3.name="planet3";
 const lava_planet4 = await load('./assets/lava_planet/scene.gltf');
 lava_planet4.position.set(1, 0, 9); // Set position for the third lava_planet
 scene.add(lava_planet4);
 lava_planet4.name="planet4";
 const lava_planet5 = await load('./assets/lava_planet/scene.gltf');
 lava_planet3.position.set(1, 0, 11); // Set position for the third lava_planet
 scene.add(lava_planet5);
 lava_planet5.name="planet5";

  console.log('made a scene', beach_ball);
  
};
let remainingPlanets = 5; // Assuming there are 5 planets initially
let gameEnded = false;

function collide() {
  const p = scene.getObjectByName('main');
  const ballPosition = p.position.clone();

  const planets = [
    scene.getObjectByName('planet1'),
    scene.getObjectByName('planet2'),
    scene.getObjectByName('planet3'),
    scene.getObjectByName('planet4'),
    scene.getObjectByName('planet5')
  ];

  planets.forEach(planet => {
    if (!planet) return; // Skip if planet is not found

    const planetPosition = planet.position.clone();
    const distance = ballPosition.distanceTo(planetPosition);
    const combinedRadius = p.scale.x / 2 + planet.scale.x / 2; // Assuming the ball's scale is uniform

    if (distance < combinedRadius) {
      p.scale.multiplyScalar(1.1);
      scene.remove(planet);
      remainingPlanets--;

      if (remainingPlanets === 0) {
        gameEnded = true;
      }
    }
  });
}

function endGame() {
  console.log('Game Over! All planets have been disappeared.');
  // Add any other logic you want for ending the game, such as displaying a message or resetting the scene
}


window.loop = (dt, input) => {
  if (gameEnded) {
    alert('Game Over! All planets have been disappeared.');
    return;
  }

  if (beach_ball && (input.keys.has('ArrowUp') || input.keys.has('ArrowDown') || input.keys.has('ArrowLeft') || input.keys.has('ArrowRight'))) {
    const movementSpeed = 0.005; // Movement speed
    const rollSpeed = 0.01; // Adjust this for the size of the ball

    // Forward and backward movement - along the Z-axis
    if (input.keys.has('ArrowUp')) {
      beach_ball.position.z -= movementSpeed * dt;
      beach_ball.rotation.y += movementSpeed * dt / (Math.PI * beach_ball.scale.y); 
      collide();
    }
    if (input.keys.has('ArrowDown')) {
      beach_ball.position.z += movementSpeed * dt;
      // Roll around the X-axis in the opposite direction
      beach_ball.rotation.y += movementSpeed * dt / (Math.PI * beach_ball.scale.y); 
      collide();
    }

    // Left and right movement - along the X-axis
    if (input.keys.has('ArrowLeft')) {
      beach_ball.position.x -= movementSpeed * dt;
      // Roll around the Y-axis
      beach_ball.rotation.y += movementSpeed * dt / (Math.PI * beach_ball.scale.y); // Assuming the beach_ball's diameter is 1 unit
      collide();
    }
    if (input.keys.has('ArrowRight')) {
      beach_ball.position.x += movementSpeed * dt;
      // Roll around the Y-axis in the opposite direction
      beach_ball.rotation.y -= movementSpeed * dt / (Math.PI * beach_ball.scale.y); 
      collide();
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