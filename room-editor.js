let rooms = {};              // Stocke les rooms créées
let roomKeys = [];           // Liste des noms des rooms
let currentRoomIndex = 0;    // Index de la room en cours d'édition
let currentType = 'wall';    // Type de case sélectionné
let deleteMode = false;      // Mode suppression activé/désactivé
let storedRooms = {
    noExit: [],  // Stocke les rooms sans exit
    withExit: [] // Stocke les rooms avec exit
};
let randomRoomNoExitCount = 0;
let randomRoomExitCount = 0;

// Définit le type de case à placer
function setCurrentType(type) {
    currentType = type;
    deleteMode = false;  // Désactive le mode suppression quand on choisit un type
}

// Active le mode suppression
function enableDeleteMode() {
    deleteMode = true;
}
function exportRooms() {
    console.log("Debug: storedRooms avant exportation :", storedRooms); // 🔍 Debug
    
    if (storedRooms.noExit.length === 0 && storedRooms.withExit.length === 0) {
        alert("Aucune room à exporter !");
        return;
    }

    let exportData = JSON.stringify(storedRooms, null, 2);
    let blob = new Blob([exportData], { type: "application/json" });
    let a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "rooms.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    alert("Exportation réussie !");
}


function importRooms() {
    document.getElementById("import-file").click();
}

function loadImportedRooms(event) {
    let file = event.target.files[0];
    if (!file) {
        alert("Aucun fichier sélectionné.");
        return;
    }

    let reader = new FileReader();
    reader.onload = function(e) {
        try {
            let importedRooms = JSON.parse(e.target.result);
            
            // Vérifie que les catégories existent bien
            if (importedRooms.noExit && importedRooms.withExit) {
                importedRooms.noExit.forEach(room => {
                    if (room.data) {
                        rooms[room.name] = room.data;
                        storedRooms.noExit.push(room);
                    }
                });

                importedRooms.withExit.forEach(room => {
                    if (room.data) {
                        rooms[room.name] = room.data;
                        storedRooms.withExit.push(room);
                    }
                });

                updateRoomList();
                alert("Importation réussie !");
            } else {
                throw new Error("Format de fichier incorrect.");
            }
        } catch (error) {
            alert("Erreur lors de l'importation : fichier invalide.");
        }
    };
    reader.readAsText(file);
}

function saveCurrentRoom() {
    let roomName = document.getElementById("room-name-input").value.trim();

    if (roomName === "") {
        alert("Veuillez entrer un nom pour la room.");
        return;
    }

    if (rooms[roomName]) {
        if (!confirm(`La room "${roomName}" existe déjà. Voulez-vous l'écraser ?`)) {
            return;
        }
    }

    // Sauvegarde la room actuelle
    let currentRoom = rooms[roomKeys[currentRoomIndex]]; 
    rooms[roomName] = JSON.parse(JSON.stringify(currentRoom)); // Copie profonde

    if (!roomKeys.includes(roomName)) {
        roomKeys.push(roomName); // Ajoute le nom à la liste des rooms si nouveau
    }

    alert(`Room "${roomName}" sauvegardée avec succès !`);
    updateRoomList(); // Met à jour la liste des rooms
}


// Crée une room vide avec des dimensions définies
function createRoom(width, height, name = "Custom_Room") {
    let room = Array.from({ length: height }, () => Array(width).fill('empty'));
    
    // Ajouter une entrée et sortie par défaut
    room[0][4] = 'enter';
    room[0][5] = 'enter';
    room[height - 1][4] = 'exit';
    room[height - 1][5] = 'exit';

    rooms[name] = room;
    updateRoomList();
    drawRoom(room);
}
function deleteCurrentRoom() {
    if (roomKeys.length > 0) {
        let roomName = roomKeys[currentRoomIndex];
        delete rooms[roomName];
        updateRoomList();
        document.getElementById("room-editor").innerHTML = ""; // Efface l'affichage
    }
}


