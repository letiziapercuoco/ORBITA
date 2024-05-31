// Main2

// l'html sta solo su GitHub

// Ora importiamo le librerie esterne che ci servono, e le stiamo importando dentro ThreeJS
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Il draco ci serve per caricare il modello più velocemente
const draco = new DRACOLoader();
draco.setDecoderConfig({ type: 'js' }); // Dico al software che deve usare una versione JavaScript per leggere i modelli
draco.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/'); // Dico al software dove andarli a prendere

// Creo un caricatore GLTF e imposto i caricatori KTX2 e DRACO
const gltf = new GLTFLoader().setKTX2Loader(new KTX2Loader()).setDRACOLoader(draco);

// Creo un elemento canvas e lo aggiungo al corpo del documento
const canvas = document.createElement('canvas');
canvas.style.zIndex = "1";
document.body.appendChild(canvas);

// Creo un render usando webGL che serve per visualizzare la grafica tridimensionale nel browser
const render = new THREE.WebGLRenderer({
    canvas: canvas,
    depth: true
});

// Rendo responsive il canvas
const resizeCanvas = () => {
    render.setSize(document.body.clientWidth, document.body.clientHeight, true);
    render.pixelRatio = window.devicePixelRatio;
    camera.aspect = document.body.clientWidth / document.body.clientHeight;
    camera.updateProjectionMatrix();
};

// Aggiungo un ascoltatore di eventi di ridimensionamento alla finestra
window.addEventListener('resize', (ev) => {
    resizeCanvas();
});

// Adesso creo la scena dove ci sono tutti gli oggetti e li rendo visibili e creo e posiziono la camera prospettica
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera();
camera.position.set(-3.75, 4, 2.5);

// Adesso creo la scena dove ci sono tutti gli oggetti e li rendo visibili e creo e posiziono la camera prospettica.
const controls = new OrbitControls(camera, canvas);
const clock = new THREE.Clock(); // Aggiungo elemento orologio
const centerPos = new THREE.Vector3(); // Creo un vettore tridimensionale che può essere utilizzato per settare una posizione centrale nella scena

// Loop di animazione che viene richiamato per ogni fotogramma, fa si che le animazioni siano fluide e annulla il movimento a scatti
const draw = () => {
    const delta = clock.getDelta();
    controls.update(delta);
    render.render(scene, camera);
    window.requestAnimationFrame(draw);
};

// Caricare il modello ci mette un sacco di tempo, quindi viene fatto in background, con una Promise queste operazioni di caricamento in background.
const load = () => {
	return new Promise((resolve, reject) => {
		scene.background = new THREE.Color(0.0, 0.0, 0.0);

		console.log("Loading start..."); // Carica il modello
		gltf.loadAsync('target.glb').then(val => {
			console.log("Loading done");

			const positions = [];

			// Visto che i materiali erano tutti bianchi perchè ThreeJS non supporta gli stessi materiali di Blender, esiste questa stringa per trasformare i materiali da Standard Material a Basic Material in modo automatico.
			val.scene.traverse(val => {
				if (val instanceof THREE.Mesh) {
					const mat = val.material;
					const nextMat = new THREE.MeshBasicMaterial();
					nextMat.color = mat.color;
					nextMat.opacity = mat.opacity;
					nextMat.transparent = mat.transparent;
					
					val.material = nextMat;
					
					const pos = val.getWorldPosition(new THREE.Vector3()); 
					positions.push(pos);
				}
			});
			
			// Ti calcola la posizione media di tutto il modello permettendo di centrare la vista sulla media delle posizoni delle mesh
			centerPos.set(0, 0, 0);
			positions.forEach(p => {
				centerPos.add(p);
			});
			centerPos.divideScalar(positions.length);
			controls.target = centerPos.clone();
			
			scene.add(val.scene); // La scena caricata viene aggiunta alla scena principale

		});

		resolve(true);
	});
}

// Qui fa ripartire il load con la promise di prima e gli dice di fare quello che è scritto dopo con il then solo dopo che il load è finito.
window.addEventListener("load", () => {
	resizeCanvas();
	load().then(() => {
		window.requestAnimationFrame(draw);
	})
});

// Aggiungo i piulsanti e li rende accesi quando ci clicco sopra
document.getElementById("btnSatelliti").addEventListener("click", (ev) => {
	const img = ev.target;
	if (img.src.includes("PULSANTE1.png")) {
		img.src = "PULSANTE1ACCESO.png";
	} else {
		img.src = "PULSANTE1.png";
	}
});

document.getElementById("btnPianeti").addEventListener("click", (ev) => {
	const img = ev.target;
	if (img.src.includes("PULSANTE2.png")) {
		img.src = "PULSANTE2ACCESO.png";
	} else {
		img.src = "PULSANTE2.png";
	}
});

document.getElementById("btnStelle").addEventListener("click", (ev) => {
	const img = ev.target;
	if (img.src.includes("PULSANTE3.png")) {
		img.src = "PULSANTE3ACCESO.png";
	} else {
		img.src = "PULSANTE3.png";
	}
});

// Qui mettiamo in moto l'orologio
const orologio = document.getElementById("orologio");

window.setInterval(() => {
	const adesso = new Date();
	orologio.innerText = adesso.getHours().toString().padStart(2, "0") + ":" + adesso.getMinutes().toString().padStart(2, "0") + ":" + adesso.getSeconds().toString().padStart(2, "0");
}, 1000);