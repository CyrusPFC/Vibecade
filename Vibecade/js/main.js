import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Create game overlay
const gameOverlay = document.createElement('div');
gameOverlay.style.position = 'fixed';
gameOverlay.style.top = '0';
gameOverlay.style.left = '0';
gameOverlay.style.width = '100%';
gameOverlay.style.height = '100%';
gameOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
gameOverlay.style.display = 'none';
gameOverlay.style.zIndex = '1000';

// Create exit button
const exitButton = document.createElement('button');
exitButton.innerHTML = '×';
exitButton.style.position = 'fixed';
exitButton.style.top = '20px';
exitButton.style.right = '20px';
exitButton.style.width = '40px';
exitButton.style.height = '40px';
exitButton.style.fontSize = '24px';
exitButton.style.backgroundColor = '#ff0000';
exitButton.style.color = 'white';
exitButton.style.border = 'none';
exitButton.style.borderRadius = '50%';
exitButton.style.cursor = 'pointer';
exitButton.style.zIndex = '1001';
exitButton.style.display = 'none';
exitButton.onclick = () => {
    gameOverlay.style.display = 'none';
    exitButton.style.display = 'none';
    playerGroup.visible = true;
};
document.body.appendChild(exitButton);

// Create game iframe
const gameFrame = document.createElement('iframe');
gameFrame.style.width = '100%';
gameFrame.style.height = '100%';
gameFrame.style.border = 'none';
gameOverlay.appendChild(gameFrame);
document.body.appendChild(gameOverlay);

// Game URLs and colors
const gameConfigs = {
    'Hot Air Balloon': {
        url: 'https://www.hotairvibe.com/game',
        cabinetColor: 0xff6b6b,  // Warm red
        frameColor: 0xffd93d     // Yellow
    },
    'Shooter World': {
        url: 'http://ShooterWorldAi.com',
        cabinetColor: 0x2ecc71,  // Green
        frameColor: 0x27ae60     // Dark green
    },
    'Flight Sim': {
        url: 'https://fly.pieter.com/',
        cabinetColor: 0x3498db,  // Blue
        frameColor: 0x2980b9     // Dark blue
    },
    'Vibe Sail': {
        url: 'https://vibesail.com/',
        cabinetColor: 0x9b59b6,  // Purple
        frameColor: 0x8e44ad     // Dark purple
    },
    'Bomberman': {
        url: 'https://bomberman-bice.vercel.app/',
        cabinetColor: 0xe74c3c,  // Red
        frameColor: 0xc0392b     // Dark red
    },
    'Duke': {
        url: 'https://duke.jobboardsearch.com/',
        cabinetColor: 0xf1c40f,  // Yellow
        frameColor: 0xf39c12     // Orange
    },
    'Space Shooter': {
        url: 'https://codepen.io/hyneuclx-the-looper/full/pvobrzL',
        cabinetColor: 0x1abc9c,  // Turquoise
        frameColor: 0x16a085     // Dark turquoise
    }
};

// Arcade Machines
let arcadeMachines = [];

// Load font
const fontLoader = new FontLoader();
let font;
fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function(loadedFont) {
    font = loadedFont;
    // Create arcade machines against walls
    Object.entries(gameConfigs).forEach(([gameName, config], index) => {
        let position, rotation;
        
        // Arrange machines against walls
        if (index < 2) {
            // Back wall
            position = new THREE.Vector3(-15 + index * 30, 0, -24);
            rotation = 0;
        } else if (index < 4) {
            // Left wall
            position = new THREE.Vector3(-24, 0, -15 + (index - 2) * 30);
            rotation = Math.PI / 2;
        } else if (index < 6) {
            // Right wall
            position = new THREE.Vector3(24, 0, -15 + (index - 4) * 30);
            rotation = -Math.PI / 2;
        } else {
            // Front wall (Space Shooter)
            position = new THREE.Vector3(0, 0, 24);
            rotation = Math.PI;
        }
        
        const machine = createArcadeMachine(gameName, config.cabinetColor, config.frameColor);
        machine.position.copy(position);
        machine.rotation.y = rotation;
        scene.add(machine);
        arcadeMachines.push({ machine, url: config.url });
    });
});

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
directionalLight.castShadow = true;
scene.add(directionalLight);

