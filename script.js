function moveElement(element, elements, canvas) {
    // Update the element's position
    element.x += element.dx;
    element.y += element.dy;

    // Reflect the element off the edges of the canvas
    if (element.x + (element.radius) > canvas.width || element.x - element.radius < 0) {
        element.dx = -element.dx; // Reflect off the left or right edge
    }
    if (element.y + element.radius > canvas.height || element.y - element.radius < 0) {
        element.dy = -element.dy; // Reflect off the top or bottom edge
    }

    // Reflect the element off other elements
    // Reflect the element off other elements
    for (let other of elements) {
        if (other === element) continue; // Don't collide with itself

        let dx = other.x - element.x;
        let dy = other.y - element.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < element.radius + other.radius) {
            // The elements are colliding
            let angle = Math.atan2(dy, dx);
            let sin = Math.sin(angle);
            let cos = Math.cos(angle);

            // Rotate the element's position
            let pos0 = { x: 0, y: 0 }; // Point to rotate other element around

            // Rotate the other's position
            let pos1 = rotate(dx, dy, sin, cos, true);

            // Rotate the element's velocity
            let vel0 = rotate(element.dx, element.dy, sin, cos, true);

            // Rotate the other's velocity
            let vel1 = rotate(other.dx, other.dy, sin, cos, true);

            // Collision reaction
            let vxTotal = vel0.x - vel1.x;
            vel0.x = ((element.radius - other.radius) * vel0.x + 2 * other.radius * vel1.x) / (element.radius + other.radius);
            vel1.x = vxTotal + vel0.x;

            // Update position - to avoid objects stuck together
            pos0.x += vel0.x;
            pos1.x += vel1.x;

            // Rotate positions back
            let pos0F = rotate(pos0.x, pos0.y, sin, cos, false);
            let pos1F = rotate(pos1.x, pos1.y, sin, cos, false);

            // Adjust positions to actual screen positions
            other.x = element.x + pos1F.x;
            other.y = element.y + pos1F.y;
            element.x = element.x + pos0F.x;
            element.y = element.y + pos0F.y;

            // Rotate velocities back
            let vel0F = rotate(vel0.x, vel0.y, sin, cos, false);
            let vel1F = rotate(vel1.x, vel1.y, sin, cos, false);

            element.dx = vel0F.x;
            element.dy = vel0F.y;
            other.dx = vel1F.x;
            other.dy = vel1F.y;
        }
    }

}

// Create 10 elements with random initial positions and velocities
let elements = [];
let speed = 10; // Change this to the desired speed
let buffer = 10; // Change this to the size of the desired buffer zone

// Calculate the center of the canvas
let centerX = window.innerWidth / 2;
let centerY = window.innerHeight / 2;

// Create 4 sets of 10 elements each
for (let set = 0; set < 4; set++) {
    // Generate a random color for this set of elements
    let color = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`;

    for (let i = 0; i < 30; i++) {
        // Calculate the initial position based on the set number
        let x, y;
        switch (set) {
            case 0: // Top left corner
                x = buffer;
                y = buffer;
                break;
            case 1: // Top right corner
                x = window.innerWidth - buffer;
                y = buffer;
                break;
            case 2: // Bottom left corner
                x = buffer;
                y = window.innerHeight - buffer;
                break;
            case 3: // Bottom right corner
                x = window.innerWidth - buffer;
                y = window.innerHeight - buffer;
                break;
        }

        // Calculate the velocity vector pointing towards the center of the canvas
        let dx = centerX - x;
        let dy = centerY - y;

        // Normalize the velocity vector to have a magnitude of 1
        let magnitude = Math.sqrt(dx * dx + dy * dy);
        dx /= magnitude;
        dy /= magnitude;

        // Multiply the velocity vector by the desired speed
        dx *= speed;
        dy *= speed;

        elements.push({
            x: x,
            y: y,
            dx: dx,
            dy: dy,
            radius: 10,
            color: color
        });
    }
}

function rotate(x, y, sin, cos, reverse) {
    return {
        x: (reverse) ? (x * cos + y * sin) : (x * cos - y * sin),
        y: (reverse) ? (y * cos - x * sin) : (y * cos + x * sin)
    };
}

let canvas = document.getElementById('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

function gameLoop() {
    // Clear the canvas
    let context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Move and draw each element
    for (let element of elements) {
        moveElement(element, elements, canvas);

        context.beginPath();
        context.arc(element.x, element.y, element.radius, 0, Math.PI * 2);
        context.fillStyle = element.color;
        context.fill();
    }

    // Call gameLoop again on the next frame
    requestAnimationFrame(gameLoop);
}

// Start the game loop
gameLoop();