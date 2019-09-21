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
const gravity = 3;
const ballSize = 5;
let mouseMoveHandler;

//#endregion

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
        this.weight = gravity + (size / 2);
        this.r = size;
    }

    draw(){

        //#region Movement

        // Gravity
        this.vector.y += this.weight; // Y
        this.vector.x > 0 ? this.vector.x -= (this.weight / 50) : this.vector.x += (this.weight / 50); // X

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

// Get either 1 or -1 randomly
function randSign(){
    return Math.round(random(0, 1)) == 0 ? 1 : -1;
}

// Returns a random RGB color
function randColor(){
    return `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`;
}

// Mouse move event listener
document.addEventListener('mousemove', e => {

    // Get mouse position and add it to the positions array
    let mousePos = new Point(Math.max(ballSize, e.clientX),Math.max(ballSize, e.clientY));
    mousePositions.push(mousePos);

    // Array is bigger than 100, delete an element
    if (mousePositions.length > 50){
        mousePositions.splice(0, 1);
    }

    // Clear the positions after a sec
    clearTimeout(mouseMoveHandler);
    mouseMoveHandler = setTimeout(() => {
        mousePositions.length = 0;
    }, 13);
});

// Mouse click event listener
document.addEventListener('click', e => {

    // Get current mouse position
    let mousePos = new Point(Math.max(ballSize, e.clientX),Math.max(ballSize, e.clientY));
    let vector = new Point(0, 0);

    // Direction and magnitude applied to the ball
    if (mousePositions.length > 0){

        mousePositions.push(mousePos);
        const magnitudeModifier = 0.13;

        // Get mouse positions average X and Y
        let xPositions = mousePositions.map(p => p.x);
        let yPositions = mousePositions.map(p => p.y);
        
        // Clear the array
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
        if (e.clientX > minX){
            vector.x = magnitudeX;
            //console.log("Right");
        }

        // Left
        if (e.clientX < maxX){
            vector.x = -magnitudeX;
            //console.log("Left");
        }

        // Down
        if (e.clientY > minY){
            vector.y = magnitudeY;
            //console.log("Down");
        }

        // Up
        else if (e.clientY < maxY){
            vector.y = -magnitudeY;
            //console.log("Up");
        }

//        console.log(mousePositions.length);
    }

    balls.push(new Ball(mousePos, vector, ballSize));
});

start();