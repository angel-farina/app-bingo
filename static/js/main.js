// Referencias DOM
const numeroBolilla = document.getElementById("numeroBolilla");
const sacarBtn = document.getElementById("sacarBtn");
const iniciarBtn = document.getElementById("iniciarBtn");
const resultado = document.getElementById("resultado");
const ultimasBolillas = document.getElementById("ultimasBolillas");
const contadorBolillas = document.getElementById("contadorBolillas");
const verBolillasBtn = document.getElementById("verBolillasBtn");
const popup = document.getElementById("popupBolillas");
const cerrarBtn = document.getElementById("cerrarPopup");
const todasBolillas = document.getElementById("todasBolillas");

let bolillasSalidas = [];
let bolillasRestantes = 90;

// ========== CONFIGURACIÓN THREE.JS ==========
const canvas = document.getElementById('bolillaCanvas');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  alpha: true
});

renderer.setSize(300, 300);
renderer.setClearColor(0x000000, 0);
camera.position.z = 5;

// Crear esfera 3D
const geometry = new THREE.SphereGeometry(1.5, 32, 32);

// Crear un canvas para la textura
const textureCanvas = document.createElement('canvas');
textureCanvas.width = 512;
textureCanvas.height = 512;
const ctx = textureCanvas.getContext('2d');

// 1. Crear un cargador de texturas
const textureLoader = new THREE.TextureLoader();

// 2. Cargar la imagen de la textura de la pelota
//    (Debes reemplazar 'ruta/a/textura_pelota.jpg' con la URL de una imagen)
const soccerTexture = textureLoader.load('../static/pattern_soccer.jpg'); 
// (He puesto una URL de ejemplo que puedes usar para probar)

// 3. Crear el material usando esa textura
const material = new THREE.MeshStandardMaterial({
  map: soccerTexture, // <-- Aquí le pasas la textura cargada
  metalness: 0.2,
  roughness: 0.5,
});

// (Asumo que 'geometry' ya está definida, por ejemplo:)
// const geometry = new THREE.SphereGeometry(1, 32, 32); 

// 4. Crear la esfera y añadirla
const sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);

///////////////////////////////////////////////////////////////////

// Iluminación
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

const pointLight = new THREE.PointLight(0xffffff, 0.5);
pointLight.position.set(-5, -5, 5);
scene.add(pointLight);

// Variables de animación
let isSpinning = false;
let spinSpeed = 0;
let maxSpinSpeed = 0.2;
let deceleration = 0.98;

// Loop de animación
function animate() {
  requestAnimationFrame(animate);

  if (isSpinning) {
    sphere.rotation.x += spinSpeed;
    sphere.rotation.y += spinSpeed * 1.3;
    sphere.rotation.z += spinSpeed * 0.7;

    spinSpeed *= deceleration;

    if (spinSpeed < 0.001) {
      isSpinning = false;
      spinSpeed = 0;
    }
  } else {
    sphere.rotation.x += 0.005;
    sphere.rotation.y += 0.008;
  }

  renderer.render(scene, camera);
}
animate();

// Interacción hover
const container = document.getElementById('canvasContainer');
container.addEventListener('mouseenter', () => {
  if (!isSpinning) {
    sphere.scale.set(1.1, 1.1, 1.1);
  }
});

container.addEventListener('mouseleave', () => {
  if (!isSpinning) {
    sphere.scale.set(1, 1, 1);
  }
});

// ========== FUNCIONES DEL JUEGO ==========

function mostrarToast(tipo, mensaje) {
  const toast = document.createElement('div');
  toast.className = `toast align-items-center text-white ${tipo === 'exito' ? 'bg-success' : 'bg-danger'} border-0`;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'assertive');
  toast.setAttribute('aria-atomic', 'true');
  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${mensaje}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>`;
  document.getElementById('toastContainer').appendChild(toast);
  const bsToast = new bootstrap.Toast(toast);
  bsToast.show();
  toast.addEventListener('hidden.bs.toast', () => toast.remove());
}

function actualizarContador() {
  contadorBolillas.textContent = `Bolillas restantes: ${bolillasRestantes}`;
  if (bolillasRestantes === 0) {
    sacarBtn.disabled = true;
    sacarBtn.classList.add("opacity-50", "cursor-not-allowed");
  } else {
    sacarBtn.disabled = false;
    sacarBtn.classList.remove("opacity-50", "cursor-not-allowed");
  }
}

function agregarBolillaVisual(numero) {
  const bolillaDiv = document.createElement("div");
  bolillaDiv.className = "bolilla-pequena";
  const color = getColorBolilla(numero);
  bolillaDiv.style.background = `radial-gradient(circle at 30% 30%, #fff, ${color}, ${color})`;
  bolillaDiv.innerHTML = `<div>${numero}</div>`;

  ultimasBolillas.insertBefore(bolillaDiv, ultimasBolillas.firstChild);

  const bolillas = ultimasBolillas.querySelectorAll('.bolilla-pequena');
  if (bolillas.length > 10) {
    bolillas[bolillas.length - 1].remove();
  }
}