// Dessine la room dans l'éditeur
function drawRoom(room) {
    let roomContainer = document.getElementById("roomContainer"); // Vérifie l'ID correct !
    if (!roomContainer) {
        console.error("❌ ERREUR: L'élément #roomContainer est introuvable !");
        return;
    }
    roomContainer.innerHTML = ""; // On vide l'ancien contenu

    roomContainer.style.display = "grid"; // Ajoute un display grid si besoin
    roomContainer.style.gridTemplateColumns = `repeat(${room[0].length}, 30px)`;

    room.forEach((row, y) => {
        row.forEach((cellType, x) => {
            let cell = document.createElement("div");
            cell.classList.add("cell", cellType);

            if (cellType === "void") {
                cell.style.backgroundColor = "black";
            } else if (cellType === "path") {
                cell.style.backgroundColor = "lightblue";
            }

            cell.onclick = () => modifyCell(x, y);
            roomContainer.appendChild(cell); // ✅ Utilisation correcte
        });
    });
}

// Modifie une case de la room
function modifyCell(x, y) {
    let roomName = roomKeys[currentRoomIndex];

    if (deleteMode) {
        rooms[roomName][y][x] = 'empty';  // Supprime la case
    } else {
        rooms[roomName][y][x] = currentType; // Change la case en type sélectionné
    }
    drawRoom(rooms[roomName]);
}

// Met à jour la liste des rooms disponibles
function updateRoomList() {
    let selector = document.getElementById("room-selector");
    if (!selector) {
        console.error("❌ ERREUR: L'élément #room-selector est introuvable !");
        return;
    }
    if (!rooms || Object.keys(rooms).length === 0) {
        console.warn("⚠️ Aucune room disponible pour la liste.");
        selector.innerHTML = "<option disabled>Aucune room disponible</option>";
        return;
    }

    let roomKeys = Object.keys(rooms);
    selector.innerHTML = roomKeys.map((room, index) => `<option value="${index}">${room}</option>`).join("");
}



// Charge une room sélectionnée
function loadSelectedRoom() {
    currentRoomIndex = parseInt(document.getElementById("room-selector").value);
    drawRoom(rooms[roomKeys[currentRoomIndex]]);
}
// Ajoute les boutons pour sélectionner les types de cases
document.addEventListener("DOMContentLoaded", () => {
    let palette = document.getElementById("palette");
    if (!palette) {
        console.error("❌ ERREUR: L'élément #palette est introuvable !");
        return;
    }
    palette.innerHTML = `
        <button onclick="setCurrentType('empty')" style="background-color: white;">Empty</button>
        <button onclick="setCurrentType('wall')" style="background-color: gray;">Wall</button>
        <button onclick="setCurrentType('exit')" style="background-color: red;">Exit</button>
        <button onclick="setCurrentType('enter')" style="background-color: green;">Enter</button>
        <button onclick="setCurrentType('obstacle')" style="background-color: brown;">Obstacle</button>
        <button onclick="setCurrentType('path')" style="background-color: lightblue;">Path</button>
        <button onclick="setCurrentType('void')" style="background-color: black; color: white;">Void</button>
        <button onclick="enableDeleteMode()" style="background-color: darkred; color: white;">Delete</button>
    `;
});


function clearSurroundingObstacles(room, x, y, width, height, direction) {
    let directions = {
        "up": [[0, 1]],    // Nettoie en dessous
        "down": [[0, -1]], // Nettoie au-dessus
        "left": [[1, 0]],  // Nettoie à droite
        "right": [[-1, 0]] // Nettoie à gauche
    };

    // Supprime les obstacles directement autour
    [[0, 1], [0, -1], [1, 0], [-1, 0]].forEach(([dx, dy]) => {
        let nx = x + dx;
        let ny = y + dy;
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            if (room[ny][nx] === 'obstacle' && room[ny][nx] !== 'locked_path') {
                room[ny][nx] = 'path';
            }
        }
    });

    // Supprime les obstacles devant l'entrée/sortie
    if (direction && directions[direction]) {
        directions[direction].forEach(([dx, dy]) => {
            let nx = x + dx;
            let ny = y + dy;
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
				if (room[ny][nx] === 'obstacle' && room[ny][nx] !== 'locked_path') {
                    room[ny][nx] = 'path';
                }
            }
        });
    }
}
function clearFrontOfEnter(room, x, y, width, height, direction) {
    let dx = 0, dy = 0;

    if (direction === "down") dy = 1;    // Si l'entrée est en haut, on nettoie en bas
    if (direction === "up") dy = -1;     // Si l'entrée est en bas, on nettoie en haut
    if (direction === "right") dx = 1;   // Si l'entrée est à gauche, on nettoie à droite
    if (direction === "left") dx = -1;   // Si l'entrée est à droite, on nettoie à gauche

    for (let i = 0; i < 2; i++) { // Vérifier les 2 cases devant l'`enter`
        let nx = x + dx;
        let ny = y + dy;

        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            if (room[ny][nx] === 'obstacle') {
                room[ny][nx] = 'path'; // 🔥 Supprime l'obstacle devant l'`enter`
            }
        }
    }
}


