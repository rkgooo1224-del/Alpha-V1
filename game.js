const canvas =
document.getElementById("gameCanvas");

const ctx =
canvas.getContext("2d");

let W = innerWidth;
let H = innerHeight;

function resize() {
    W = innerWidth;
    H = innerHeight;

    canvas.width = W;
    canvas.height = H;
}

resize();

addEventListener(
    "resize",
    resize
);


/* WORLD */

const WORLD_W = 3000;
const WORLD_H = 3000;

const camera = {
    x: 0,
    y: 0
};


/* PLAYER */

const player = {
    x: 1500,
    y: 1500,

    radius: 20,

    speed: 3.2,

    hp: 100,
    maxHp: 100,

    damage: 1,

    attackRange: 78,
    attackCooldown: 0,

    flash: 0,
    shake: 0,

    dead: false
};


/* TIER 1 HELL */

const hell = {
    x: 1750,
    y: 1500,

    radius: 28,

    speed: 4.1,

    hp: 20,
    maxHp: 20,

    damage: 5,

    attackRange: 48,
    attackCooldown: 0,

    alive: true,

    flash: 0,
    shake: 0
};const hills = [];
const trees = [];
const rocks = [];
const particles = [];
const meatDrops = [];


/* RANDOM */

function random(min, max) {
    return Math.random() *
        (max - min) + min;
}


/* HILLS */

for (let i = 0; i < 18; i++) {
    hills.push({
        x: random(150, WORLD_W - 150),
        y: random(150, WORLD_H - 150),
        width: random(180, 350),
        height: random(100, 220)
    });
}


/* TREES */

for (let i = 0; i < 80; i++) {
    trees.push({
        x: random(80, WORLD_W - 80),
        y: random(80, WORLD_H - 80),
        size: random(22, 38)
    });
}


/* ROCKS */

for (let i = 0; i < 60; i++) {
    rocks.push({
        x: random(70, WORLD_W - 70),
        y: random(70, WORLD_H - 70),
        size: random(10, 22)
    });
}const joystick =
    document.getElementById("joystick");

const stick =
    document.getElementById("stick");

let joyX = 0;
let joyY = 0;

let active = false;

const joyRadius = 48;

function moveStick(x, y) {

    const r =
        joystick.getBoundingClientRect();

    const cx =
        r.left + r.width / 2;

    const cy =
        r.top + r.height / 2;

    let dx = x - cx;
    let dy = y - cy;

    const distance =
        Math.hypot(dx, dy);

    if (distance > joyRadius) {
        dx =
            dx / distance *
            joyRadius;

        dy =
            dy / distance *
            joyRadius;
    }

    joyX =
        dx / joyRadius;

    joyY =
        dy / joyRadius;

    stick.style.transform =
        `translate(${dx}px,${dy}px)`;
}

function resetStick() {

    active = false;

    joyX = 0;
    joyY = 0;

    stick.style.transform =
        "translate(0,0)";
      }joystick.addEventListener(
    "touchstart",
    e => {
        e.preventDefault();
        active = true;

        const t = e.touches[0];

        moveStick(
            t.clientX,
            t.clientY
        );
    },
    { passive: false }
);

joystick.addEventListener(
    "touchmove",
    e => {
        e.preventDefault();

        if (!active) return;

        const t = e.touches[0];

        moveStick(
            t.clientX,
            t.clientY
        );
    },
    { passive: false }
);

joystick.addEventListener(
    "touchend",
    e => {
        e.preventDefault();
        resetStick();
    },
    { passive: false }
);


/* PLAYER MOVEMENT */

function updatePlayer() {

    if (player.dead) return;

    player.x +=
        joyX * player.speed;

    player.y +=
        joyY * player.speed;

    player.x = Math.max(
        30,
        Math.min(
            WORLD_W - 30,
            player.x
        )
    );

    player.y = Math.max(
        30,
        Math.min(
            WORLD_H - 30,
            player.y
        )
    );
}const attackButton =
    document.getElementById(
        "attackButton"
    );

attackButton.addEventListener(
    "touchstart",
    e => {
        e.preventDefault();
        attack();
    },
    { passive: false }
);

function attack() {

    if (player.dead) return;

    if (player.attackCooldown > 0)
        return;

    player.attackCooldown = 350;

    if (!hell.alive) return;

    const dx =
        hell.x - player.x;

    const dy =
        hell.y - player.y;

    const distance =
        Math.hypot(dx, dy);

    if (
        distance <=
        player.attackRange
    ) {

        hell.hp -=
            player.damage;

        hell.flash = 0.18;
        hell.shake = 8;

        createDamageParticle(
            hell.x,
            hell.y,
            player.damage
        );

        if (hell.hp <= 0) {
            hell.hp = 0;
            killHell();
        }
    }
}

function killHell() {

    hell.alive = false;

    meatDrops.push({
        x: hell.x,
        y: hell.y
    });
}function updateHell() {

    if (!hell.alive)
        return;

    const dx =
        player.x - hell.x;

    const dy =
        player.y - hell.y;

    const distance =
        Math.hypot(dx, dy);

    if (distance >
        hell.attackRange) {

        hell.x +=
            dx / distance *
            hell.speed;

        hell.y +=
            dy / distance *
            hell.speed;
    }

    if (
        distance <=
        hell.attackRange &&
        hell.attackCooldown <= 0
    ) {

        hell.attackCooldown =
            800;

        player.hp -=
            hell.damage;

        player.hp =
            Math.max(
                0,
                player.hp
            );

        player.flash = 0.2;
        player.shake = 8;

        createDamageParticle(
            player.x,
            player.y,
            hell.damage
        );

        if (player.hp <= 0) {
            player.dead = true;

            document.getElementById(
                "gameOver"
            ).style.display =
                "flex";
        }
    }
}


