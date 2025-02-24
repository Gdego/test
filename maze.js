class Room {
	constructor(x = 0, y = 0) {
		this.x = x; // Position X de la room dans le donjon
		this.y = y; // Position Y de la room dans le donjon
		this.width = Math.floor(Math.random() * 5) + 7; // Largeur aléatoire entre 7 et 11
		this.height = Math.floor(Math.random() * 5) + 7; // Hauteur aléatoire entre 7 et 11
		this.gates = []; // Initialisation des gates

		// Génération de la structure AVANT d'appeler connectGates
		this.grid = this.generateStructure();
		
		if (!this.grid || this.grid.length === 0) {
			console.error("🚨 ERREUR : grid est undefined ou vide à l'initialisation d'une Room !");
			return;
		}

		console.log("✅ Room initialisée avec une grid :", this.grid);

		// Maintenant que la grid est bien définie, on peut connecter les gates
		this.connectGates(this.grid);
	}

    addGate(x, y, side, type = "exit") {
        let gate = { x, y, side, type };
        this.gates.push(gate);
        return gate;
    }

    generateStructure() {
         let grid = new Array(this.height).fill(null).map(() => new Array(this.width).fill("path"));
        console.log("🛠️ Structure de la room générée :", grid);

        // Ajouter les murs autour de la room
        for (let x = 0; x < this.width; x++) {
            grid[0][x] = "wall";
            grid[this.height - 1][x] = "wall";
        }
        for (let y = 0; y < this.height; y++) {
            grid[y][0] = "wall";
            grid[y][this.width - 1] = "wall";
        }

        // Générer une entrée unique
        let availableSides = ["top", "bottom", "left", "right"];
        let enterSide = availableSides.splice(Math.floor(Math.random() * availableSides.length), 1)[0];
        let enterPos = this.generateGate(grid, enterSide, "enter");

       // Générer entre 0 et 3 sorties sur des bordures non utilisées
        let exitCount = Math.floor(Math.random() * 4);
        for (let i = 0; i < exitCount && availableSides.length > 0; i++) {
            let exitSide = availableSides.splice(Math.floor(Math.random() * availableSides.length), 1)[0];
            this.generateGate(grid, exitSide, "exit");
        }

        // Ajouter des obstacles aléatoires
        for (let i = 0; i < Math.floor((this.width * this.height) / 6); i++) {
            let randX = Math.floor(Math.random() * (this.width - 2)) + 1;
            let randY = Math.floor(Math.random() * (this.height - 2)) + 1;
            if (grid[randY][randX] === "path") {
                grid[randY][randX] = "obstacle";
            }
        }

        // Nettoyer les zones devant les gates
        this.gates.forEach(gate => this.clearFront(grid, gate));

        
        return grid;
    }
	
	generateGate(grid, side, type) {
		let x, y, x2, y2;

		if (side === "top") {
			x = Math.floor(Math.random() * (this.width - 3)) + 1;
			y = 0;
			x2 = x + 1; y2 = y; // Deux cases collées horizontalement
		} 
		else if (side === "bottom") {
			x = Math.floor(Math.random() * (this.width - 3)) + 1;
			y = this.height - 1;
			x2 = x + 1; y2 = y;
		} 
		else if (side === "left") {
			x = 0;
			y = Math.floor(Math.random() * (this.height - 3)) + 1;
			x2 = x; y2 = y + 1; // Deux cases collées verticalement
		} 
		else if (side === "right") {
			x = this.width - 1;
			y = Math.floor(Math.random() * (this.height - 3)) + 1;
			x2 = x; y2 = y + 1;
		}

		// Vérification avant placement pour éviter de casser la structure
		if (grid[y][x] === "wall" && grid[y2][x2] === "wall") {
			grid[y][x] = type;
			grid[y2][x2] = type;
			this.gates.push({ x, y, side });
			return { x, y };
		}

		return this.generateGate(grid, side, type); // Relancer si la position est mauvaise
	}



    getRandomBorderPosition(side) {
        let pos;
        switch (side) {
            case 0: pos = { x: Math.floor(Math.random() * (this.width - 3)) + 1, y: 0 }; break;
            case 1: pos = { x: Math.floor(Math.random() * (this.width - 3)) + 1, y: this.height - 1 }; break;
            case 2: pos = { x: 0, y: Math.floor(Math.random() * (this.height - 3)) + 1 }; break;
            case 3: pos = { x: this.width - 2, y: Math.floor(Math.random() * (this.height - 3)) + 1 }; break;
        }
        return pos;
    }

	clearFront(grid, gate) {
        let { x, y, side } = gate;
        if (side === "top") grid[y + 1][x] = grid[y + 1][x + 1] = "path";
        else if (side === "bottom") grid[y - 1][x] = grid[y - 1][x + 1] = "path";
        else if (side === "left") grid[y][x + 1] = "path";
        else if (side === "right") grid[y][x - 1] = "path";
    }

    generateNaturalPath(grid, start, end) {
		let x = start.x, y = start.y;
		let targetX = end.x, targetY = end.y;

		while (x !== targetX || y !== targetY) {
			if (x < targetX) x++;
			else if (x > targetX) x--;
			else if (y < targetY) y++;
			else if (y > targetY) y--;

			if (grid[y][x] === "wall") {
				grid[y][x] = "path"; // Ouvre un passage si c'est un mur
			} else if (grid[y][x] === "path" || grid[y][x] === "obstacle") {
				grid[y][x] = "debug"; // Marque le chemin
			}
		}
	}

	connectGates(grid) {
		 console.log("🔗 Connexion des gates...");
		if (this.gates.length < 2) return; // Pas besoin de connecter s'il n'y a pas assez de gates

		let startGate = this.gates[0]; // Toujours relier à la première gate (enter)
		
		for (let i = 1; i < this.gates.length; i++) {
			let endGate = this.gates[i];
			this.generateDebugPaths(grid);
		}
	}
	unlockGate(gate) {
		// Vérifie que this.grid existe
		if (!this.grid || !this.grid.length || !this.grid[0].length) {
			console.error("❌ ERREUR: this.grid est undefined !");
			return;
		}

		// Vérifie que la gate est bien dans les limites
		if (gate.y < 0 || gate.y >= this.grid.length || gate.x < 0 || gate.x >= this.grid[0].length) {
			console.error(`🚨 Gate hors des limites: (${gate.x}, ${gate.y})`);
			return;
		}

		console.log(`🔓 Déblocage de la gate en (${gate.x}, ${gate.y})`);
		this.grid[gate.y][gate.x] = "path";
	}

	isGateAccessible(gate) {
		// Vérifie si la grille est définie
		if (!this.grid || !this.grid.length || !this.grid[0].length) {
			console.error("❌ ERREUR: this.grid est undefined !");
			return false;
		}

		// Vérifie si la gate est dans les limites de la grille
		if (gate.x < 0 || gate.y < 0 || gate.y >= this.grid.length || gate.x >= this.grid[0].length) {
			return false;
		}

		// Vérifie si la case est un mur
		return this.grid[gate.y][gate.x] !== "wall";
	}

	roomsOverlap(roomA, roomB) {
        return !(
            roomA.x + roomA.width < roomB.x ||
            roomB.x + roomB.width < roomA.x ||
            roomA.y + roomA.height < roomB.y ||
            roomB.y + roomB.height < roomA.y
        );
    }
	getGates() {
		if (!this.grid) {
			console.error("Erreur : this.grid est undefined dans getGates !");
			return [];
		}
		let gates = [];
		for (let y = 0; y < this.grid.length; y++) {
			for (let x = 0; x < this.grid[y].length; x++) {
				if (this.grid[y][x] === "exit" || this.grid[y][x] === "enter") {
					gates.push({ x, y, type: this.grid[y][x] });
				}
			}
		}
		console.log("Gates trouvées :", gates);
		return gates;
	}
	detectSide(exitGate) {
		if (!exitGate) return null;
		if (exitGate.x === 0) return "left";
		if (exitGate.y === 0) return "top";
		if (exitGate.x === this.gridWidth - 1) return "right";
		if (exitGate.y === this.gridHeight - 1) return "bottom";
		return null; 
	}


	generateDebugPaths(grid) { 
		console.log("🔵 Début de la génération des chemins debug");

		if (!grid || grid.length === 0 || !grid[0]) {
			console.error("🚨 ERREUR : grid est undefined ou vide dans generateDebugPaths !");
			return;
		}

		if (!this.gates || this.gates.length === 0) {
			console.error("🚨 ERREUR : Aucune gate détectée dans generateDebugPaths !");
			return;
		}

		if (this.gates.length < 2) {
			console.log("⚠️ Pas assez de gates pour générer un chemin.");
			return;
		}

		let center = { x: Math.floor(grid[0].length / 2), y: Math.floor(grid.length / 2) };
		console.log(`🎯 Centre de la room défini à (${center.x},${center.y})`);

		for (let gate of this.gates) {
			console.log(`🚪 Génération du chemin depuis la gate (${gate.x},${gate.y})`);

			let pathToCenter = this.bfs(grid, { x: gate.x, y: gate.y }, center);
			if (pathToCenter) {
				console.log(`🛤️ Chemin trouvé de ${gate.x},${gate.y} vers le centre`);
				this.applyPath(grid, pathToCenter);
			} else {
				console.warn(`⚠️ Aucun chemin trouvé depuis (${gate.x},${gate.y})`);
			}
		}

		console.log("✅ Chemins debug générés !");
	}

	bfs(grid, start, end) {
		let queue = [{ x: start.x, y: start.y, path: [] }];
		let visited = new Set();
		visited.add(`${start.x},${start.y}`);

		let directions = [
			{ x: 1, y: 0 }, { x: -1, y: 0 },
			{ x: 0, y: 1 }, { x: 0, y: -1 }
		];

		while (queue.length > 0) {
			let { x, y, path } = queue.shift();

			if (x === end.x && y === end.y) {
				console.log(`✅ Chemin trouvé vers (${x},${y})`);
				return path;
			}

			for (let dir of directions) {
				let nx = x + dir.x, ny = y + dir.y;
				let key = `${nx},${ny}`;

				if (nx >= 0 && ny >= 0 && ny < grid.length && nx < grid[0].length &&
					grid[ny][nx] !== "wall" && !visited.has(key)) {
					visited.add(key);
					queue.push({ x: nx, y: ny, path: [...path, { x: nx, y: ny }] });
				}
			}
		}

		console.log(`❌ Aucun chemin trouvé entre (${start.x},${start.y}) et (${end.x},${end.y})`);
		return null;
	}

	applyPath(grid, path) {
		for (let { x, y } of path) {
			if (grid[y][x] === "path" || grid[y][x] === "obstacle") {
				console.log(`🔵 Marquage debug en (${x},${y})`);
				grid[y][x] = "debug";
			}
		}
	}

}

