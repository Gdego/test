function shift_left(pos, facing) {
    // Logic to shift left
    return [pos[0] - 1, pos[1]];
}

function shift_right(pos, facing) {
    // Logic to shift right
    return [pos[0] + 1, pos[1]];
}

function shift(pos, facing) {
    // Logic to shift
    switch (facing) {
        case 'north':
            return [pos[0], pos[1] - 1];
        case 'south':
            return [pos[0], pos[1] + 1];
        case 'east':
            return [pos[0] + 1, pos[1]];
        case 'west':
            return [pos[0] - 1, pos[1]];
    }
}