// Neon lights
const neonColors = [0xff00ff, 0x00ffff, 0xffff00, 0xff0000];
const neonLights = [];
neonColors.forEach((color, index) => {
    const light = new THREE.PointLight(color, 1, 10);
    light.position.set(
        Math.cos(index * Math.PI / 2) * 20,
        3,
        Math.sin(index * Math.PI / 2) * 20
    );
    scene.add(light);
    neonLights.push(light);
});

// NPCs
const npcs = [];
const npcPositions = [
    { x: -10, z: -10 },
    { x: 10, z: -15 },
    { x: -15, z: 5 },
    { x: 15, z: 10 },
    { x: 0, z: -20 }
];

// Add wall boundaries for NPCs
const wallBoundaries = {
    minX: -24,
    maxX: 24,
    minZ: -24,
    maxZ: 24
};

// Create NPCs
function createNPC() {
    const npc = new THREE.Group();
    
    // Body
    const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.3, 0.8, 32),
        new THREE.MeshStandardMaterial({ 
            color: Math.random() * 0xffffff,
            metalness: 0.3,
            roughness: 0.7
        })
    );
    body.position.y = 0.4;
    body.castShadow = true;
    npc.add(body);
    
    // Head
    const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 32, 32),
        new THREE.MeshStandardMaterial({ color: 0xffdbac })
    );
    head.position.y = 1.4;
    head.castShadow = true;
    npc.add(head);
    
    return npc;
}

// Create bar
function createBar() {
    const bar = new THREE.Group();
    
    // Bar counter
    const counterGeometry = new THREE.BoxGeometry(8, 1, 1);
    const counterMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x8b4513,
        metalness: 0.1,
        roughness: 0.8
    });
    const counter = new THREE.Mesh(counterGeometry, counterMaterial);
    counter.position.set(0, 1, 15);
    counter.castShadow = true;
    bar.add(counter);
    
    // Bar stools
    for (let i = -3; i <= 3; i++) {
        const stool = createBarStool();
        stool.position.set(i * 2, 0, 14);
        bar.add(stool);
    }
    
    // Bartender
    const bartender = createBartender();
    bartender.position.set(0, 0, 16);
    bar.add(bartender);
    
    // Drinks on counter - adjusted positions to be more centered
    const drinkPositions = [
        { x: -2, z: 15.1 },
        { x: -1, z: 15.1 },
        { x: 0, z: 15.1 },
        { x: 1, z: 15.1 },
        { x: 2, z: 15.1 }
    ];
    
    drinkPositions.forEach(pos => {
        const drink = createDrink();
        drink.position.set(pos.x, 1.5, pos.z);
        bar.add(drink);
    });
    
    return bar;
}

function createBarStool() {
    const stool = new THREE.Group();
    
    // Seat
    const seat = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.3, 0.1, 16),
        new THREE.MeshStandardMaterial({ 
            color: 0x8b4513,
            metalness: 0.1,
            roughness: 0.8
        })
    );
    seat.position.y = 0.5;
    seat.castShadow = true;
    stool.add(seat);
    
    // Legs
    const legGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1, 8);
    const legMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x8b4513,
        metalness: 0.1,
        roughness: 0.8
    });
    
    for (let i = 0; i < 3; i++) {
        const leg = new THREE.Mesh(legGeometry, legMaterial);
        leg.position.set(
            Math.cos(i * Math.PI * 2 / 3) * 0.2,
            0,
            Math.sin(i * Math.PI * 2 / 3) * 0.2
        );
        leg.castShadow = true;
        stool.add(leg);
    }
    
    return stool;
}

function createBartender() {
    const bartender = new THREE.Group();
    
    // Body
    const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.3, 0.8, 32),
        new THREE.MeshStandardMaterial({ 
            color: 0x2c3e50,
            metalness: 0.3,
            roughness: 0.7
        })
    );
    body.position.y = 0.4;
    body.castShadow = true;
    bartender.add(body);
    
    // Head
    const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 32, 32),
        new THREE.MeshStandardMaterial({ color: 0xffdbac })
    );
    head.position.y = 1.4;
    head.castShadow = true;
    bartender.add(head);
    
    // Apron
    const apron = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 0.8, 0.1),
        new THREE.MeshStandardMaterial({ 
            color: 0xffffff,
            metalness: 0.1,
            roughness: 0.8
        })
    );
    apron.position.set(0, 0.8, 0);
    apron.castShadow = true;
    bartender.add(apron);
    
    return bartender;
}