class Game {
    constructor() {
        this.rooms = [];
        this.startRoom = new Room("Start_Room", this.createStartRoomGrid(), { x: 10, y: 10 });

        console.log("startRoom créé:", this.startRoom); // Vérifier si `grid` est bien défini
        console.log("Grille de startRoom:", this.startRoom.grid); // Afficher le contenu de `grid`

        this.rooms.push(this.startRoom);
    }

    createStartRoomGrid() {
		const grid = [
			["wall", "wall", "wall", "wall", "exit", "exit", "wall", "wall", "wall", "wall"],
			["wall", "path", "path", "path", "path", "path", "path", "path", "path", "wall"],
			["wall", "path", "path", "path", "path", "path", "path", "path", "path", "wall"],
			["wall", "path", "path", "path", "path", "path", "path", "path", "path", "wall"],
			["wall", "exit", "path", "path", "path", "path", "path", "path", "exit", "wall"],
			["wall", "exit", "path", "path", "path", "path", "path", "path", "exit", "wall"],
			["wall", "path", "path", "path", "path", "path", "path", "path", "path", "wall"],
			["wall", "path", "path", "path", "path", "path", "path", "path", "path", "wall"],
			["wall", "wall", "wall", "wall", "exit", "exit", "wall", "wall", "wall", "wall"],
		];
		console.log("Grille générée :", grid);
		return grid;
	}
	generateRandomRoom(enterGate) {
		console.log("🎲 Génération d'une nouvelle room avec une gate à :", enterGate);
		// Génération basique d'une room temporaire (à remplacer par ta logique)
		let room = new Room();
		room.gates.push(enterGate);
		return room;
	}