/* COOLDOWNS */

function updateCooldowns() {

    if (
        player.attackCooldown > 0
    )
        player.attackCooldown -= 16;

    if (
        hell.attackCooldown > 0
    )
        hell.attackCooldown -= 16;
}function createDamageParticle(
    x,
    y,
    damage
) {
    particles.push({
        x: x,
        y: y - 25,
        text: "-" + damage,
        life: 1,
        speed: 1.5
    });
}


function updateParticles() {

    for (
        let i = particles.length - 1;
        i >= 0;
        i--
    ) {

        const p = particles[i];

        p.y -= p.speed;
        p.life -= 0.03;

        if (p.life <= 0)
            particles.splice(i, 1);
    }
}


/* FLASH + SHAKE */

function updateEffects() {

    if (player.flash > 0)
        player.flash -= 0.016;

    if (hell.flash > 0)
        hell.flash -= 0.016;

    if (player.shake > 0)
        player.shake *= 0.85;

    if (hell.shake > 0)
        hell.shake *= 0.85;
}


/* CAMERA */

function updateCamera() {

    camera.x =
        player.x - W / 2;

    camera.y =
        player.y - H / 2;

    camera.x = Math.max(
        0,
        Math.min(
            WORLD_W - W,
            camera.x
        )
    );

    camera.y = Math.max(
        0,
        Math.min(
            WORLD_H - H,
            camera.y
        )
    );
}function drawWorld() {

    ctx.fillStyle = "#5f9f48";
    ctx.fillRect(0, 0, W, H);

    /* Hills */

    for (const h of hills) {

        const x = h.x - camera.x;
        const y = h.y - camera.y;

        ctx.fillStyle = "#4f8b3d";

        ctx.beginPath();

        ctx.ellipse(
            x,
            y,
            h.width / 2,
            h.height / 2,
            0,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }

    /* Trees */

    for (const t of trees) {

        const x = t.x - camera.x;
        const y = t.y - camera.y;

        ctx.fillStyle = "#70452a";

        ctx.fillRect(
            x - 5,
            y - 5,
            10,
            25
        );

        ctx.fillStyle = "#286b32";

        ctx.beginPath();

        ctx.arc(
            x,
            y - 15,
            t.size,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }

    /* Rocks */

    for (const r of rocks) {

        const x = r.x - camera.x;
        const y = r.y - camera.y;

        ctx.fillStyle = "#777";

        ctx.beginPath();

        ctx.ellipse(
            x,
            y,
            r.size,
            r.size * 0.7,
            0,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }
}function drawPlayer() {

    const x = player.x - camera.x;
    const y = player.y - camera.y;

    ctx.fillStyle =
        player.flash > 0
        ? "white" : "#246bce";

    ctx.beginPath();

    ctx.arc(
        x,
        y,
        player.radius,
        0,
        Math.PI * 2
    );

    ctx.fill();
}


function drawHell() {

    if (!hell.alive)
        return;

    const x = hell.x - camera.x;
    const y = hell.y - camera.y;

    ctx.fillStyle =
        hell.flash > 0
        ? "white" : "#641313";

    ctx.beginPath();

    ctx.arc(
        x,
        y,
        hell.radius,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.fillStyle = "#ffdf00";

    ctx.beginPath();

    ctx.arc(
        x - 8,
        y - 5,
        4,
        0,
        Math.PI * 2
    );

    ctx.arc(
        x + 8,
        y - 5,
        4,
        0,
        Math.PI * 2
    );

    ctx.fill();
}


function drawHellHealth() {

    if (!hell.alive)
        return;

    const x =
        hell.x - camera.x - 40;

    const y =
        hell.y - camera.y - 50;

    ctx.fillStyle = "#222";
    ctx.fillRect(x, y, 80, 8);

    ctx.fillStyle = "#e53935";
    ctx.fillRect(
        x,
        y,
        80 * hell.hp / 20,
        8
    );
}function drawParticles() {

    for (const p of particles) {

        ctx.globalAlpha = p.life;

        ctx.fillStyle = "white";

        ctx.font = "bold 15px Arial";

        ctx.textAlign = "center";

        ctx.fillText(
            p.text,
            p.x - camera.x,
            p.y - camera.y
        );
    }

    ctx.globalAlpha = 1;
}


function drawMeat() {

    for (const m of meatDrops) {

        const x = m.x - camera.x;
        const y = m.y - camera.y;

        ctx.fillStyle = "#d66b5c";

        ctx.beginPath();

        ctx.arc(
            x - 7,
            y,
            9,
            0,
            Math.PI * 2
        );

        ctx.arc(
            x + 7,
            y,
            9,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }
}


function updateHUD() {

    const bar =
        document.getElementById(
            "playerHPBar"
        );

    const text =
        document.getElementById(
            "playerHPText"
        );

    bar.style.width =
        player.hp + "%";

    text.textContent =
        `HP: ${player.hp} / 100`;
}function gameLoop() {

    updatePlayer();
    updateHell();
    updateCooldowns();
    updateParticles();
    updateEffects();
    updateCamera();

    drawWorld();
    drawMeat();
    drawPlayer();
    drawHell();
    drawHellHealth();
    drawParticles();

    updateHUD();

    requestAnimationFrame(
        gameLoop
    );
}

gameLoop();
