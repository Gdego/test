class Room {
    constructor(options) {
        this.size = options.size;
        this.max_exits = options.max_exits;
        this.symmetric = options.symmetric;
        this.tag = options.tag;
        this.perimeter = this.generate_perimeter();
        this.exits = [];
    }

    generate_perimeter() {
        // Logic to generate the perimeter of the room
        const perimeter = [];
        for (let x = 0; x < this.size[0]; x++) {
            perimeter.push([x, 0], [x, this.size[1] - 1]);
        }
        for (let y = 1; y < this.size[1] - 1; y++) {
            perimeter.push([0, y], [this.size[0] - 1, y]);
        }
        return perimeter;
    }

    get_center_pos() {
        return [Math.floor(this.size[0] / 2), Math.floor(this.size[1] / 2)];
    }
}