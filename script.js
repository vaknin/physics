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
        this.collided = [];
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

        // Check all the balls currently spawned
        for (let ball of balls){

            // Don't check collision with self
            if (ball == this) continue;
            
            // Collision detected
            else if (this.position.distance(ball.position.x, ball.position.y) <= this.r + ball.r && this.collided.indexOf(ball) == -1){

                if (this.vector.x == 0 && this.vector.y == 0 && ball.vector.x == 0 && ball.vector.y == 0) continue; // delete?

                let thisX = this.vector.x;
                let thisY = this.vector.y;

                let ballX = ball.vector.x;
                let ballY = ball.vector.y;

                const accelerateAmount = 0.999; // 0.95
                const decelerateAmount = 0.5; // 0.5

                // X-axis this has more force
                if (Math.abs(thisX) > Math.abs(ballX)){
                    ball.vector.x = this.vector.x * accelerateAmount;
                    this.vector.x *= decelerateAmount;
                }

                // X-axis the other ball has more force
                else{
                    this.vector.x = ball.vector.x * accelerateAmount;;
                    ball.vector.x *= decelerateAmount;
                }

                // Y-axis this has more force
                if (Math.abs(thisY) > Math.abs(ballY)){
                    ball.vector.y = this.vector.y * accelerateAmount;
                    this.vector.y *= decelerateAmount;
                }

                // Y-axis the other ball has more force
                else{
                    this.vector.y = ball.vector.y * accelerateAmount;
                    ball.vector.y *= decelerateAmount;
                }

                const collisionThresholdX = 30;
                const collisionThresholdY = 25;
                const forceModifier = 7;

                let collisionMagnitudeX = Math.abs(thisX) + Math.abs(ballX);
                let collisionMagnitudeY = Math.abs(thisY) + Math.abs(ballY);

                if (collisionMagnitudeX > collisionThresholdX){
                    thisX > ballX ? ball.vector.y += this.getRandomForce(forceModifier) : this.vector.y += this.getRandomForce(forceModifier);
                }

                if (collisionMagnitudeY > collisionThresholdY){
                    thisY > ballY ? ball.vector.x += this.getRandomForce(forceModifier) : this.vector.x += this.getRandomForce(forceModifier);
                }
                
                ball.collided.push(this);
            }
        }

        //#endregion

        //#endregion

        // Draw the ball
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    }

    getRandomForce(amount){
        return Math.round(Math.random()) == 0 ? amount : -amount;
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

    for (let ball of balls){
        ball.collided = [];
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