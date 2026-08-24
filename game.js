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

    
const nx =
    player.x + joyX * player.speed;

const ny =
    player.y + joyY * player.speed;

if (!treeCollision(nx, player.y))
    player.x = nx;

if (!treeCollision(player.x, ny))
    player.y = ny;
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
    swordSwing = 180;

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
    updateWalkAnimation();
    updateHellFire();
    
    betterGrass();
    updateSwordSwing();
    drawSwordSwing();
    betterhills();
    betterTrees();
    betterRocks();
    drawWorld();
    drawMeat();
    drawSword();
    betterPlayer();
    betterCharacters();
    betterHell();
    drawHellHealth();
    drawParticles();
    drawHellFire();
   
    updateHUD();
 
    requestAnimationFrame(
        gameLoop
    );
}

gameLoop();
function betterGrass() {

    ctx.fillStyle = "#5c963f";
    ctx.fillRect(0, 0, W, H);

    for (let i = 0; i < 350; i++) {

        const x =
            (i * 97 - camera.x * 0.8)
            % (W + 40);

        const y =
            (i * 53 - camera.y * 0.8)
            % (H + 40);

        ctx.strokeStyle =
            "rgba(35,80,25,.35)";

        ctx.lineWidth = 1;

        ctx.beginPath();

        ctx.moveTo(x, y);
        ctx.lineTo(x + 3, y - 7);

        ctx.stroke();
    }
}function betterTrees() {

    for (const t of trees) {

        const x = t.x - camera.x;
        const y = t.y - camera.y;

        ctx.fillStyle = "rgba(0,0,0,.25)";
        ctx.beginPath();
        ctx.ellipse(
            x, y + 18,
            t.size, 8,
            0, 0, Math.PI * 2
        );
        ctx.fill();

        ctx.fillStyle = "#70452a";
        ctx.fillRect(
            x - 7, y - 5,
            14, 30
        );

        ctx.fillStyle = "#245f2d";
        ctx.beginPath();
        ctx.arc(
            x, y - 18,
            t.size,
            0, Math.PI * 2
        );
        ctx.fill();

        ctx.fillStyle = "#39803b";
        ctx.beginPath();
        ctx.arc(
            x - 8, y - 27,
            t.size * .65,
            0, Math.PI * 2
        );
        ctx.fill();
    }
}


/* TREE COLLISION */

