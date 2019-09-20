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
        this.color = randColor();
    }

    draw(){

        //#region Movement

        // Gravity
        this.vector.y += this.weight;
        this.vector.x > 0 ? this.vector.x -= (this.weight / 50) : this.vector.x += (this.weight / 50);

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
            this.vector.y += gravity * 4; // Decelerate
        }

        // Top
        if (this.position.y - this.r < 0){
            this.position.y = this.r;
            this.vector.y *= -1; // Invert
            this.vector.y -= gravity * 4; // Decelerate
        }

        // Left
        if (this.position.x - this.r < 0){
            this.position.x = this.r;
            this.vector.x *= -1; // Invert
            this.vector.x -= gravity * 4; // Decelerate
        }

        // Right
        if (this.position.x + this.r > canvas.width){
            this.position.x = canvas.width - this.r;
            this.vector.x *= -1; // Invert
            this.vector.x += gravity * 4; // Decelerate
        }

        //#endregion

        //#endregion

        // Draw
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }
}

// Draw loop
function draw(){

    ctx.clearRect(0,0,canvas.width,canvas.height);
    for (let b of balls){
        b.draw();
    }
    requestAnimationFrame(draw);
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
    let mousePos = new Point(e.clientX, e.clientY);
    mousePositions.push(mousePos);

    // Array is bigger than 100, delete an element
    if (mousePositions.length > 50){
        mousePositions.splice(0, 1);
    }

    // Clear the positions after a sec
    clearTimeout(mouseMoveHandler);
    mouseMoveHandler = setTimeout(() => {
        mousePositions.length = 0;
    }, 75);
});

// Mouse click event listener
document.addEventListener('click', e => {

    // Get current mouse position
    let mousePos = new Point(e.clientX, e.clientY);

    let vector = new Point(0, 0);

    // Direction and magnitude applied to the ball
    if (mousePositions.length > 0){

        // Get mouse positions average X and Y
        let xPositions = mousePositions.map(p => p.x);
        let yPositions = mousePositions.map(p => p.y);

        let sumX = xPositions.reduce((previous, current) => current += previous);
        let sumY = yPositions.reduce((previous, current) => current += previous);

        let avgX = sumX / mousePositions.length;
        let avgY = sumY / mousePositions.length;

        let x = 0;
        let y = 0;
        let force = 30;

        // Top-right
        if (mousePos.x > avgX && mousePos.y < avgY){
            x = force;
            y = -force;
        }

        // Top-left
        else if (mousePos.x < avgX && mousePos.y < avgY){
            x = -force;
            y = -force;
        }

        // Bottom-right
        else if (mousePos.x > avgX && mousePos.y > avgY){
        
            x = force;
            y = force;
        }

        // Bottom-left
        else if (mousePos.x < avgX && mousePos.y > avgY){
        
            x = -force;
            y = force;
        }

        vector = new Point(x, y);
    }

    balls.push(new Ball(mousePos, vector, 5));
});

draw();