function findPathAStar(room, start, end, width, height) {
    let openSet = [{ x: start[0], y: start[1], g: 0, h: heuristic(start, end), parent: null }];
    let closedSet = new Set();
    let cameFrom = {};

    while (openSet.length > 0) {
        openSet.sort((a, b) => (a.g + a.h) - (b.g + b.h));
        let current = openSet.shift();
        let { x, y } = current;

        if (x === end[0] && y === end[1]) {
            return reconstructPath(cameFrom, end);
        }

        closedSet.add(`${x},${y}`);

        for (let [dx, dy] of [[0, 1], [1, 0], [0, -1], [-1, 0]]) { // 🔥 Uniquement vertical et horizontal
            let nx = x + dx, ny = y + dy;

            if (nx >= 0 && ny >= 0 && nx < width && ny < height &&
                !closedSet.has(`${nx},${ny}`) &&
                room[ny][nx] !== 'wall' &&
                room[ny][nx] !== 'obstacle') {

                let newG = current.g + 1;
                let existing = openSet.find(n => n.x === nx && n.y === ny);

                if (!existing || newG < existing.g) {
                    cameFrom[`${nx},${ny}`] = [x, y];
                    openSet.push({ x: nx, y: ny, g: newG, h: heuristic([nx, ny], end), parent: current });
                }
            }
        }
    }
    return [];
}

// 📏 Heuristique (distance Manhattan)
function heuristic(a, b) {
    return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
}

// 🔄 Reconstruction du chemin
function reconstructPath(cameFrom, end) {
    let path = [];
    let current = end;
    while (cameFrom[`${current[0]},${current[1]}`]) {
        path.push(current);
        current = cameFrom[`${current[0]},${current[1]}`];
    }
    return path.reverse();
}
function generateOptimizedPaths(room, enterPositions, exitPositions, width, height) {
    let allPaths = [];

    enterPositions.forEach((enter, index) => {
        if (index % 2 === 0) { // Pour éviter la duplication
            exitPositions.forEach(exit => {
                let path = findPathAStar(room, enter, exit, width, height);

                if (path && path.length > 0) {
                    let modifiedPath = randomizePath(room, path);

                    if (modifiedPath && modifiedPath.length > 0) {
                        allPaths.push(modifiedPath);

                        modifiedPath.forEach(([x, y]) => {
                            if (room[y][x] !== 'enter' && room[y][x] !== 'exit') {
                                room[y][x] = 'path';
                            }
                        });
                    }
                }
            });
        }
    });

    console.log("🗺️ Chemins générés :", allPaths);
    return allPaths;
}
function removeUnnecessaryTurns(room, allPaths) {
    let optimizedPaths = [];

    for (let path of allPaths) {
        let newPath = [path[0]]; // Commence avec le premier point du chemin

        for (let i = 1; i < path.length - 1; i++) {
            let [prevX, prevY] = newPath[newPath.length - 1];
            let [currX, currY] = path[i];
            let [nextX, nextY] = path[i + 1];

            // Vérifie si le mouvement change de direction
            let isTurn = (prevX !== currX && currX !== nextX) || (prevY !== currY && currY !== nextY);

            if (isTurn) {
                newPath.push([currX, currY]); // Ajoute uniquement les points de virage
            }
        }

        newPath.push(path[path.length - 1]); // Ajoute la dernière case du chemin
        optimizedPaths.push(newPath);
    }

    // Réinitialiser la room et réappliquer les chemins optimisés
    for (let path of optimizedPaths) {
        for (let [x, y] of path) {
            if (room[y][x] === 'debug' || room[y][x] === 'path') {
                room[y][x] = 'path'; // Assure que les cases restent marquées comme chemin
            }
        }
    }

    return room;
}