function createDrink() {
    const drink = new THREE.Group();
    
    // Glass
    const glass = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.1, 0.3, 16),
        new THREE.MeshStandardMaterial({ 
            color: 0x88ccff,
            transparent: true,
            opacity: 0.7,
            metalness: 0.1,
            roughness: 0.2
        })
    );
    glass.position.y = 0.15;
    glass.castShadow = true;
    drink.add(glass);
    
    // Liquid
    const liquid = new THREE.Mesh(
        new THREE.CylinderGeometry(0.09, 0.09, 0.2, 16),
        new THREE.MeshStandardMaterial({ 
            color: Math.random() > 0.5 ? 0xff0000 : 0x00ff00,
            metalness: 0.1,
            roughness: 0.2
        })
    );
    liquid.position.y = 0.1;
    liquid.castShadow = true;
    drink.add(liquid);
    
    return drink;
}

// Arcade Interior
function createArcadeInterior() {
    const interior = new THREE.Group();
    
    // Main floor with pattern
    const floorGeometry = new THREE.PlaneGeometry(50, 50);
    const floorTexture = new THREE.TextureLoader().load('https://threejs.org/examples/textures/hardwood2_diffuse.jpg');
    floorTexture.wrapS = THREE.RepeatWrapping;
    floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(4, 4);
    const floorMaterial = new THREE.MeshStandardMaterial({ 
        map: floorTexture,
        metalness: 0.1,
        roughness: 0.8
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    interior.add(floor);

    // Walls with wallpaper texture
    const wallTexture = new THREE.TextureLoader().load('https://threejs.org/examples/textures/brick_diffuse.jpg');
    wallTexture.wrapS = THREE.RepeatWrapping;
    wallTexture.wrapT = THREE.RepeatWrapping;
    wallTexture.repeat.set(2, 2);
    const wallMaterial = new THREE.MeshStandardMaterial({ 
        map: wallTexture,
        metalness: 0.1,
        roughness: 0.8
    });

    // Back wall with windows
    const backWall = new THREE.Mesh(
        new THREE.PlaneGeometry(50, 10),
        wallMaterial
    );
    backWall.position.z = -25;
    backWall.position.y = 5;
    backWall.receiveShadow = true;
    interior.add(backWall);

    // Add windows to back wall
    for (let i = 0; i < 5; i++) {
        const windowGeometry = new THREE.PlaneGeometry(3, 2);
        const windowMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x88ccff,
            transparent: true,
            opacity: 0.7,
            emissive: 0x88ccff,
            emissiveIntensity: 0.5
        });
        const window = new THREE.Mesh(windowGeometry, windowMaterial);
        window.position.set(-15 + i * 7, 5, -24.9);
        window.receiveShadow = true;
        interior.add(window);
    }

    // Side walls with windows
    const leftWall = new THREE.Mesh(
        new THREE.PlaneGeometry(50, 10),
        wallMaterial
    );
    leftWall.position.x = -25;
    leftWall.position.y = 5;
    leftWall.rotation.y = Math.PI / 2;
    leftWall.receiveShadow = true;
    interior.add(leftWall);

    const rightWall = new THREE.Mesh(
        new THREE.PlaneGeometry(50, 10),
        wallMaterial
    );
    rightWall.position.x = 25;
    rightWall.position.y = 5;
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.receiveShadow = true;
    interior.add(rightWall);

    // Ceiling with tiles
    const ceilingGeometry = new THREE.PlaneGeometry(50, 50);
    const ceilingTexture = new THREE.TextureLoader().load('https://threejs.org/examples/textures/terrain/grasslight-big.jpg');
    ceilingTexture.wrapS = THREE.RepeatWrapping;
    ceilingTexture.wrapT = THREE.RepeatWrapping;
    ceilingTexture.repeat.set(4, 4);
    const ceilingMaterial = new THREE.MeshStandardMaterial({ 
        map: ceilingTexture,
        metalness: 0.1,
        roughness: 0.8
    });
    const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
    ceiling.position.y = 10;
    ceiling.rotation.x = Math.PI / 2;
    ceiling.receiveShadow = true;
    interior.add(ceiling);

    // Add more chairs
    for (let i = 0; i < 8; i++) {
        const chair = createChair();
        chair.position.set(-20 + i * 5, 0, 10);
        interior.add(chair);
    }
    
    // Add bar area
    const bar = createBar();
    interior.add(bar);
    
    // Add NPCs
    npcPositions.forEach(pos => {
        const npc = createNPC();
        npc.position.set(pos.x, 0, pos.z);
        scene.add(npc);
        npcs.push({
            mesh: npc,
            target: new THREE.Vector3(
                pos.x + (Math.random() - 0.5) * 10,
                0,
                pos.z + (Math.random() - 0.5) * 10
            ),
            speed: 0.02 + Math.random() * 0.03
        });
    });
    
    return interior;
}