	generateRoomAtExit(exitGate) {
		console.log("🔹 Génération d'une nouvelle room à partir de l'exit :", exitGate);

		if (!exitGate || typeof exitGate.x === "undefined" || typeof exitGate.y === "undefined") {
			console.error("🚨 Erreur : exitGate invalide ou coordonnées manquantes :", exitGate);
			return;
		}

		if (!exitGate.side) {
			let correctedSide = this.detectSide(exitGate);
			if (correctedSide) {
				exitGate.side = correctedSide;
				console.warn("⚠️ Correction automatique : side défini comme", correctedSide);
			} else {
				return;
			}
		}

		if (!this.rooms) {
			console.warn("⚠️ Liste des rooms inexistante, création...");
			this.rooms = [];
		}

		let enterGate = { x: exitGate.x, y: exitGate.y, side: exitGate.side };
		let newRoom = this.generateRandomRoom(enterGate);

		let repositionAttempts = 0;
		const maxAttempts = 4;
		const directions = ["top", "bottom", "left", "right"];
		let directionIndex = directions.indexOf(exitGate.side);

		while (this.rooms.some(room => this.isOverlapping(room, newRoom)) && repositionAttempts < maxAttempts) {
			console.warn("⚠️ Overlap détecté ! Tentative de repositionnement...");

			switch (directions[directionIndex]) {
				case "top":
					newRoom.y -= newRoom.height;
					break;
				case "bottom":
					newRoom.y += newRoom.height;
					break;
				case "left":
					newRoom.x -= newRoom.width;
					break;
				case "right":
					newRoom.x += newRoom.width;
					break;
			}

			console.log(`📍 Tentative #${repositionAttempts + 1} de repositionnement :`, { x: newRoom.x, y: newRoom.y });

			if (++directionIndex >= directions.length) {
				directionIndex = 0;
			}

			repositionAttempts++;
		}

		if (this.rooms.some(room => this.isOverlapping(room, newRoom))) {
			console.warn("❌ Impossible de placer la room sans overlap après plusieurs essais. Annulation.");
			return;
		}

		newRoom.x = Math.max(newRoom.x, 0);
		newRoom.y = Math.max(newRoom.y, 0);
		console.log("📍 Position finale ajustée :", { x: newRoom.x, y: newRoom.y });

		this.rooms.push(newRoom);
		console.log("✅ Room générée avec succès !");
	}