function randomizePath(room, path) {
    let newPath = [];
    let lastDirection = null;

    path.forEach(([x, y], index) => {
        if (index > 0) {
            let [prevX, prevY] = path[index - 1];

            let direction = (x - prevX === 0) ? 'V' : 'H'; // 'V' = vertical, 'H' = horizontal

            // ⚠️ Vérifier si on peut éviter un virage
            if (lastDirection && lastDirection !== direction) {
                let [prevPrevX, prevPrevY] = path[index - 2] || [];

                // Si le changement de direction est évitable, on l'annule
                if (prevPrevX !== undefined && prevPrevY !== undefined) {
                    if (prevPrevX === x || prevPrevY === y) {
                        return; // Ignorer ce point pour éviter un tournant inutile
                    }
                }
            }

            lastDirection = direction;
        }

        // ✅ Ne garde que les points nécessaires
        if (!newPath.some(([px, py]) => px === x && py === y)) {
            newPath.push([x, y]);
        }
    });

    return newPath;
}
function removeUnnecessaryTurns(room, allPaths) {
    for (let path of allPaths) {
        for (let i = 1; i < path.length - 1; i++) {
            let [x1, y1] = path[i - 1]; // Position précédente
            let [x2, y2] = path[i];     // Position actuelle
            let [x3, y3] = path[i + 1]; // Position suivante

            // Vérifie si les trois points sont alignés (pas de virage)
            if ((x1 === x2 && x2 === x3) || (y1 === y2 && y2 === y3)) {
                continue; // Pas de virage, on continue
            }

            // Si un virage est détecté, on tente de le rectifier
            if (Math.abs(x1 - x3) <= 1 && Math.abs(y1 - y3) <= 1) {
                room[y2][x2] = 'path'; // Remplace le virage par un sol
            }
        }
    }
    return room;
}