function createBench() {
    const bench = new THREE.Group();
    
    // Bench seat
    const seatGeometry = new THREE.BoxGeometry(2, 0.2, 0.5);
    const seatMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x8b4513,
        metalness: 0.1,
        roughness: 0.8
    });
    const seat = new THREE.Mesh(seatGeometry, seatMaterial);
    seat.position.y = 0.5;
    seat.castShadow = true;
    bench.add(seat);

    // Bench back
    const backGeometry = new THREE.BoxGeometry(2, 0.8, 0.2);
    const backMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x8b4513,
        metalness: 0.1,
        roughness: 0.8
    });
    const back = new THREE.Mesh(backGeometry, backMaterial);
    back.position.set(0, 0.9, -0.15);
    back.castShadow = true;
    bench.add(back);

    // Bench legs
    const legGeometry = new THREE.BoxGeometry(0.1, 1, 0.1);
    const legMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x8b4513,
        metalness: 0.1,
        roughness: 0.8
    });

    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(-0.9, 0, 0);
    leftLeg.castShadow = true;
    bench.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(0.9, 0, 0);
    rightLeg.castShadow = true;
    bench.add(rightLeg);

    return bench;
}

function createTable() {
    const table = new THREE.Group();
    
    // Table top
    const topGeometry = new THREE.BoxGeometry(1.5, 0.1, 1.5);
    const topMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x8b4513,
        metalness: 0.1,
        roughness: 0.8
    });
    const top = new THREE.Mesh(topGeometry, topMaterial);
    top.position.y = 1;
    top.castShadow = true;
    table.add(top);

    // Table legs
    const legGeometry = new THREE.BoxGeometry(0.1, 2, 0.1);
    const legMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x8b4513,
        metalness: 0.1,
        roughness: 0.8
    });

    const legPositions = [
        [-0.7, 0, -0.7],
        [0.7, 0, -0.7],
        [-0.7, 0, 0.7],
        [0.7, 0, 0.7]
    ];

    legPositions.forEach(pos => {
        const leg = new THREE.Mesh(legGeometry, legMaterial);
        leg.position.set(pos[0], pos[1], pos[2]);
        leg.castShadow = true;
        table.add(leg);
    });

    // Add chairs around table
    const chairGeometry = new THREE.BoxGeometry(0.4, 1, 0.4);
    const chairMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x8b4513,
        metalness: 0.1,
        roughness: 0.8
    });

    const chairPositions = [
        [-1.2, 0, 0],
        [1.2, 0, 0],
        [0, 0, -1.2],
        [0, 0, 1.2]
    ];

    chairPositions.forEach(pos => {
        const chair = new THREE.Mesh(chairGeometry, chairMaterial);
        chair.position.set(pos[0], pos[1], pos[2]);
        chair.castShadow = true;
        table.add(chair);
    });

    return table;
}

