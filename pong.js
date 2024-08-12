// Initialisation de la scène, de la caméra et du renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000); // Caméra zoomée
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000);  // Fond noir pour un effet plus sombre
document.body.appendChild(renderer.domElement);

// Ajout de la lumière pour un effet stylisé
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(0, 50, 50).normalize();
scene.add(directionalLight);

// Créer le terrain de jeu (stylisé et sombre)
const geometry = new THREE.PlaneGeometry(100, 200);
const material = new THREE.MeshStandardMaterial({ color: 0x111111, side: THREE.DoubleSide });
const field = new THREE.Mesh(geometry, material);
field.rotation.x = Math.PI / 2;
scene.add(field);

// Ajout des LED lumineuses sur les contours du terrain
const ledMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x00ff00 });
const ledGeometry = new THREE.BoxGeometry(2, 2, 2);

for (let i = -50; i <= 50; i += 5) {
    const ledTop = new THREE.Mesh(ledGeometry, ledMaterial);
    ledTop.position.set(i, 1, 100);
    scene.add(ledTop);

    const ledBottom = new THREE.Mesh(ledGeometry, ledMaterial);
    ledBottom.position.set(i, 1, -100);
    scene.add(ledBottom);
}

for (let i = -100; i <= 100; i += 5) {
    const ledLeft = new THREE.Mesh(ledGeometry, ledMaterial);
    ledLeft.position.set(-50, 1, i);
    scene.add(ledLeft);

    const ledRight = new THREE.Mesh(ledGeometry, ledMaterial);
    ledRight.position.set(50, 1, i);
    scene.add(ledRight);
}

// Créer la balle (effet brillant)
const ballGeometry = new THREE.SphereGeometry(2, 32, 32);
const ballMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x666666 });
const ball = new THREE.Mesh(ballGeometry, ballMaterial);
ball.position.set(0, 0, 0); // Position initiale de la balle
scene.add(ball);

// Créer les raquettes (plus fines et lumineuses)
const paddleGeometry = new THREE.BoxGeometry(20, 2, 2);  // Raquettes horizontales
const paddleMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xaaaaaa });
const paddleTop = new THREE.Mesh(paddleGeometry, paddleMaterial);
const paddleBottom = new THREE.Mesh(paddleGeometry, paddleMaterial);
paddleTop.position.set(0, 0, 95);   // Raquette en haut
paddleBottom.position.set(0, 0, -95); // Raquette en bas
scene.add(paddleTop);
scene.add(paddleBottom);

// Ajouter un compteur de points
let scoreTop = 0;
let scoreBottom = 0;

const scoreText = document.createElement('div');
scoreText.style.position = 'absolute';
scoreText.style.top = '20px';
scoreText.style.left = '50%';
scoreText.style.transform = 'translateX(-50%)';
scoreText.style.color = 'white';
scoreText.style.fontSize = '24px';
scoreText.style.fontFamily = 'Arial, sans-serif';
scoreText.innerText = `Top: ${scoreTop} | Bottom: ${scoreBottom}`;
document.body.appendChild(scoreText);

// Positionnement de la caméra pour une vue immersive stylisée
camera.position.set(0, 80, 150);  // Caméra zoomée légèrement
camera.lookAt(0, 0, 0);

// Variables de mouvement de la balle
let ballSpeedX = 0.2;  // Vitesse initiale réduite
let ballSpeedZ = 0.2;  // Vitesse initiale réduite
const maxBallSpeed = 1.5;  // Vitesse maximale de la balle
const ballSpeedIncrement = 0.005;  // Augmentation plus douce de la vitesse de la balle

// Variables pour le mouvement des raquettes
let moveTopLeft = false;
let moveTopRight = false;
let moveBottomLeft = false;
let moveBottomRight = false;

// Ajouter des événements pour contrôler les raquettes
document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') moveTopLeft = true;
    if (event.key === 'ArrowRight') moveTopRight = true;
    if (event.key === 'q') moveBottomLeft = true;
    if (event.key === 'd') moveBottomRight = true;
});

document.addEventListener('keyup', (event) => {
    if (event.key === 'ArrowLeft') moveTopLeft = false;
    if (event.key === 'ArrowRight') moveTopRight = false;
    if (event.key === 'q') moveBottomLeft = false;
    if (event.key === 'd') moveBottomRight = false;
});

// Fonction pour réinitialiser la balle
function resetBall() {
    ball.position.set(0, 0, 0);
    // Définir une direction aléatoire pour la balle
    const angle = Math.random() * Math.PI * 2;
    ballSpeedX = 0.2 * Math.cos(angle);  // Vitesse initiale réduite
    ballSpeedZ = 0.2 * Math.sin(angle);  // Vitesse initiale réduite
}

// Fonction animate mise à jour
function animate() {
    requestAnimationFrame(animate);

    // Mouvements de la balle
    ball.position.x += ballSpeedX;
    ball.position.z += ballSpeedZ;

    // Accélérer la balle jusqu'à une vitesse maximale
    if (Math.abs(ballSpeedX) < maxBallSpeed) {
        ballSpeedX += (ballSpeedX > 0 ? ballSpeedIncrement : -ballSpeedIncrement);
    }
    if (Math.abs(ballSpeedZ) < maxBallSpeed) {
        ballSpeedZ += (ballSpeedZ > 0 ? ballSpeedIncrement : -ballSpeedIncrement);
    }

    // Collisions avec les murs
    if (ball.position.x <= -48 || ball.position.x >= 48) {
        ballSpeedX = -ballSpeedX;
    }
    if (ball.position.z <= -98 || ball.position.z >= 98) {
        if (ball.position.z <= -98) {
            // Point pour l'adversaire en haut
            scoreTop++;
            console.log('Point pour l\'adversaire du haut');
        } else {
            // Point pour l'adversaire en bas
            scoreBottom++;
            console.log('Point pour l\'adversaire en bas');
        }
        
        // Vérifier si un joueur a gagné
        if (scoreTop >= 11) {
            alert('Le joueur du haut a gagné!');
            scoreTop = 0;
            scoreBottom = 0;
        } else if (scoreBottom >= 11) {
            alert('Le joueur du bas a gagné!');
            scoreTop = 0;
            scoreBottom = 0;
        }

        resetBall();
        scoreText.innerText = `Top: ${scoreTop} | Bottom: ${scoreBottom}`;
    }

    // Collisions avec les raquettes
    if (ball.position.z <= -93 && Math.abs(ball.position.x - paddleBottom.position.x) < 10) {
        ballSpeedZ = -ballSpeedZ;
    }
    if (ball.position.z >= 93 && Math.abs(ball.position.x - paddleTop.position.x) < 10) {
        ballSpeedZ = -ballSpeedZ;
    }

    // Mouvements des raquettes
    if (moveTopLeft && paddleTop.position.x > -45) paddleTop.position.x -= 1;
    if (moveTopRight && paddleTop.position.x < 45) paddleTop.position.x += 1;
    if (moveBottomLeft && paddleBottom.position.x > -45) paddleBottom.position.x -= 1;
    if (moveBottomRight && paddleBottom.position.x < 45) paddleBottom.position.x += 1;

    // Rendu de la scène
    renderer.render(scene, camera);
}

// Appeler la fonction animate pour démarrer l'animation
animate();
