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

    get_center_pos() {
        return [Math.floor(this.width / 2), Math.floor(this.height / 2)];
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
        // Implementation for generateGate
    }

    clearFront(grid, gate) {
        // Implementation for clearFront
    }

    connectGates(grid) {
        // Implementation for connectGates
    }
}