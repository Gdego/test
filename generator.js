class Generator {
    constructor(options) {
        this.options = options || {};
        this.children = [];
        this.walls = new Map();
    }

    add_piece(piece, position) {
        piece.position = position;
        this.children.push(piece);
        this.update_walls(piece);
    }

    get_open_pieces(children) {
        return children.filter(child => child.exits.length < child.max_exits);
    }

    join(old_room, exit, room) {
        const [x, y] = old_room.position;
        const [ex, ey] = exit;
        const [rx, ry] = room.get_center_pos();
        
        if (this.valid_position(x + ex, y + ey, room)) {
            room.position = [x + ex - rx, y + ey - ry];
            old_room.exits.push(exit);
            room.exits.push([rx, ry]);
            this.add_piece(room, room.position);
            return true;
        }
        return false;
    }

    join_exits(room1, exit1, room2, exit2) {
        room1.exits.push(exit1);
        room2.exits.push(exit2);
    }

    trim() {
        this.children = this.children.filter(child => child.exits.length > 0);
    }

    update_walls(piece) {
        piece.perimeter.forEach(([x, y]) => {
            const pos = [x + piece.position[0], y + piece.position[1]];
            this.walls.set(`${pos[0]}_${pos[1]}`, true);
        });
    }

    valid_position(x, y, room) {
        return !this.walls.has(`${x}_${y}`);
    }

    random = {
        int: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
        choose: (arr, remove = true) => {
            let index = Math.floor(Math.random() * arr.length);
            let item = arr[index];
            if (remove) arr.splice(index, 1);
            return item;
        },
        vec: (min, max) => [this.random.int(min[0], max[0]), this.random.int(min[1], max[1])]
    };
}