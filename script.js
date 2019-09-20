//#region Variables

const canvas = document.createElement('canvas');
document.body.appendChild(canvas);
canvas.height = window.innerHeight;
canvas.width = window.innerWidth;
const balls = [];
const ctx = canvas.getContext('2d');
const gravity = 1;

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

    constructor(position, size){
        this.position = position;
        this.vector = new Point(0, 0);
        this.mass = size;
        this.r = size;
    }

    draw(){

        //#region Movement

        // Apply gravity
        this.vector.y += gravity; // Todo: add mass as well

        // Move
        this.position.y += this.vector.y;

        //#endregion

        //#region Collision

        // Bottom wall was hit
        if (this.position.y + this.r >= canvas.height){
            this.position.y = canvas.height - this.r;
            this.vector.y *= -1; // Invert
            this.vector.y += gravity * 4; // Decelerate
        }

        // Top wall was hit
        else if (this.position.y - this.r <= 0){
            this.position.y = this.r;
            this.vector.y *= -1; // Invert
            this.vector.y -= gravity * 4; // Decelerate
        }

        // Collision with other balls
        /*
        for (let ball of balls){
            if (ball == this) continue;
            if (distance(this.x, this.y, ball.x, ball.y) < this.r + ball.r){
                
            }
        }*/

        //#endregion

        // Draw
        ctx.fillText(this.vector.y, 300, 50);
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.r, 0, Math.PI * 2);
        ctx.stroke();
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
    return {r: Math.random() * 255, g: Math.random() * 255, b: Math.random() * 255};
}

// Mouse click event listener
document.addEventListener('click', e => {
    let mousePos = new Point(e.clientX, e.clientY);
    balls.push(new Ball(mousePos, 5));
});

draw();