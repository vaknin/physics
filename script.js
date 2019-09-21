//#region Variables

//#region Canvas
const canvas = document.createElement('canvas');
document.body.appendChild(canvas);
canvas.height = window.innerHeight;
canvas.width = window.innerWidth;
const ctx = canvas.getContext('2d');
//#endregion

const balls = [];
const mousePositions = [];
const gravity = 4;
const ballSize = 5;
let mouseMoveHandler;

//#endregion

//#region Classes

class Point{

    constructor(x, y){
        this.x = x;
        this.y = y;
    }

    distance(x, y){
        return Math.sqrt(Math.pow(this.x - x, 2) + Math.pow(this.y - y, 2));
    }
}

class Ball{

    constructor(position, vector, size){
        this.position = position;
        this.vector = vector;
        this.weight = gravity + size;
        this.r = size;
        this.xFriction = size / 40;
    }

    draw(){

        //#region Movement

        // Friction
        this.vector.y += this.weight; // Y-axis
        this.vector.x > 0 ? this.vector.x -= this.xFriction : this.vector.x += this.xFriction; // X-axis

        // Move
        this.position.y += this.vector.y;
        this.position.x += this.vector.x;

        //#endregion

        //#region Collision

        //#region Walls

        // Bottom
        if (this.position.y + this.r > canvas.height){
            this.position.y = canvas.height - this.r;
            this.vector.y *= -1; // Invert
            this.vector.y += gravity * 3; // Decelerate
        }

        // Top
        if (this.position.y - this.r < 0){
            this.position.y = this.r;
            this.vector.y *= -1; // Invert
            this.vector.y -= gravity * 3; // Decelerate
        }

        // Left
        if (this.position.x - this.r < 0){
            this.position.x = this.r;
            this.vector.x *= -1; // Invert
            this.vector.x -= gravity * 3; // Decelerate
        }

        // Right
        if (this.position.x + this.r > canvas.width){
            this.position.x = canvas.width - this.r;
            this.vector.x *= -1; // Invert
            this.vector.x += gravity * 3; // Decelerate
        }

        //#endregion

        //#endregion

        // Draw
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    }
}

//#endregion

//#region Functions

// Animation loop
function start(){

    ctx.clearRect(0,0,canvas.width,canvas.height);
    for (let b of balls){
        b.draw();
    }
    requestAnimationFrame(start);
}

// Get a random number between a and b
function random(a, b){
    return Math.random() * (Math.max(a,b) - Math.min(a,b)) + Math.min(a,b);
}

//#endregion

//#region Events

// Mouse move event listener
document.addEventListener('mousemove', e => {

    // Get mouse position and add it to the positions array
    let mousePos = new Point(Math.max(ballSize, e.clientX),Math.max(ballSize, e.clientY));
    mousePositions.push(mousePos);

    // Clear the positions after a sec
    clearTimeout(mouseMoveHandler);
    mouseMoveHandler = setTimeout(() => {
        mousePositions.length = 0;
    }, 15);
});

// Mouse click event listener
document.addEventListener('click', e => {

    // Get current mouse position
    let mousePos = new Point(Math.max(ballSize, e.clientX),Math.max(ballSize, e.clientY));

    // Add a force and direction to the ball
    let vector = new Point(0, 0);

    // Direction and magnitude are applied to the ball by the cursor
    if (mousePositions.length > 0){

        const magnitudeModifier = 0.13;

        // Get mouse positions average X and Y
        let xPositions = mousePositions.map(p => p.x);
        let yPositions = mousePositions.map(p => p.y);
        
        // Clear the positions array
        mousePositions.length = 0;

        // X
        let minX = Math.min(...xPositions);
        let maxX = Math.max(...xPositions);
        let magnitudeX = (maxX - minX) * magnitudeModifier;

        // Y
        let minY = Math.min(...yPositions);
        let maxY = Math.max(...yPositions);
        let magnitudeY = (maxY - minY) * magnitudeModifier;

        // Right
        if (e.clientX > minX) vector.x = magnitudeX;

        // Left
        else if (e.clientX < maxX) vector.x = -magnitudeX;

        // Down
        if (e.clientY > minY) vector.y = magnitudeY;

        // Up
        else if (e.clientY < maxY) vector.y = -magnitudeY;
    }

    // Spawn the ball with a random size
    balls.push(new Ball(mousePos, vector, random(3, 6)));
});

//#endregion

start();