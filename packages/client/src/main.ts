import {
  AmbientLight,
  DirectionalLight,
  Mesh,
  MeshLambertMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  WebGLRenderer,
} from 'three';

const scene = new Scene();

const camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 15, 10);
camera.lookAt(0, 0, 0);

const renderer = new WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.append(renderer.domElement);

const geometry = new PlaneGeometry(20, 20);
const material = new MeshLambertMaterial({ color: '#3d9e3d' });
const plane = new Mesh(geometry, material);
plane.rotation.x = -Math.PI / 2;
scene.add(plane);

const directionalLight = new DirectionalLight(undefined, 1);
directionalLight.position.set(5, 10, 5);
scene.add(directionalLight);

const ambientLight = new AmbientLight(undefined, 0.3);
scene.add(ambientLight);

function onResize(): void {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onResize);

function animate(): void {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

animate();