// Sistema de color 1-10, 11-20, etc. (Sin cambios, ya estaba bien)
function getColorBolilla(numero) {
    if (numero >= 1 && numero <= 10) return '#ff6b6b';   // Rojo
    if (numero >= 11 && numero <= 20) return '#4dabf7'; // Azul
    if (numero >= 21 && numero <= 30) return '#51cf66'; // Verde
    if (numero >= 31 && numero <= 40) return '#ffd43b'; // Amarillo
    if (numero >= 41 && numero <= 50) return '#ff8787'; // Rosa
    if (numero >= 51 && numero <= 60) return '#f7a83b'; // Naranja
    if (numero >= 61 && numero <= 70) return '#a288e8'; // Violeta
    if (numero >= 71 && numero <= 80) return '#7ecfd4'; // Cyan
    if (numero >= 81 && numero <= 90) return '#b0b0b0'; // Gris
    return '#ff6b6b'; // Default
}

// ========== EVENTOS ==========

// Iniciar Bingo
iniciarBtn.addEventListener("click", async () => {
  const span = iniciarBtn.querySelector("span");
  const originalText = span.textContent;
  span.textContent = "Iniciando...";
  iniciarBtn.disabled = true;

  try {
    const res = await fetch("/iniciar_bingo/");
    const data = await res.json();

    if (data.mensaje) {
      mostrarToast('exito', data.mensaje);
      bolillasSalidas = [];
      bolillasRestantes = data.total;
      numeroBolilla.textContent = "";
      ultimasBolillas.innerHTML = "";
      resultado.classList.add("hidden");
      // cambiarColorEsfera('#4dabf7');
      actualizarContador();
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
  } catch (err) {
    mostrarToast('error', '❌ Error al iniciar el bingo.');
  } finally {
    span.textContent = originalText;
    iniciarBtn.disabled = false;
  }
});

// Sacar Bolilla
sacarBtn.addEventListener("click", async () => {
  if (bolillasRestantes === 0) {
    mostrarToast('error', '⚠️ No quedan más bolillas.');
    return;
  }

  const span = sacarBtn.querySelector("span");
  const originalText = span.textContent;

  span.textContent = "Girando...";
  sacarBtn.disabled = true;

  const ruletaSound = new Audio("/static/sounds/spinning-roulette-wheel-4s.mp3");
  ruletaSound.volume = 0.7;
  ruletaSound.play().catch(() => {});

  isSpinning = true;
  spinSpeed = maxSpinSpeed;
  sphere.scale.set(1, 1, 1);

  // --- INICIO DE CAMBIOS ---

  // 1. Ocultamos el número de la esfera
  numeroBolilla.textContent = ""; 

  // 2. Mostramos el (la caja de abajo)
  resultado.classList.remove("hidden"); 

  const intervalId = setInterval(() => {
    // 3. El flipper de números aleatorios ahora ocurre en 'resultado'
    resultado.textContent = Math.floor(Math.random() * 90) + 1; 
  }, 100);
  
  // --- FIN DE CAMBIOS ---

  setTimeout(async () => {
    clearInterval(intervalId);
    ruletaSound.pause();
    ruletaSound.currentTime = 0;

    isSpinning = false;
    spinSpeed = 0;

    try {
      const res = await fetch("/sacar_bolilla/");
      const data = await res.json();

      if (data.bolilla) {
        // const aplausos = new Audio("/static/sounds/cheers_crowd.mp3");
        // aplausos.volume = 0.6;
        // aplausos.play().catch(() => {});

        // 4. Al final, mostramos el número final en AMBOS lugares
//         numeroBolilla.textContent = data.bolilla; // En la esfera
        resultado.textContent = data.bolilla; 	// En la caja

        const color = getColorBolilla(data.bolilla);
        // cambiarColorEsfera(color);

        // Esta línea ya no es tan necesaria porque lo hicimos antes, pero no hace daño
        resultado.classList.remove("hidden"); 

        agregarBolillaVisual(data.bolilla);

        bolillasSalidas = data.salidas;
        bolillasRestantes = data.restantes;
        actualizarContador();

        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });

        if (data.restantes === 0) {
          setTimeout(() => {
            mostrarToast('exito', '🎊 ¡Bingo completo! Todas las bolillas han salido.');
            let confettiCount = 0;
            const interval = setInterval(() => {
              confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
              confettiCount++;
              if (confettiCount >= 5) clearInterval(interval);
            }, 500);
          }, 1000);
        }
      } else if (data.error) {
        mostrarToast('error', data.mensaje || data.error);
end;
      }
    } catch (err) {
      mostrarToast('error', '❌ Error al sacar la bolilla.');
    } finally {
      span.textContent = originalText;
      sacarBtn.disabled = bolillasRestantes === 0;
    }
  }, 3000);
});

// Ver bolillas ordenadas (Sin cambios, ya estaba bien)
verBolillasBtn.addEventListener("click", () => {
  if (bolillasSalidas.length === 0) {
    mostrarToast('error', '⚠️ No se han sacado bolillas aún.');
    return;
  }

  todasBolillas.innerHTML = "";
  
  const bolillasOrdenadas = [...bolillasSalidas].sort((a, b) => a - b);

  bolillasOrdenadas.forEach(numero => {
    const bolillaDiv = document.createElement("div");
    bolillaDiv.className = "bolilla-pequena";
    const color = getColorBolilla(numero);
    bolillaDiv.style.background = `radial-gradient(circle at 30% 30%, #fff, ${color}, ${color})`;
    bolillaDiv.innerHTML = `<div>${numero}</div>`;
    todasBolillas.appendChild(bolillaDiv);
  });

  popup.classList.remove("hidden");
});

// Cerrar popup
cerrarBtn.addEventListener("click", () => popup.classList.add("hidden"));
popup.addEventListener("click", (e) => {
  if (e.target === popup) popup.classList.add("hidden");
});

// Estado inicial
actualizarContador();