function createChair() {
    const chair = new THREE.Group();
    
    // Chair seat
    const seatGeometry = new THREE.BoxGeometry(0.5, 0.1, 0.5);
    const seatMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x8b4513,
        metalness: 0.1,
        roughness: 0.8
    });
    const seat = new THREE.Mesh(seatGeometry, seatMaterial);
    seat.position.y = 0.5;
    seat.castShadow = true;
    chair.add(seat);
    
    // Chair back
    const backGeometry = new THREE.BoxGeometry(0.5, 0.6, 0.1);
    const backMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x8b4513,
        metalness: 0.1,
        roughness: 0.8
    });
    const back = new THREE.Mesh(backGeometry, backMaterial);
    back.position.set(0, 0.8, -0.2);
    back.castShadow = true;
    chair.add(back);
    
    // Chair legs
    const legGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.5, 8);
    const legMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x8b4513,
        metalness: 0.1,
        roughness: 0.8
    });
    
    const legPositions = [
        [-0.2, 0, -0.2],
        [0.2, 0, -0.2],
        [-0.2, 0, 0.2],
        [0.2, 0, 0.2]
    ];
    
    legPositions.forEach(pos => {
        const leg = new THREE.Mesh(legGeometry, legMaterial);
        leg.position.set(pos[0], pos[1], pos[2]);
        leg.castShadow = true;
        chair.add(leg);
    });
    
    return chair;
}

// Create and add the arcade interior
const arcadeInterior = createArcadeInterior();
scene.add(arcadeInterior);

// Player
const playerGroup = new THREE.Group();

// Human body
const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.8, 32);
const bodyMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x2c3e50,
    metalness: 0.3,
    roughness: 0.7
});
const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
body.position.y = 0.4;
body.castShadow = true;
playerGroup.add(body);

// Neck
const neckGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.2, 16);
const neckMaterial = new THREE.MeshStandardMaterial({ color: 0xffdbac });
const neck = new THREE.Mesh(neckGeometry, neckMaterial);
neck.position.y = 1.2;
neck.castShadow = true;
playerGroup.add(neck);

// Head
const headGeometry = new THREE.SphereGeometry(0.2, 32, 32);
const headMaterial = new THREE.MeshStandardMaterial({ color: 0xffdbac });
const head = new THREE.Mesh(headGeometry, headMaterial);
head.position.y = 1.4;
head.castShadow = true;
playerGroup.add(head);

// Face features
// Eyes
const eyeGeometry = new THREE.SphereGeometry(0.03, 16, 16);
const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
leftEye.position.set(-0.06, 1.45, 0.15);
leftEye.castShadow = true;
playerGroup.add(leftEye);

const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
rightEye.position.set(0.06, 1.45, 0.15);
rightEye.castShadow = true;
playerGroup.add(rightEye);

// Nose
const noseGeometry = new THREE.ConeGeometry(0.02, 0.05, 16);
const noseMaterial = new THREE.MeshStandardMaterial({ color: 0xffdbac });
const nose = new THREE.Mesh(noseGeometry, noseMaterial);
nose.position.set(0, 1.42, 0.18);
nose.rotation.x = -Math.PI / 2;
nose.castShadow = true;
playerGroup.add(nose);

// Mouth
const mouthGeometry = new THREE.TorusGeometry(0.03, 0.01, 8, 16);
const mouthMaterial = new THREE.MeshStandardMaterial({ color: 0xff6b6b });
const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
mouth.position.set(0, 1.35, 0.15);
mouth.rotation.x = Math.PI / 2;
mouth.castShadow = true;
playerGroup.add(mouth);

// Hair
const hairGeometry = new THREE.SphereGeometry(0.22, 32, 32);
const hairMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x2c3e50,
    metalness: 0.3,
    roughness: 0.7
});
const hair = new THREE.Mesh(hairGeometry, hairMaterial);
hair.position.y = 1.5;
hair.position.z = 0.05;
hair.castShadow = true;
playerGroup.add(hair);

// Shirt
const shirtGeometry = new THREE.CylinderGeometry(0.35, 0.35, 0.6, 32);
const shirtMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x3498db,
    metalness: 0.2,
    roughness: 0.8
});
const shirt = new THREE.Mesh(shirtGeometry, shirtMaterial);
shirt.position.y = 0.7;
shirt.castShadow = true;
playerGroup.add(shirt);