function generateRandomRoom(hasExit) {
    console.log(`🔄 Génération d'une room (${hasExit ? "avec exit" : "sans exit"})...`);

    let width = Math.floor(Math.random() * 6) + 5;  // Largeur entre 5 et 10
    let height = Math.floor(Math.random() * 6) + 5; // Hauteur entre 5 et 10

    let room = Array.from({ length: height }, () => Array(width).fill('path'));

    // Placer les murs autour de la pièce
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (y === 0 || y === height - 1 || x === 0 || x === width - 1) {
                room[y][x] = 'wall';
            }
        }
    }

    // 🔄 Déterminer un mur pour l'entrée
    let enterSide = Math.floor(Math.random() * 4);
    let enterX = 1 + Math.floor(Math.random() * (width - 3));
    let enterY = 1 + Math.floor(Math.random() * (height - 3));

    if (enterSide === 0) enterY = 0; // Haut
    else if (enterSide === 1) enterY = height - 1; // Bas
    else if (enterSide === 2) enterX = 0; // Gauche
    else enterX = width - 1; // Droite

    // 📌 Placer l'`enter`
    room[enterY][enterX] = 'enter';
    let enterPositions = [[enterX, enterY]];

    if (enterSide < 2) { // Haut ou Bas → horizontal
        if (enterX + 1 < width - 1) {
            room[enterY][enterX + 1] = 'enter';
            enterPositions.push([enterX + 1, enterY]);
        }
    } else { // Gauche ou Droite → vertical
        if (enterY + 1 < height - 1) {
            room[enterY + 1][enterX] = 'enter';
            enterPositions.push([enterX, enterY + 1]);
        }
    }

    // 🔥 Nettoyer les obstacles APRÈS avoir placé les `enter`
    clearSurroundingObstacles(room, enterX, enterY, width, height);

    // Placer les exits (si demandé)
    let exitPositions = [];
    if (hasExit) {
        let possibleExitSides = [0, 1, 2, 3].filter(side => side !== enterSide);
        let exitCount = 1 + Math.floor(Math.random() * 2); // 1 ou 2 exits

        for (let i = 0; i < exitCount; i++) {
            if (possibleExitSides.length === 0) break; // Éviter une boucle infinie

            let exitSideIndex = Math.floor(Math.random() * possibleExitSides.length);
            let exitSide = possibleExitSides.splice(exitSideIndex, 1)[0];

            let exitX = 1 + Math.floor(Math.random() * (width - 3));
            let exitY = 1 + Math.floor(Math.random() * (height - 3));

            if (exitSide === 0) exitY = 0; // Haut
            else if (exitSide === 1) exitY = height - 1; // Bas
            else if (exitSide === 2) exitX = 0; // Gauche
            else exitX = width - 1; // Droite

            room[exitY][exitX] = 'exit';
			exitPositions.push([exitX, exitY]);

			if (exitSide < 2) { // Haut ou Bas → horizontal
				if (exitX + 1 < width - 1 && room[exitY][exitX + 1] === 'wall' && exitX + 1 > 0) {
					room[exitY][exitX + 1] = 'exit';
					exitPositions.push([exitX + 1, exitY]);
				} else if (exitX - 1 > 0 && room[exitY][exitX - 1] === 'wall' && exitX - 1 < width - 1) {
					room[exitY][exitX - 1] = 'exit';
					exitPositions.push([exitX - 1, exitY]);
				}
			} else { // Gauche ou Droite → vertical
				if (exitY + 1 < height - 1 && room[exitY + 1][exitX] === 'wall' && exitY + 1 > 0) {
					room[exitY + 1][exitX] = 'exit';
					exitPositions.push([exitX, exitY + 1]);
				} else if (exitY - 1 > 0 && room[exitY - 1][exitX] === 'wall' && exitY - 1 < height - 1) {
					room[exitY - 1][exitX] = 'exit';
					exitPositions.push([exitX, exitY - 1]);
				}
			}
        }
    }
	// 🔄 Générer un chemin optimisé entre `enter` et `exit`
	let allPaths = generateOptimizedPaths(room, enterPositions, exitPositions, width, height);
		console.log("🗺️ Chemins générés :", allPaths);
		console.log("🔵 Enter Positions:", enterPositions);
		console.log("🔴 Exit Positions:", exitPositions);
	
	// 🔄 Marquer visuellement les chemins générés dans la map
	for (let path of allPaths) {
		for (let [x, y] of path) {
			if (room[y][x] === 'path') room[y][x] = 'debug'; // Marque les chemins en 'debug'
		}
	}

	// ✅ Afficher dans la console pour debug
	console.log("📍 Chemins marqués en debug :", allPaths);





    // Générer des obstacles de manière aléatoire
    let obstacleCount = Math.floor((width * height) / 6);
    for (let i = 0; i < obstacleCount; i++) {
        let x, y;
        let attempts = 0;
        do {
            x = Math.floor(Math.random() * (width - 2)) + 1;
            y = Math.floor(Math.random() * (height - 2));
            attempts++;
            if (attempts > 20) break; // Évite les boucles infinies
        } while (room[y][x] !== 'path');

        if (attempts <= 20) {
            room[y][x] = 'obstacle';
        }
    }

    // 🔥 Nettoyer les obstacles APRÈS avoir placé toutes les exits
    clearSurroundingObstacles(room, enterX, enterY, width, height);
    exitPositions.forEach(([x, y]) => clearSurroundingObstacles(room, x, y, width, height));
    enterPositions.forEach(([x, y]) => clearSurroundingObstacles(room, x, y, width, height)); // 🔥 DUPLICATION POUR ENTER

    console.log("✅ Room générée avec succès :", room);
    return room;
}


function ensureExitAccessibility(room, width, height) {
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (room[y][x] === 'exit') {
                clearSurroundingObstacles(room, x, y, width, height);
            }
        }
    }
}

// Vérifier si un chemin existe entre enter et exit
function isValidRoom(room, width, height) {
    let visited = Array.from({ length: height }, () => Array(width).fill(false));
    let queue = [];

    // Trouver la case "enter"
    let hasEnter = false;
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (room[y][x] === 'enter') {
                queue.push([x, y]);
                visited[y][x] = true;
                hasEnter = true;
            }
        }
    }

    if (!hasEnter) {
        console.warn("🚨 Rejet : aucune entrée trouvée !");
        return false;
    }

    // Vérifier qu'un exit est atteignable
    let hasExit = false;
    let directions = [[0,1], [1,0], [0,-1], [-1,0]];

    while (queue.length > 0) {
        let [x, y] = queue.shift();

        for (let [dx, dy] of directions) {
            let nx = x + dx, ny = y + dy;
            if (nx >= 0 && ny >= 0 && nx < width && ny < height && !visited[ny][nx] && room[ny][nx] !== 'wall' && room[ny][nx] !== 'obstacle') {
                visited[ny][nx] = true;
                queue.push([nx, ny]);

                if (room[ny][nx] === 'exit') {
                    hasExit = true;
                }
            }
        }
    }

    if (!hasExit) {
        console.warn("🚨 Rejet : aucun chemin vers une sortie !");
    }

    return hasExit;
}