	isOverlapping(roomA, roomB) {
		return !(
			roomA.x + roomA.width <= roomB.x ||  
			roomB.x + roomB.width <= roomA.x ||  
			roomA.y + roomA.height <= roomB.y || 
			roomB.y + roomB.height <= roomA.y    
		);
	}


	detectSide(gate) {
		if (gate.y === 0) return "top";
		if (gate.x === 0) return "left";
		if (gate.x === this.gridWidth - 1) return "right";
		if (gate.y === this.gridHeight - 1) return "bottom";
		return null;
	}

	roomsOverlap(roomA, roomB) {
		console.log("🔄 Vérification du chevauchement entre", roomA, "et", roomB);

		return !(
			roomA.x + roomA.width <= roomB.x ||  // roomA est complètement à gauche de roomB
			roomA.x >= roomB.x + roomB.width ||  // roomA est complètement à droite de roomB
			roomA.y + roomA.height <= roomB.y || // roomA est complètement au-dessus de roomB
			roomA.y >= roomB.y + roomB.height    // roomA est complètement en dessous de roomB
		);
	}

	isRoomValid(room) {
        console.log("🔍 Vérification de la room :", room);
        // Vérifier qu'elle ne se superpose pas à une autre
        for (let existingRoom of this.rooms) {
            if (this.roomsOverlap(existingRoom, room)) {
                console.log("⚠️ Overlap détecté !");
                return false;
            }
        }
        return true;
    }
    generateDungeon() {
		console.log("🚀 Début de la génération du donjon...");

		// 🔹 Création de la salle de départ
		let startRoom = new Room("Start_Room", 10, 10);
		this.rooms = [startRoom];

		// 🔹 Récupération des gates exit de la Start_Room
		let exits = startRoom.getGates("exit") || [];
		console.log("🚪 Gates exit trouvées :", exits);

		if (exits.length === 0) {
			console.warn("⚠️ Aucune gate exit trouvée dans la Start_Room !");
			return;
		}

		// 🔹 Récupération des gates exit de toutes les rooms après création de la startRoom
		let exitGates = this.rooms.flatMap(room => room.gates.filter(g => g.type === "exit"));
		console.log("🔍 Debug: exitGates après mise à jour", exitGates);

		// 🔹 Génération des nouvelles rooms à partir des exits
		exits.forEach(exitGate => {
			if (typeof this.generateRoomAtExit === "function") {
				this.generateRoomAtExit(exitGate);
			} else {
				console.error("❌ ERREUR : generateRoomAtExit() n'est pas définie !");
			}
		});

		console.log("🏰 Donjon généré avec", this.rooms.length, "rooms.");

		// 🔹 Vérification avant d'appeler drawDungeon()
		if (typeof this.drawDungeon === "function") {
			this.drawDungeon(); // Dessiner le donjon après la génération
		} else {
			console.warn("⚠️ drawDungeon() non définie, affichage impossible.");
		}
	}