// Pants
const pantsGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.4, 32);
const pantsMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x2c3e50,
    metalness: 0.3,
    roughness: 0.7
});
const pants = new THREE.Mesh(pantsGeometry, pantsMaterial);
pants.position.y = 0.2;
pants.castShadow = true;
playerGroup.add(pants);

// Arms
const armGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.6, 16);
const armMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x3498db,
    metalness: 0.2,
    roughness: 0.8
});

const leftArm = new THREE.Mesh(armGeometry, armMaterial);
leftArm.position.set(-0.4, 0.7, 0);
leftArm.rotation.z = Math.PI / 4;
leftArm.castShadow = true;
playerGroup.add(leftArm);

const rightArm = new THREE.Mesh(armGeometry, armMaterial);
rightArm.position.set(0.4, 0.7, 0);
rightArm.rotation.z = -Math.PI / 4;
rightArm.castShadow = true;
playerGroup.add(rightArm);

// Hands
const handGeometry = new THREE.SphereGeometry(0.1, 16, 16);
const handMaterial = new THREE.MeshStandardMaterial({ color: 0xffdbac });

const leftHand = new THREE.Mesh(handGeometry, handMaterial);
leftHand.position.set(-0.7, 0.7, 0);
leftHand.castShadow = true;
playerGroup.add(leftHand);

const rightHand = new THREE.Mesh(handGeometry, handMaterial);
rightHand.position.set(0.7, 0.7, 0);
rightHand.castShadow = true;
playerGroup.add(rightHand);

// Legs
const legGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.6, 16);
const legMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x2c3e50,
    metalness: 0.3,
    roughness: 0.7
});

const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
leftLeg.position.set(-0.15, -0.1, 0);
leftLeg.castShadow = true;
playerGroup.add(leftLeg);

const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
rightLeg.position.set(0.15, -0.1, 0);
rightLeg.castShadow = true;
playerGroup.add(rightLeg);

// Feet
const footGeometry = new THREE.BoxGeometry(0.2, 0.1, 0.3);
const footMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x34495e,
    metalness: 0.5,
    roughness: 0.5
});

const leftFoot = new THREE.Mesh(footGeometry, footMaterial);
leftFoot.position.set(-0.15, -0.4, 0);
leftFoot.castShadow = true;
playerGroup.add(leftFoot);

const rightFoot = new THREE.Mesh(footGeometry, footMaterial);
rightFoot.position.set(0.15, -0.4, 0);
rightFoot.castShadow = true;
playerGroup.add(rightFoot);

// Rotate the entire character to face forward
playerGroup.rotation.y = Math.PI;
playerGroup.position.set(0, 0, 0);
scene.add(playerGroup);

// Arcade Machine
let arcadeMachine;

function createArcadeMachine(gameName, cabinetColor, frameColor) {
    const machine = new THREE.Group();
    
    // Cabinet
    const cabinet = new THREE.Mesh(
        new THREE.BoxGeometry(2, 3, 1),
        new THREE.MeshStandardMaterial({ 
            color: cabinetColor,
            metalness: 0.8,
            roughness: 0.2,
            emissive: cabinetColor,
            emissiveIntensity: 0.2
        })
    );
    cabinet.castShadow = true;
    cabinet.receiveShadow = true;
    machine.add(cabinet);
    
    // Screen
    const screen = new THREE.Mesh(
        new THREE.PlaneGeometry(1.5, 1.5),
        new THREE.MeshStandardMaterial({ 
            color: 0x000000,
            emissive: 0x000000
        })
    );
    screen.position.z = 0.51;
    screen.position.y = 1.5;
    screen.castShadow = true;
    machine.add(screen);
    
    // Neon frame
    const frameGeometry = new THREE.BoxGeometry(1.7, 1.7, 0.1);
    const frameMaterial = new THREE.MeshStandardMaterial({ 
        color: frameColor,
        metalness: 0.8,
        roughness: 0.2,
        emissive: frameColor,
        emissiveIntensity: 0.5
    });
    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    frame.position.z = 0.5;
    frame.position.y = 1.5;
    machine.add(frame);
    
    // Game name text
    if (font) {
        const textGeometry = new TextGeometry(gameName, {
            font: font,
            size: 0.1,
            height: 0.05
        });
        const textMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xffffff,
            emissive: 0xffffff,
            emissiveIntensity: 0.5
        });
        const text = new THREE.Mesh(textGeometry, textMaterial);
        text.position.set(-0.5, 2.5, 0.51);
        machine.add(text);
    }
    
    return machine;
}

