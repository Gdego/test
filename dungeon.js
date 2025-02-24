class Dungeon extends Generator {
    constructor(options) {
        // Ensure options is defined and has the necessary properties
        options = Object.assign({}, {
            size: [50, 40],
            rooms: {
                initial: { min_size: [5, 5], max_size: [10, 10], max_exits: 1 },
                any: { min_size: [2, 2], max_size: [5, 5], max_exits: 4 }
            },
            max_corridor_length: 6,
            min_corridor_length: 2,
            corridor_density: 0.5,
            symmetric_rooms: false,
            interconnects: 1,
            max_interconnect_length: 10,
            room_count: 10
        }, options || {});

        super(options);

        this.room_tags = Object.keys(this.options.rooms).filter(tag => (tag !== 'any' && tag !== 'initial'));

        for (let i = this.room_tags.length; i < this.options.room_count; i++) {
            this.room_tags.push('any');
        }

        this.rooms = [];
        this.corridors = [];
    }

    get_center_pos() {
        return [Math.floor(this.options.size[0] / 2), Math.floor(this.options.size[1] / 2)];
    }

    add_room(room, exit, add_to_room = null) {
        let g_add_to_room = add_to_room;
        let choices, old_room, i = 0;
        while (true) {
            if (add_to_room) {
                old_room = add_to_room;
                add_to_room = null;
            } else {
                choices = this.get_open_pieces(this.children);
                if (choices && choices.length) {
                    old_room = this.random.choose(choices);
                } else {
                    console.log('ran out of choices connecting');
                    break;
                }
            }

            if (exit) {
                if (this.join(old_room, exit, room)) {
                    return true;
                }
            } else {
                let perim = room.perimeter.slice();
                while (perim.length) {
                    if (this.join(old_room, this.random.choose(perim, true), room)) {
                        return true;
                    }
                }
            }

            if (i++ === 100) {
                console.log('failed to connect 100 times :(', room, exit, g_add_to_room);
                return false;
            }
        }
    }

    new_corridor() {
        return new Corridor({
            length: this.random.int(this.options.min_corridor_length, this.options.max_corridor_length),
            facing: this.random.choose(FACING)
        });
    }

    add_interconnect() {
        let perims = {}, hash, exit, p;

        this.children.forEach(child => {
            if (child.exits.length < child.max_exits) {
                child.perimeter.forEach(exit => {
                    p = shift([child.position[0] + exit[0], child.position[1] + exit[1]], exit[1]);
                    hash = `${p[0]}_${p[1]}`;
                    perims[hash] = [exit, child];
                });
            }
        });

        let room, mod, length, corridor, room2;
        for (let i = this.children.length - 1; i >= 0; i--) {
            room = this.children[i];

            if (room.exits.length < room.max_exits) {
                for (let k = 0; k < room.perimeter.length; k++) {
                    exit = room.perimeter[k];
                    p = shift([room.position[0] + exit[0], room.position[1] + exit[1]], exit[1]);
                    length = -1;

                    while (length <= this.options.max_interconnect_length) {
                        if (!this.walls.has(`${p[0]}_${p[1]}`) ||
                            !this.walls.has(`${shift_left(p, exit[1])[0]}_${shift_left(p, exit[1])[1]}`) ||
                            !this.walls.has(`${shift_right(p, exit[1])[0]}_${shift_right(p, exit[1])[1]}`)) {
                            break;
                        }
                        hash = `${p[0]}_${p[1]}`;

                        if (perims[hash] && perims[hash][1].id !== room.id) {
                            room2 = perims[hash][1];

                            if (length > -1) {
                                corridor = new Corridor({
                                    length,
                                    facing: exit[1]
                                });

                                if (this.join(room, corridor.perimeter[0], corridor, exit)) {
                                    this.join_exits(room2, perims[hash][0], corridor, corridor.perimeter[corridor.perimeter.length - 1]);
                                    return true;
                                } else {
                                    return false;
                                }
                            } else {
                                this.join_exits(room2, perims[hash][0], room, exit);
                                return true;
                            }
                        }

                        p = shift(p, exit[1]);
                        length++;
                    }
                }
            }
        }
    }

    new_room(key) {
        key = key || this.random.choose(this.room_tags, false);

        let opts = this.options.rooms[key];

        let room = new Room({
            size: this.random.vec(opts.min_size, opts.max_size),
            max_exits: opts.max_exits,
            symmetric: this.options.symmetric_rooms,
            tag: key
        });

        this.room_tags.splice(this.room_tags.indexOf(key), 1);

        if (key === 'initial') {
            this.initial_room = room;
        }
        return room;
    }

    generate() {
        let no_rooms = this.options.room_count - 1;
        let room = this.new_room(this.options.rooms.initial ? 'initial' : undefined);
        let no_corridors = Math.round(this.options.corridor_density * no_rooms);

        this.add_piece(room, this.get_center_pos());

        while (no_corridors || no_rooms) {
            let k = this.random.int(1, no_rooms + no_corridors);
            if (k <= no_corridors) {
                let corridor = this.new_corridor();
                let added = this.add_room(corridor, corridor.perimeter[0]);
                no_corridors--;

                if (no_rooms > 0 && added) {
                    this.add_room(this.new_room(), null, corridor);
                    no_rooms--;
                }
            } else {
                this.add_room(this.new_room());
                no_rooms--;
            }
        }

        for (let k = 0; k < this.options.interconnects; k++) {
            this.add_interconnect();
        }

        this.trim();

        if (this.initial_room) {
            this.start_pos = this.initial_room.get_center_pos();
        }
    }
}