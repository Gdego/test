class Corridor {
    constructor(options) {
        this.length = options.length;
        this.facing = options.facing;
        this.perimeter = this.generate_perimeter();
        this.exits = [];
        this.max_exits = 2; // Assuming corridors can have at most 2 exits
    }

    generate_perimeter() {
        // Logic to generate the perimeter of the corridor
        const perimeter = [];
        let pos = [0, 0];
        for (let i = 0; i < this.length; i++) {
            pos = shift(pos, this.facing);
            perimeter.push(pos.slice());
        }
        return perimeter;
    }
}