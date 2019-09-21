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
const gravity = 1;
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

    multiply(n){
        this.x *= n;
        this.y *= n;
    }
}

class Ball{

    constructor(position, vector, size){
        this.position = position;
        this.vector = vector;
        this.weight = gravity + size / 10;
        this.r = size;
        this.xFriction = size / 75;

        this.collided = false;
    }

    draw(){

        //#region Movement

        // Y-axis friction
        let touchingBottomWall = (this.position.y >= canvas.height - this.r);
        if (touchingBottomWall && Math.abs(this.vector.y) < this.weight) this.vector.y = 0;
        else this.vector.y += this.weight;

        // X-axis friction
        if (this.vector.x != 0){
            this.vector.x > 0 ? this.vector.x -= this.xFriction : this.vector.x += this.xFriction;
            if (Math.abs(this.vector.x) < this.xFriction) this.vector.x = 0;
        }

        // Move
        this.position.y += this.vector.y;
        this.position.x += this.vector.x;

        //#endregion

        //#region Collision

        //#region Walls

        const wallForce = -0.7;

        // Bottom
        if (this.position.y + this.r > canvas.height){
            this.position.y = canvas.height - this.r;
            this.vector.y *= wallForce;
        }

        // Top
        else if (this.position.y - this.r < 0){
            this.position.y = this.r;
            this.vector.y *= wallForce;
        }

        // Left
        if (this.position.x - this.r < 0){
            this.position.x = this.r;
            this.vector.x *= wallForce;
        }

        // Right
        else if (this.position.x + this.r > canvas.width){
            this.position.x = canvas.width - this.r;
            this.vector.x *= wallForce;
        }

        //#endregion

        //#region Collision with other balls

        if (!this.collided){

            // Check all the balls currently spawned
            for (let ball of balls){

                // Don't check collision with self
                if (ball == this) continue;
                
                // Collision detected
                else if (this.position.distance(ball.position.x, ball.position.y) <= this.r + ball.r){

                    let avgX = Math.abs((this.vector.x + ball.vector.x) / 2);
                    let avgY = Math.abs((this.vector.y + ball.vector.y) / 2);

                    this.vector.x > 0 ? ball.vector.x = avgX : ball.vector.x = -avgX;
                    this.vector.y > 0 ? ball.vector.y = avgY : ball.vector.Y = -avgY;

                    ball.vector.x > 0 ? this.vector.x = avgX : this.vector.x = -avgX;
                    ball.vector.y > 0 ? this.vector.y = avgY : this.vector.Y = -avgY;
                    
                    this.collided = true;
                    ball.collided = true;
                    
                    break;
                }
            }
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

    // Draw
    ctx.clearRect(0,0,canvas.width,canvas.height);
    for (let ball of balls){
        ball.draw();
    }

    // Remove collision flag
    for (let ball of balls){
        ball.collided = false;
    }

    // Repeat
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

    // Clear the positions on idle
    clearTimeout(mouseMoveHandler);
    mouseMoveHandler = setTimeout(() => {
        mousePositions.length = 0;
    }, canvas.width / 85);
});

// Mouse click event listener
document.addEventListener('click', e => {

    // Get current mouse position
    let mousePos = new Point(Math.max(ballSize, e.clientX),Math.max(ballSize, e.clientY));

    // Add a force and direction to the ball
    let vector = new Point(0, 0);

    // Direction and magnitude are applied to the ball by the cursor
    if (mousePositions.length > 0){

        const magnitudeModifier = 0.17;

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
    balls.push(new Ball(mousePos, vector, random(10, 10)));
});

//#endregion

start();