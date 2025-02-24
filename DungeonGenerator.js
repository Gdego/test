class DungeonGenerator {
    constructor(width, height, numRooms, minRoomSize, maxRoomSize) {
        this.width = width;
        this.height = height;
        this.numRooms = numRooms;
        this.minRoomSize = minRoomSize;
        this.maxRoomSize = maxRoomSize;
        this.map = this.createEmptyMap();
        this.rooms = [];
    }

    createEmptyMap() {
        let map = [];
        for (let y = 0; y < this.height; y++) {
            map[y] = [];
            for (let x = 0; x < this.width; x++) {
                map[y][x] = 1; // 1 represents a wall
            }
        }
        return map;
    }

    generateDungeon() {
        this.generateMaze();
        this.placeRooms();
        return this.map;
    }

    generateMaze() {
        const stack = [];
        const visited = [];
        for (let y = 0; y < this.height; y++) {
            visited[y] = [];
            for (let x = 0; x < this.width; x++) {
                visited[y][x] = false;
            }
        }

        const startX = Phaser.Math.Between(1, this.width - 2);
        const startY = Phaser.Math.Between(1, this.height - 2);
        stack.push({ x: startX, y: startY });
        visited[startY][startX] = true;
        this.map[startY][startX] = 0;

        while (stack.length > 0) {
            const current = stack.pop();
            const neighbors = this.getUnvisitedNeighbors(current.x, current.y, visited);

            if (neighbors.length > 0) {
                stack.push(current);

                const randomNeighbor = Phaser.Utils.Array.RemoveRandomElement(neighbors);
                const betweenX = (current.x + randomNeighbor.x) / 2;
                const betweenY = (current.y + randomNeighbor.y) / 2;

                this.map[randomNeighbor.y][randomNeighbor.x] = 0;
                this.map[betweenY][betweenX] = 0;
                visited[randomNeighbor.y][randomNeighbor.x] = true;

                stack.push(randomNeighbor);
            }
        }
    }

    getUnvisitedNeighbors(x, y, visited) {
        const neighbors = [];
        if (x > 1 && !visited[y][x - 2]) neighbors.push({ x: x - 2, y });
        if (x < this.width - 2 && !visited[y][x + 2]) neighbors.push({ x: x + 2, y });
        if (y > 1 && !visited[y - 2][x]) neighbors.push({ x, y: y - 2 });
        if (y < this.height - 2 && !visited[y + 2][x]) neighbors.push({ x, y: y + 2 });
        return neighbors;
    }

    placeRooms() {
        for (let i = 0; i < this.numRooms; i++) {
            const room = this.createRoom();
            if (this.placeRoom(room)) {
                this.rooms.push(room);
            }
        }
        this.connectRooms();
    }

    createRoom() {
        const width = Phaser.Math.Between(this.minRoomSize, this.maxRoomSize);
        const height = Phaser.Math.Between(this.minRoomSize, this.maxRoomSize);
        const x = Phaser.Math.Between(1, this.width - width - 1);
        const y = Phaser.Math.Between(1, this.height - height - 1);
        return { x, y, width, height };
    }

    placeRoom(room) {
        for (let y = room.y; y < room.y + room.height; y++) {
            for (let x = room.x; x < room.x + room.width; x++) {
                if (this.map[y][x] === 0) {
                    return false; // Overlapping maze path
                }
            }
        }
        for (let y = room.y; y < room.y + room.height; y++) {
            for (let x = room.x; x < room.x + room.width; x++) {
                this.map[y][x] = 0; // 0 represents an empty space
            }
        }
        return true;
    }

    connectRooms() {
        for (let i = 1; i < this.rooms.length; i++) {
            const roomA = this.rooms[i - 1];
            const roomB = this.rooms[i];
            const pointA = {
                x: Phaser.Math.Between(roomA.x, roomA.x + roomA.width - 1),
                y: Phaser.Math.Between(roomA.y, roomA.y + roomA.height - 1)
            };
            const pointB = {
                x: Phaser.Math.Between(roomB.x, roomB.x + roomB.width - 1),
                y: Phaser.Math.Between(roomB.y, roomB.y + roomB.height - 1)
            };
            this.createCorridor(pointA, pointB);
        }
    }

    createCorridor(pointA, pointB) {
        let x = pointA.x;
        let y = pointA.y;

        while (x !== pointB.x) {
            this.map[y][x] = 0;
            x += x < pointB.x ? 1 : -1;
        }
        while (y !== pointB.y) {
            this.map[y][x] = 0;
            y += y < pointB.y ? 1 : -1;
        }
    }
}