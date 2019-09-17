//#region Variables

const canvas = document.createElement('canvas');
document.body.appendChild(canvas);
canvas.height = window.innerHeight;
canvas.width = window.innerWidth;
const balls = [];
const ctx = canvas.getContext('2d');
const gravity = 1;

//#endregion

class Ball{
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.r = 5;
        this.mass = this.r;
        this.downwards = true;
        this.force = 5;
        this.alive = true;
    }

    draw(){

        // Movement
        if (this.alive){
            let weight = gravity + this.mass;
            this.downwards ? this.force += weight : this.force -= weight; // Gravity and mass
            if (this.force < 0) this.downwards ? null : this.downwards = true;        
            this.downwards ? this.y += this.force : this.y -= this.force;
        }

        //#region Boundaries

        // Bottom wall
        if (this.y + this.r >= canvas.height){
            this.y = canvas.height - this.r; // Reposition
            this.downwards = false;
            this.force -= 10;

            // Kill
            if (this.force <= 3){
                this.alive = false;
            }
        }

        // Top wall
        else if (this.y - this.r <= 0){
            this.y = this.r; // Reposition
            this.downwards = true;
            this.force -= 10;
        }

        // Collision
        for (let ball of balls){
            if (ball == this) continue;
            if (distance(this.x, this.y, ball.x, ball.y) < this.r + ball.r){
                
            }
        }

        //#endregion

        // Draw
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
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

// Get randomly either 1 or -1
function randSign(){
    return Math.round(random(0, 1)) == 0 ? 1 : -1;
}

// Calculate the distance from A to B
function distance(x1,y1,x2,y2){
    return Math.sqrt(Math.pow(x1-x2, 2) + Math.pow(y1-y2, 2));
}

// Returns a random color
function randColor(){
    return {r: Math.random() * 255, g: Math.random() * 255, b: Math.random() * 255};
}

document.addEventListener('click', e => {
    balls.push(new Ball(e.clientX, e.clientY));
});

draw();