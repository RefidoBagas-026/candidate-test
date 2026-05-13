import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.set(
    2.5,
    2,
    2
);

// =====================================================
// Renderer
// =====================================================

const renderer =
    new THREE.WebGLRenderer({
        antialias: true
    });

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

renderer.shadowMap.enabled = true;
document.body.appendChild(
    renderer.domElement
);

// =====================================================
// Controls
// =====================================================

const controls =
    new OrbitControls(
        camera,
        renderer.domElement
    );

controls.enableDamping =
    true;

// =====================================================
// Ambient Light
// =====================================================

const ambientLight =
    new THREE.AmbientLight(
        0xffffff,
        1
    );

scene.add(
    ambientLight
);

// =====================================================
// Directional Light
// =====================================================

const dirLight =
    new THREE.DirectionalLight(
        0xffffff,
        5
    );

dirLight.position.set(
    5,
    10,
    7
);

dirLight.castShadow =
    true;

scene.add(
    dirLight
);

// =====================================================
// Infinite Axis
// =====================================================

createInfiniteAxis();

function createInfiniteAxis() {

    const axisLength =
        1000;

    // X axis
    createAxisLine(

        new THREE.Vector3(
            -axisLength,
            0,
            0
        ),

        new THREE.Vector3(
            axisLength,
            0,
            0
        ),

        0xff0000
    );

    // Y axis
    createAxisLine(

        new THREE.Vector3(
            0,
            -axisLength,
            0
        ),

        new THREE.Vector3(
            0,
            axisLength,
            0
        ),

        0x00ff00
    );

    // Z axis
    createAxisLine(

        new THREE.Vector3(
            0,
            0,
            -axisLength
        ),

        new THREE.Vector3(
            0,
            0,
            axisLength
        ),

        0x0000ff
    );
}

// =====================================================
// Create Axis Line
// =====================================================

function createAxisLine(
    start,
    end,
    color
) {

    const geometry =
        new THREE.BufferGeometry()
            .setFromPoints([
                start,
                end
            ]);

    const material =
        new THREE.LineBasicMaterial({

            color: color
        });

    const line =
        new THREE.Line(

            geometry,

            material
        );

    scene.add(
        line
    );
}

// =====================================================
// Grid Helper
// =====================================================

const gridHelper =
    new THREE.GridHelper(

        1000,
        1000,

        0x444444,
        0x222222
    );

scene.add(
    gridHelper
);

// =====================================================
// FBX Loader
// =====================================================

const fbxLoader =
    new FBXLoader();

// =====================================================
// Load FBX
// =====================================================

fbxLoader.load(

    // FBX path
    'model/wood/wood.fbx',

    // =============================================
    // Success
    // =============================================

    function (fbx) {
        // =================================================
        // Base Material
        // =================================================

        fbx.traverse(function (child) {

            if (child.isMesh) {

                child.castShadow =
                    true;

                child.receiveShadow =
                    true;

                child.material =
                    new THREE.MeshStandardMaterial({

                        color: 0xffcc88
                    });
            }
        });

        // =================================================
        // LEFT BEAM
        // =================================================

        const leftBeam =
            fbx.clone();

        leftBeam.scale.set(
            3,
            0.2,
            0.5
        );

        leftBeam.position.set(
            -3,
            0.2,
            0.5
        );

        scene.add(
            leftBeam
        );

        // =================================================
        // RIGHT BEAM
        // =================================================

        const rightBeam =
            fbx.clone();

        rightBeam.scale.set(
            2,
            0.2,
            0.5
        );

        rightBeam.position.set(
            -2.46,
            0.2,
            1.5
        );

        scene.add(
            rightBeam
        );

        // =================================================
        // TOP BEAM
        // =================================================

        const topBeam =
            fbx.clone();

        topBeam.scale.set(
            2,
            0.2,
            0.4
        );

        topBeam.position.set(
            -2.66,
            0.6,
            1
        );

        scene.add(
            topBeam
        );

        console.log(
            '3 Beam Loaded'
        );
    },

    // =============================================
    // Progress
    // =============================================

    function (xhr) {

        if (xhr.total) {

            console.log(

                (
                    xhr.loaded /
                    xhr.total
                ) * 100

                + '% loaded'
            );
        }
    },

    // =============================================
    // Error
    // =============================================

    function (error) {

        console.error(
            'FBX Error:',
            error
        );
    }
);

// =====================================================
// Resize
// =====================================================

window.addEventListener(

    'resize',

    function () {

        camera.aspect =

            window.innerWidth /

            window.innerHeight;

        camera.updateProjectionMatrix();

        renderer.setSize(

            window.innerWidth,

            window.innerHeight
        );
    }
);

// =====================================================
// Animate
// =====================================================

function animate() {

    controls.update();

    renderer.render(
        scene,
        camera
    );
}

renderer.setAnimationLoop(
    animate
);