function treeCollision(x, y) {

    for (const t of trees) {

        const dx = x - t.x;
        const dy = y - t.y;

        const distance =
            Math.hypot(dx, dy);

        if (distance < t.size + player.radius)
            return true;
    }

    return false;
}function betterRocks() {

    for (const r of rocks) {

        const x = r.x - camera.x;
        const y = r.y - camera.y;

        // Shadow
        ctx.fillStyle = "rgba(0,0,0,.22)";
        ctx.beginPath();
        ctx.ellipse(
            x + 3, y + 5,
            r.size, r.size * .45,
            0, 0, Math.PI * 2
        );
        ctx.fill();

        // Rock
        ctx.fillStyle = "#626262";
        ctx.beginPath();
        ctx.ellipse(
            x, y,
            r.size,
            r.size * .7,
            -.15,
            0, Math.PI * 2
        );
        ctx.fill();

        // Highlight
        ctx.fillStyle = "#888";
        ctx.beginPath();
        ctx.ellipse(
            x - r.size * .3,
            y - r.size * .25,
            r.size * .35,
            r.size * .18,
            -.2,
            0, Math.PI * 2
        );
        ctx.fill();
    }
}function drawHellFire() {

    for (const p of hellFire) {

        ctx.globalAlpha = p.life;

        ctx.fillStyle = "#ff6a00";

        ctx.beginPath();

        ctx.arc(
            p.x - camera.x,
            p.y - camera.y,
            p.size,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }

    ctx.globalAlpha = 1;
}const hellFire = [];

function createHellFire() {

    if (!hell.alive) return;

    hellFire.push({
        x: hell.x + random(-20, 20),
        y: hell.y + random(-18, 20),
        vx: random(-.4, .4),
        vy: random(-1.5, -.5),
        life: 1,
        size: random(3, 7)
    });
}

function updateHellFire() {

    createHellFire();

    for (let i = hellFire.length - 1; i >= 0; i--) {

        const p = hellFire[i];

        p.x += p.vx;
        p.y += p.vy;
        p.life -= .035;

        if (p.life <= 0)
            hellFire.splice(i, 1);
    }
}function betterPlayer() {

    let x = player.x - camera.x;
    let y = player.y - camera.y;

    // Shadow
    ctx.fillStyle = "rgba(0,0,0,.25)";
    ctx.beginPath();
    ctx.ellipse(
        x, y + 22,
        20, 7,
        0, 0, Math.PI * 2
    );
    ctx.fill();

    // Legs
    ctx.fillStyle = "#202638";
    ctx.fillRect(x - 11, y + 8, 8, 17);
    ctx.fillRect(x + 3, y + 8, 8, 17);

    // Body
    ctx.fillStyle =
        player.flash > 0
        ? "white" : "#245fc7";

    ctx.beginPath();
    ctx.roundRect(
        x - 16, y - 5,
        32, 25, 7
    );
    ctx.fill();

    // Head
    ctx.fillStyle = "#e8aa7d";
    ctx.beginPath();
    ctx.arc(
        x, y - 17,
        13,
        0, Math.PI * 2
    );
    ctx.fill();

    // Hair
    ctx.fillStyle = "#171717";
    ctx.beginPath();
    ctx.arc(
        x, y - 22,
        13,
        Math.PI,
        Math.PI * 2
    );
    ctx.fill();

    // Eyes
    ctx.fillStyle = "#111";
    ctx.fillRect(x - 6, y - 18, 3, 3);
    ctx.fillRect(x + 3, y - 18, 3, 3);
        }const legMove =
    Math.sin(walkTime) * 5;

ctx.fillStyle = "#202638";

ctx.save();

ctx.translate(
    x - 7,
    y + 10
);

ctx.rotate(
    legMove * Math.PI / 180
);

ctx.fillRect(
    -4, 0,
    8, 17
);

ctx.restore();

ctx.save();

ctx.translate(
    x + 7,
    y + 10
);

ctx.rotate(
    -legMove * Math.PI / 180
);

ctx.fillRect(
    -4, 0,
    8, 17
);

ctx.restore();
function drawSword() {

    const x = player.x - camera.x;
    const y = player.y - camera.y;

    let dx = joyX;
    let dy = joyY;

    if (Math.hypot(dx, dy) < 0.1) {
        dx = 1;
        dy = 0;
    }

    const angle = Math.atan2(dy, dx);

    ctx.save();

    ctx.translate(x, y);
    ctx.rotate(angle);

    /* Handle */

    ctx.fillStyle = "#633b20";
    ctx.fillRect(13, -3, 16, 6);

    /* Guard */

    ctx.fillStyle = "#d6b24c";
    ctx.fillRect(10, -7, 5, 14);

    /* Blade */

    ctx.fillStyle =
        player.flash > 0
        ? "white" : "#dce5ee";

    ctx.beginPath();

    ctx.moveTo(14, -5);
    ctx.lineTo(48, 0);
    ctx.lineTo(14, 5);

    ctx.closePath();
    ctx.fill();

    ctx.restore();
}let swordSwing = 0;

function updateSwordSwing() {

    if (swordSwing > 0)
        swordSwing -= 16;
}

function drawSwordSwing() {

    if (swordSwing <= 0) return;

    const x = player.x - camera.x;
    const y = player.y - camera.y;

    const angle =
        Math.atan2(joyY, joyX);

    const progress =
        1 - swordSwing / 180;

    const swing =
        -1.2 + progress * 2.4;

    ctx.save();

    ctx.translate(x, y);
    ctx.rotate(angle + swing);

    ctx.strokeStyle =
        "rgba(220,240,255,.8)";

    ctx.lineWidth = 5;

    ctx.beginPath();
    ctx.moveTo(15, 0);
    ctx.lineTo(60, 0);
    ctx.stroke();

    ctx.restore();
}function drawHitParticles() {

    for (const p of hitParticles) {

        ctx.globalAlpha = p.life;
        ctx.fillStyle = "#ffd34d";

        ctx.beginPath();

        ctx.arc(
            p.x - camera.x,
            p.y - camera.y,
            p.size,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }

    ctx.globalAlpha = 1;
}const hitParticles = [];

function createHitImpact(x, y) {

    for (let i = 0; i < 8; i++) {

        const angle =
            random(0, Math.PI * 2);

        const speed =
            random(1.5, 4);

        hitParticles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1,
            size: random(2, 5)
        });
    }
}

function updateHitParticles() {

    for (
        let i = hitParticles.length - 1;
        i >= 0;
        i--
    ) {
        const p = hitParticles[i];

        p.x += p.vx;
        p.y += p.vy;

        p.vx *= .94;
        p.vy *= .94;

        p.life -= .06;

        if (p.life <= 0)
            hitParticles.splice(i, 1);
    }
}