// Controls
const keys = {};
document.addEventListener('keydown', (e) => keys[e.key.toLowerCase()] = true);
document.addEventListener('keyup', (e) => keys[e.key.toLowerCase()] = false);
document.addEventListener('click', () => document.body.requestPointerLock());
let mouseX = 0, mouseY = 0;
document.addEventListener('mousemove', (e) => {
    if (document.pointerLockElement) {
        mouseX = e.movementX * 0.002;
        mouseY = e.movementY * 0.002;
    }
});

// Camera settings
let cameraDistance = 10;
const minCameraDistance = 5;
const maxCameraDistance = 20;
const zoomSpeed = 0.5;

// Add mouse wheel event listener
document.addEventListener('wheel', (e) => {
    if (document.pointerLockElement) {
        // Adjust camera distance based on scroll
        cameraDistance = Math.max(minCameraDistance, Math.min(maxCameraDistance, 
            cameraDistance + (e.deltaY > 0 ? zoomSpeed : -zoomSpeed)));
    }
});

// Update loop
function animate() {
    requestAnimationFrame(animate);

    // Player movement
    if (document.pointerLockElement) {
        playerGroup.rotation.y -= mouseX;
    }
    
    const speed = 0.3;
    if (keys['w']) playerGroup.translateZ(-speed);
    if (keys['s']) playerGroup.translateZ(speed);
    if (keys['a']) playerGroup.translateX(-speed);
    if (keys['d']) playerGroup.translateX(speed);

    // Arcade machine interaction
    if (keys['f']) {
        for (const { machine, url } of arcadeMachines) {
            if (playerGroup.position.distanceTo(machine.position) < 3) {
                gameFrame.src = url;
                gameOverlay.style.display = 'block';
                exitButton.style.display = 'block';
                playerGroup.visible = false;
                keys['f'] = false;
                break;
            }
        }
    }

    // Animate neon lights
    neonLights.forEach((light, index) => {
        light.intensity = 0.5 + Math.sin(Date.now() * 0.001 + index) * 0.5;
    });

    // Camera follow with zoom
    const cameraOffset = new THREE.Vector3(0, 5, cameraDistance);
    cameraOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), playerGroup.rotation.y);
    camera.position.copy(playerGroup.position).add(cameraOffset);
    camera.lookAt(playerGroup.position);

    mouseX = mouseY = 0;

    // Update NPCs with wall collision
    npcs.forEach(npc => {
        const direction = npc.target.clone().sub(npc.mesh.position);
        if (direction.length() < 0.1) {
            // Set new random target within boundaries
            npc.target.set(
                wallBoundaries.minX + Math.random() * (wallBoundaries.maxX - wallBoundaries.minX),
                0,
                wallBoundaries.minZ + Math.random() * (wallBoundaries.maxZ - wallBoundaries.minZ)
            );
        } else {
            direction.normalize();
            const nextPosition = npc.mesh.position.clone().add(direction.multiplyScalar(npc.speed));
            
            // Check if next position would be within boundaries
            if (nextPosition.x >= wallBoundaries.minX && 
                nextPosition.x <= wallBoundaries.maxX && 
                nextPosition.z >= wallBoundaries.minZ && 
                nextPosition.z <= wallBoundaries.maxZ) {
                npc.mesh.position.copy(nextPosition);
                npc.mesh.rotation.y = Math.atan2(direction.x, direction.z);
            } else {
                // If would hit wall, choose new random target
                npc.target.set(
                    wallBoundaries.minX + Math.random() * (wallBoundaries.maxX - wallBoundaries.minX),
                    0,
                    wallBoundaries.minZ + Math.random() * (wallBoundaries.maxZ - wallBoundaries.minZ)
                );
            }
        }
    });

    renderer.render(scene, camera);
}
animate();

// Window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}); 