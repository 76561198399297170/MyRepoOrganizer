const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let particles = [];

function Particle(x, y, isStar) {
    this.x = x;
    this.y = y;
    this.size = isStar ? (Math.random() * 30 + 2) : (Math.random() * 5 + 1);
    this.speedX = (Math.random() - 0.5) * (isStar ? 7 : 2);
    this.speedY = (Math.random() - 0.5) * (isStar ? 7 : 2);
    this.gravity = isStar ? 0.1 : 0;
    this.color = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`;
    this.alpha = 1;
    this.isStar = isStar;
}

Particle.prototype.update = function() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.speedY += this.gravity;
    this.alpha -= 0.02;
    if (this.alpha <= 0) {
        const index = particles.indexOf(this);
        if (index !== -1) {
            particles.splice(index, 1);
        }
    }
};

Particle.prototype.draw = function() {
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    if (this.isStar) {
        const spikes = 5;
        const outerRadius = this.size;
        const innerRadius = this.size / 2;
        const angle = Math.PI / spikes;
        for (let i = 0; i < spikes * 2; i++) {
            const x = this.x + Math.cos(i * angle) * (i % 2 === 0 ? outerRadius : innerRadius);
            const y = this.y + Math.sin(i * angle) * (i % 2 === 0 ? outerRadius : innerRadius);
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
    } else {
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    }
    ctx.fill();
};

document.addEventListener('click', (e) => {
    for (let i = 0; i < 10; i++) {
        particles.push(new Particle(e.clientX, e.clientY, true));
    }
});

document.addEventListener('mousemove', (e) => {
    const x = e.clientX;
    const y = e.clientY;
    for (let i = 0; i < 5; i++) {
        particles.push(new Particle(x, y));
    }
});

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        particle.update();
        if (particle.alpha > 0) {
            particle.draw();
        } else {
            particles.splice(i, 1);
        }
    }
    requestAnimationFrame(animate);
}
animate();

// 确保粒子画布在侧边栏之上
const sidebar = document.querySelector('.sidebar');
sidebar.style.zIndex = 20;
canvas.style.zIndex = 999;