// Génère un chemin entre deux points
function generatePathBetween(startX, startY, endX, endY, width, height) {
    let path = [];
    let x = startX, y = startY;

    while (y < endY) {
        path.push([x, y]);
        if (x < endX) x++;
        else if (x > endX) x--;
        y++;
    }
    path.push([endX, endY]);

    return path;
}

// Ajoute des obstacles sans bloquer le chemin
function addObstacles(room, path) {
    let height = room.length, width = room[0].length;
    
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            if (Math.random() < 0.2 && !path.some(([px, py]) => px === x && py === y)) {
                room[y][x] = 'obstacle';
            }
        }
    }
}


// Initialisation avec une room par défaut
document.addEventListener("DOMContentLoaded", () => {
    createRoom(10, 10, "Default_Room");
});


// Bouton pour basculer la visibilité
function toggleVisibility(id) {
    let element = document.getElementById(id);
    element.style.display = (element.style.display === "none" || element.style.display === "") ? "block" : "none";
}
function generateMultipleRooms() { 
    let numNoExit = parseInt(document.getElementById("numRoomsNoExit").value);
    let numWithExit = parseInt(document.getElementById("numRoomsWithExit").value);

    storedRooms.noExit = [];
    storedRooms.withExit = [];

    console.log(`🔄 Début de génération : ${numNoExit} rooms sans exit, ${numWithExit} rooms avec exit.`);

    for (let i = 0; i < numNoExit; i++) {
        let attempts = 0;
        let room = null;

        while (!room && attempts < 10) {
            console.log(`🔄 Tentative ${attempts + 1} pour une room sans exit...`);
            room = generateRandomRoom(false);

            if (room) {
                let roomName = `Random_RoomNoExit_${storedRooms.noExit.length + 1}`;
                storedRooms.noExit.push({ name: roomName, data: room });
                console.log(`✅ Room ajoutée : ${roomName}`);
            }
            attempts++;
        }

        if (!room) {
            console.warn(`⚠️ Échec après 10 tentatives de génération d'une room sans exit !`);
        }
    }

    for (let i = 0; i < numWithExit; i++) {
        let attempts = 0;
        let room = null;

        while (!room && attempts < 10) {
            console.log(`🔄 Tentative ${attempts + 1} pour une room avec exit...`);
            room = generateRandomRoom(true);

            if (room) {
                let roomName = `Random_RoomExit_${storedRooms.withExit.length + 1}`;
                storedRooms.withExit.push({ name: roomName, data: room });
                console.log(`✅ Room ajoutée : ${roomName}`);
            }
            attempts++;
        }

        if (!room) {
            console.warn(`⚠️ Échec après 10 tentatives de génération d'une room avec exit !`);
        }
    }

    console.log(`📌 Résumé des rooms stockées :`, storedRooms);
    displayGeneratedRooms();
}



function displayGeneratedRooms() {
    const container = document.getElementById("generated-rooms");
    container.innerHTML = "<h3>Rooms Générées</h3>";

    ["noExit", "withExit"].forEach(type => {
        storedRooms[type].forEach((roomObj, index) => {
            let room = roomObj.data;
            let roomName = roomObj.name;

            let roomDiv = document.createElement("div");
            roomDiv.classList.add("room-container");

            let title = document.createElement("h4");
            title.textContent = `${roomName}`;
            roomDiv.appendChild(title);

            let grid = document.createElement("div");
            grid.style.display = "grid";
            grid.style.gridTemplateColumns = `repeat(${room[0].length}, 30px)`;
            grid.style.marginBottom = "10px";

            room.forEach(row => {
                row.forEach(cellType => {
                    let cell = document.createElement("div");
                    cell.classList.add("cell", cellType);
                    grid.appendChild(cell);
                });
            });

            roomDiv.appendChild(grid);
            container.appendChild(roomDiv);
        });
    });
}