	drawDungeon() { 
		console.log("🖌️ Dessin du donjon sur le canvas...");
		const canvas = document.getElementById("dungeonCanvas");
		if (!canvas) {
			console.error("⚠️ Canvas 'dungeonCanvas' introuvable !");
			return;
		}
		const ctx = canvas.getContext("2d");
		ctx.clearRect(0, 0, canvas.width, canvas.height); // Effacer l'ancien rendu

		const cellSize = 30; // Taille des cellules
		console.log("📜 Contenu de this.rooms :", this.rooms);

		this.rooms.forEach((room, index) => {
			console.log(`🏠 Room ${index} - Position: (${room.x}, ${room.y}), Taille: ${room.grid.length}x${room.grid[0].length}`);
			const { x, y, grid } = room;
			if (room.x === undefined || room.y === undefined) {
				console.error(`🚨 ERREUR : Room ${index} a une position indéfinie !`);
			}
			grid.forEach((row, rowIndex) => {
				row.forEach((cell, colIndex) => {
					let color = "white"; // Par défaut, une case vide

					if (cell === "wall") color = "black";
					if (cell === "path") color = "lightblue";
					if (cell === "exit") color = "red";
					if (cell === "enter") color = "green";

					ctx.fillStyle = color;
					ctx.fillRect((x + colIndex) * cellSize, (y + rowIndex) * cellSize, cellSize, cellSize);
					ctx.strokeStyle = "gray";
					ctx.strokeRect((x + colIndex) * cellSize, (y + rowIndex) * cellSize, cellSize, cellSize);
				});
			});
		});

		console.log("✅ Donjon dessiné !");
	}


}
function drawRoom(grid, canvasId) {
    if (!grid || grid.length === 0 || !grid[0]) {
        console.error("🚨 ERREUR : grid est undefined ou vide dans drawRoom !");
        return;
    }

    let canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error("🚨 ERREUR : Canvas introuvable !");
        return;
    }

    let ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let cellSize = 20;
    for (let y = 0; y < grid.length; y++) {
        for (let x = 0; x < grid[0].length; x++) {
            switch (grid[y][x]) {
                case "wall": ctx.fillStyle = "black"; break;
                case "path": ctx.fillStyle = "white"; break;
                case "enter": ctx.fillStyle = "green"; break;
                case "exit": ctx.fillStyle = "red"; break;
                case "obstacle": ctx.fillStyle = "gray"; break;
                case "debug": ctx.fillStyle = "blue"; break;
            }
            ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
    }
}

