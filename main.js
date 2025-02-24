document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("dungeonCanvas");
    const ctx = canvas.getContext("2d");
    const generateButton = document.getElementById("generateDungeon");

    generateButton.addEventListener("click", () => {
        const width = parseInt(document.getElementById("width").value);
        const height = parseInt(document.getElementById("height").value);
        const numRooms = parseInt(document.getElementById("numRooms").value);

        const dungeon = new Dungeon({
            size: [width, height],
            room_count: numRooms
        });
        dungeon.generate();
        drawDungeon(dungeon, ctx);
    });
});

function drawDungeon(dungeon, ctx) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Logic to draw the dungeon on the canvas
    dungeon.children.forEach(piece => {
        const [x, y] = piece.position;
        ctx.fillStyle = 'black';
        piece.perimeter.forEach(([px, py]) => {
            ctx.fillRect((x + px) * 10, (y + py) * 10, 10, 10);
        });
    });
}