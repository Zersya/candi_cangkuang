import './style/main.css'
import * as THREE from 'three'

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { SSAOPass } from 'three/examples/jsm/postprocessing/SSAOPass.js';

/**
 * Sizes
 */
const sizes = {}
sizes.width = window.innerWidth
sizes.height = window.innerHeight

window.addEventListener('resize', () => {
    // Save sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    composer.setSize(sizes.width, sizes.height);
})

/**
 * Environnements
 */
// Scene
const scene = new THREE.Scene()
scene.background = new THREE.Color(0xA0A0A0);
scene.fog = new THREE.Fog(0xA0A0A0, 10, 25);

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000)
scene.add(camera)


const mesh = new THREE.Mesh(new THREE.PlaneGeometry(150, 150), new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false }));
mesh.rotation.x = - Math.PI / 2;
mesh.receiveShadow = true;
scene.add(mesh);

var ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const hemiLight = new THREE.HemisphereLight(0xffffff, 0xA0A0A0);
hemiLight.position.set(0, 8, -10);
scene.add(hemiLight);

// const hemisphereLightHelper = new THREE.HemisphereLightHelper(hemiLight, 1);
// scene.add(hemisphereLightHelper);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
dirLight.position.set(8, 5, 10);
dirLight.castShadow = true;
dirLight.shadow.radius = 4;
scene.add(dirLight);

// const directionalLightHelper = new THREE.DirectionalLightHelper(dirLight, 1);
// scene.add(directionalLightHelper);

const loader = new GLTFLoader();

loader.setPath('assets/models/');

loader
    .load('ground.gltf', function (object) {

        let model = object.scene;

        model.scale.x = 2;
        model.scale.z = 2;

        model.traverse(function (object) {

            if (object.isMesh) {
                object.castShadow = true;
                object.receiveShadow = true;
            }

        });

        centerModel(model)
    }, undefined, function (error) {

        console.error(error);

    });

loader
    .load('candi_cangkuang.gltf', function (object) {

        let model = object.scene;

        model.traverse(function (object) {

            if (object.isMesh) {
                object.castShadow = true;
            }

        });

        centerModel(model)
    }, undefined, function (error) {

        console.error(error);

    });

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('.webgl')
})
renderer.setPixelRatio(window.devicePixelRatio)
renderer.setSize(sizes.width, sizes.height)
renderer.shadowMap.enabled = true;


const composer = new EffectComposer(renderer);

const ssaoPass = new SSAOPass(scene, camera, sizes.width, sizes.height);
ssaoPass.kernelRadius = 8;
ssaoPass.minDistance = 0.01;
ssaoPass.maxDistance = 0.3;
ssaoPass.output = SSAOPass.OUTPUT.Beauty
composer.addPass(ssaoPass);


const controls = new OrbitControls(camera, renderer.domElement);
// controls.addEventListener('change', render); // use if there is no animation loop
controls.minDistance = 5;
controls.maxDistance = 20;
controls.enableKeys = true
controls.keys = {
	LEFT: 'KeyA', //left arrow
	UP: 'KeyW', // up arrow
	RIGHT: 'KeyD', // right arrow
	BOTTOM: 'KeyS' // down arrow
}
controls.target.set(0, 0, - 0.2);
controls.update();


function centerModel(model) {
    // automatically center model and adjust camera
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3()).length();
    const center = box.getCenter(new THREE.Vector3());

    model.position.x += (model.position.x - center.x);
    model.position.z += (model.position.z - center.z);

    camera.updateProjectionMatrix();

    camera.position.copy(center);
    // camera.position.x += size / 2.0;
    camera.position.y += size / 5.0;
    camera.position.z += size / 1.2;
    camera.lookAt(center);

    controls.maxDistance = size * 10;
    controls.update();

    scene.add(model);
}

function render() {
    renderer.render(scene, camera)
    composer.render();
}

const loop = () => {
    render()
    window.requestAnimationFrame(loop)
}

loop()