// Création du jeu
const game = new Game();

// Exécuter le code après le chargement du DOM
document.addEventListener("DOMContentLoaded", () => {
    console.log("📢 DOM chargé, initialisation du jeu...");
    
    // Vérification du canvas
    const canvas = document.getElementById("dungeonCanvas");
    if (!canvas) {
        console.error("🚨 ERREUR : Le canvas 'dungeonCanvas' est manquant dans le HTML !");
    } else {
        console.log("🟢 Canvas trouvé !");
    }

    // Liaison du bouton de génération
    const btn = document.getElementById("generateDungeon");
    if (!btn) {
        console.error("🚨 ERREUR : Bouton 'generateDungeon' introuvable !");
    } else {
        btn.addEventListener("click", () => {
            console.log("🎲 Bouton 'generateDungeon' cliqué, génération en cours...");
            game.generateDungeon();
        });
    }

    // Génération d'une room pour test
    let room = new Room();
    console.log("🛠️ Room générée :", room);
    console.log("📐 Grid de la room :", room.grid);

    if (!room.grid || room.grid.length === 0 || !room.grid[0]) {
        console.error("🚨 ERREUR : La grille est invalide avant drawRoom !");
    } else {
        drawRoom(room.grid, "dungeonCanvas");
    }
});

// Fonction pour dessiner le donjon
Game.prototype.drawDungeon = function () { 
    console.log("🖌️ Dessin du donjon sur le canvas...");
    const canvas = document.getElementById("dungeonCanvas");
    
    if (!canvas) {
        console.error("⚠️ Canvas 'dungeonCanvas' introuvable !");
        return;
    }
    
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Effacer l'ancien rendu

    const cellSize = 30; // Taille des cellules
    console.log("📜 Contenu de this.rooms :", this.rooms);

    if (!this.rooms || this.rooms.length === 0) {
        console.warn("⚠️ Aucune room à dessiner !");
        return;
    }

    this.rooms.forEach((room, index) => {
        // Vérification des coordonnées
        const x = room.x ?? 0; // Remplace undefined par 0
        const y = room.y ?? 0; // Idem
        
        console.log(`🏠 Room ${index} - Position: (${x}, ${y}), Taille: ${room.grid.length}x${room.grid[0]?.length || "???"}`);

        if (room.x === undefined || room.y === undefined) {
            console.error(`🚨 ERREUR : Room ${index} a une position indéfinie !`);
        }

        if (!room.grid || room.grid.length === 0 || !room.grid[0]) {
            console.error(`🚨 ERREUR : La grille de la Room ${index} est invalide !`);
            return;
        }

        room.grid.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                let color = "white"; // Par défaut, une case vide

                if (cell === "wall") color = "black";
                if (cell === "path") color = "lightblue";
                if (cell === "exit") color = "red";
                if (cell === "enter") color = "green";

                ctx.fillStyle = color;
                ctx.fillRect((x + colIndex) * cellSize, (y + rowIndex) * cellSize, cellSize, cellSize);
                ctx.strokeStyle = "gray";
                ctx.strokeRect((x + colIndex) * cellSize, (y + rowIndex) * cellSize, cellSize, cellSize);
            });
        });
    });

    console.log("✅ Donjon dessiné !");
};
