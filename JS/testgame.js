window.addEventListener('load', init);
window.lastEllipses = null;
window.lastCanvas = null;
window.lastCtx = null;
window.lastBg = null;
window.lastGoalImg = null;
window.staticBoardCanvas = null;
window.selectedCubeIndex = 0;
window.raceActive = false;
window.selectedProfileImages = Array(8).fill(null);
window.selectedProfileImageSrcs = Array(8).fill(null);
window.movingCubes = [];
window.playerBgImages = [
    new Image(),
    new Image(),
    new Image(),
    new Image(),
    new Image(),
    new Image(),
    new Image(),
    new Image()
];

window.playerBgImages[0].src = '../images/game1/player1.jpeg';
window.playerBgImages[1].src = '../images/game1/player2.jpg';
window.playerBgImages[2].src = '../images/game1/player3.jpg';
window.playerBgImages[3].src = '../images/game1/player4.jpeg';
window.playerBgImages[4].src = '../images/game1/player5.jpg';
window.playerBgImages[5].src = '../images/game1/player6.jpg';
window.playerBgImages[6].src = '../images/game1/player7.jpg';
window.playerBgImages[7].src = '../images/game1/player8.jpeg';


let girlsdata = {};
const winnerMessages = [
    "Pizza Delight",
    "Soft Girl Spring",
    "Burger Bimbo",
    "Grease Goddess",
    "Fatass",
    "Fast Food Queen",
    "Buffet Destroyer",
    "Plump Princess"
];

function getEllipsePosition(rx, ry, canvas) {
    let x = Math.random() * canvas.width;
    let y = Math.random() * canvas.height;
    if (x - rx < 0) x = rx;
    if (x + rx > canvas.width) x = canvas.width - rx;
    if (y - ry < 0) y = ry;
    if (y + ry > canvas.height) y = canvas.height - ry;
    return { x, y };
}

function init() {
    const canvas = document.getElementById('grt');
    const ctx = canvas.getContext('2d');
    canvas.width = 1200;
    canvas.height = 900;

    const bg = new Image();
    bg.src = '../images/game1/track.jpg';
    const goalImg = new Image();
    goalImg.src = '../images/game1/goal.png';

    let imagesLoaded = 0;
    function onImageLoad() {
        imagesLoaded++;
        if (imagesLoaded === 2) {
            drawBoard(canvas, ctx, bg, goalImg);
            setupReloadButton(canvas, ctx, bg, goalImg);
            setupStartRaceButton();
        }
    }
    bg.onload = onImageLoad;
    goalImg.onload = onImageLoad;
    if (bg.complete) onImageLoad();
    if (goalImg.complete) onImageLoad();

    fetch('../JS/data.json')
        .then(response => response.json())
        .then(data => {
            girlsdata = data;
            // Call your function to populate select menus here
            setupSelectMenus();
        })
        .catch(error => {
            console.error('Failed to load GIRLSDATA:', error);
        });
}

function setupSelectMenus() {
    for (let i = 1; i <= 8; i++) {
        const groupSelect = document.getElementById(`player-group-${i}-select`);
        const memberSelect = document.getElementById(`player-${i}-select`);

        groupSelect.innerHTML = '<option value="">--Select an ID--</option>';
        Object.keys(girlsdata).forEach(group => {
            const option = document.createElement('option');
            option.value = group;
            option.textContent = group;
            groupSelect.appendChild(option);
        });

        groupSelect.addEventListener('change', function() {
            memberSelect.innerHTML = '<option value="">--Select a Player--</option>';
            memberSelect.disabled = !this.value;
            if (this.value) {
                girlsdata[this.value].forEach(member => {
                    const option = document.createElement('option');
                    option.value = member.id;
                    option.textContent = member.id;
                    memberSelect.appendChild(option);
                });
            }
        });

        memberSelect.addEventListener('change', function() {
            const group = groupSelect.value;
            const memberId = memberSelect.value;
            if (group && memberId) {
                const member = girlsdata[group].find(m => m.id === memberId);
                if (member && member.pfp) {
                    if (window.selectedProfileImageSrcs[i-1] !== member.pfp) {
                        const img = new Image();
                        img.src = member.pfp;
                        img.onload = () => {
                            window.selectedProfileImages[i-1] = img;
                            window.selectedProfileImageSrcs[i-1] = member.pfp;
                            redrawCubesOnly();
                        };
                    } else if (window.selectedProfileImages[i-1]) {
                        redrawCubesOnly();
                    }
                }
            }
        });
    }
}

function overlaps(e1, e2) {
    const dx = e1.x - e2.x;
    const dy = e1.y - e2.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const r1 = (e1.rx + e1.ry) / 2;
    const r2 = (e2.rx + e2.ry) / 2;
    return dist < (r1 + r2);
}

function getRandomDirection() {
    const angle = Math.random() * 2 * Math.PI;
    return { dx: Math.cos(angle), dy: Math.sin(angle) };
}

function setupReloadButton(canvas, ctx, bg, goalImg) {
    const reloadBtn = document.querySelector('#control-menu button');
    if (reloadBtn) {
        reloadBtn.onclick = () => drawBoard(canvas, ctx, bg, goalImg);
    }
}

function drawBoard(canvas, ctx, bg, goalImg) {
    blurBackground(canvas, ctx, bg);
    let ellipses;
    let tries = 0;
    const maxTries = 100;
    do {
        ellipses = generateEllipses(canvas, ctx, bg, goalImg);
        tries++;
    } while ((!ellipses || ellipses.length < 4) && tries < maxTries);

    if (!ellipses || ellipses.length < 4) {
        ctx.font = "48px monospace";
        ctx.fillStyle = "#f74bfa";
        ctx.textAlign = "center";
        ctx.fillText("Board generation failed!", canvas.width / 2, canvas.height / 2);
        return;
    }
    const brown = getUniformBrown();

    // Generate and save random line width for this board
    window.lastLineWidth = Math.floor(Math.random() * (125 - 75 + 1)) + 75;

    drawEllipses(ctx, ellipses, brown);
    drawEllipseBorders(ctx, ellipses);
    drawEllipseLines(ctx, ellipses, brown);

    if (ellipses.length > 0) {
        drawLabeledSquaresInEllipse(ctx, ellipses[0]);
    }

    drawGoal(ctx, ellipses[ellipses.length - 1], goalImg);

    window.lastEllipses = ellipses;
    window.lastCanvas = canvas;
    window.lastCtx = ctx;
    window.lastBg = bg;
    window.lastGoalImg = goalImg;

    window.staticBoardCanvas = document.createElement('canvas');
    window.staticBoardCanvas.width = canvas.width;
    window.staticBoardCanvas.height = canvas.height;
    window.staticBoardCanvas.getContext('2d').drawImage(canvas, 0, 0);
}
function blurBackground(canvas, ctx, bg) {
    const offCanvas = document.createElement('canvas');
    offCanvas.width = canvas.width;
    offCanvas.height = canvas.height;
    const offCtx = offCanvas.getContext('2d');
    offCtx.filter = 'blur(8px)';
    offCtx.drawImage(bg, 0, 0, canvas.width, canvas.height);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(offCanvas, 0, 0);
}

function getUniformBrown() {
    return `hsl(30, 70%, 40%)`;
}

function generateEllipses(canvas, ctx, bg, goalImg) {
    const ellipseCount = Math.floor(Math.random() * 3) + 4;
    let ellipses = [];
    const minRadius = 40;

    // First: perfect circle, radius 140-180
    let circleRadius = Math.random() * 40 + 140;
    let { x, y } = getEllipsePosition(circleRadius, circleRadius, canvas);
    ellipses.push({ x, y, rx: circleRadius, ry: circleRadius, value: 1 });

    // Rest: ellipses, each smaller by 5px
    let prevRx = circleRadius;
    let prevRy = circleRadius;
    for (let i = 1; i < ellipseCount; i++) {
        let rx = Math.max(prevRx - 5, minRadius);
        let ry = Math.max(prevRy - 5, minRadius);
        if (Math.abs(rx - ry) < 1) ry += 20;
        let tries = 0, maxTries = 1000, valid, pos;
        do {
            pos = getEllipsePosition(rx, ry, canvas);
            valid = true;
            for (let j = 0; j < ellipses.length; j++) {
                if (j === i - 1) continue;
                if (overlaps({ x: pos.x, y: pos.y, rx, ry }, ellipses[j])) {
                    valid = false;
                    break;
                }
            }
            tries++;
        } while (!valid && tries < maxTries);
        if (!valid) return [];
        ellipses.push({ x: pos.x, y: pos.y, rx, ry, value: i + 1 });
        prevRx = rx;
        prevRy = ry;
    }

    // Sort and chain logic unchanged
    let startIdx = 0;
    let minSum = ellipses[0].x + ellipses[0].y;
    for (let i = 1; i < ellipses.length; i++) {
        const sum = ellipses[i].x + ellipses[i].y;
        if (sum < minSum) {
            minSum = sum;
            startIdx = i;
        }
    }
    const cx = canvas.width / 2, cy = canvas.height / 2;
    ellipses.forEach(e => {
        e.angle = Math.atan2(e.y - cy, e.x - cx);
    });
    const startAngle = ellipses[startIdx].angle;
    ellipses.sort((a, b) => {
        let da = a.angle - startAngle;
        let db = b.angle - startAngle;
        if (da < 0) da += 2 * Math.PI;
        if (db < 0) db += 2 * Math.PI;
        return da - db;
    });

    ellipses[0].rx = circleRadius;
    ellipses[0].ry = circleRadius;
    ellipses[0].value = 1;

    // Check for invalid overlaps (non-neighbors)
    for (let i = 0; i < ellipses.length; i++) {
        for (let j = 0; j < ellipses.length; j++) {
            if (i === j || j === i - 1 || j === i + 1 || (i === 0 && j === ellipses.length - 1) || (i === ellipses.length - 1 && j === 0)) continue;
            if (overlaps(ellipses[i], ellipses[j])) {
                return [];
            }
        }
    }

    if (overlaps(ellipses[ellipses.length - 1], ellipses[0])) {
        return [];
    }

    let toRemove = new Set();
    for (let i = 0; i < ellipses.length; i++) {
        for (let j = 0; j < ellipses.length; j++) {
            if (i === j) continue;
            const e1 = ellipses[i], e2 = ellipses[j];
            if (overlaps(e1, e2) && e2.value > e1.value) {
                toRemove.add(i);
            }
        }
    }
    ellipses = ellipses.filter((_, i) => !toRemove.has(i));

    return ellipses;
}

function drawEllipses(ctx, ellipses, brown) {
    ctx.fillStyle = brown;
    for (let i = 0; i < ellipses.length; i++) {
        const e = ellipses[i];
        ctx.beginPath();
        ctx.ellipse(e.x, e.y, e.rx, e.ry, 0, 0, 2 * Math.PI);
        ctx.fill();
    }
}

function drawEllipseLines(ctx, ellipses, brown) {
    ctx.strokeStyle = brown;
    ctx.lineWidth = window.lastLineWidth || 100; // fallback if not set
    for (let i = 0; i < ellipses.length - 1; i++) {
        const e1 = ellipses[i];
        const e2 = ellipses[i + 1];
        ctx.beginPath();
        ctx.moveTo(e1.x, e1.y);
        ctx.lineTo(e2.x, e2.y);
        ctx.stroke();
    }
}

function drawGoal(ctx, ellipse, goalImg) {
    if (goalImg.complete) {
        ctx.drawImage(goalImg, ellipse.x - 32, ellipse.y - 32, 64, 64);
    } else {
        goalImg.onload = () => {
            ctx.drawImage(goalImg, ellipse.x - 32, ellipse.y - 32, 64, 64);
        };
    }
}

function drawEllipseBorders(ctx, ellipses) {
    ctx.save();
    ctx.lineWidth = 8;
    ctx.strokeStyle = "#faf741";

    function getOverlapArc(e1, e2) {
        const dx = e2.x - e1.x;
        const dy = e2.y - e1.y;
        const angle = Math.atan2(dy, dx);
        return [normalize(angle - 0.35), normalize(angle + 0.35)];
    }

    function normalize(angle) {
        while (angle < 0) angle += 2 * Math.PI;
        while (angle >= 2 * Math.PI) angle -= 2 * Math.PI;
        return angle;
    }

    function subtractArc(arcs, remove) {
        const [rStart, rEnd] = remove.map(normalize);
        let result = [];
        for (const [aStart, aEnd] of arcs) {
            let s = normalize(aStart), e = normalize(aEnd);
            if (e < s) e += 2 * Math.PI;
            let rs = rStart, re = rEnd;
            if (re < rs) re += 2 * Math.PI;

            if (re <= s || rs >= e) {
                result.push([s, e]);
                continue;
            }
            if (rs > s) result.push([s, rs]);
            if (re < e) result.push([re, e]);
        }
        return result.filter(([s, e]) => Math.abs(e - s) > 0.01);
    }

    for (let i = 0; i < ellipses.length; i++) {
        const e = ellipses[i];
        let arcs = [[0, 2 * Math.PI]];

        if (i === ellipses.length - 1) {
            ctx.beginPath();
            ctx.ellipse(e.x, e.y, e.rx, e.ry, 0, 0, 2 * Math.PI);
            ctx.stroke();
            continue;
        }

        for (let j = 0; j < ellipses.length; j++) {
            if (i === j) continue;
            const neighbor = ellipses[j];
            if (neighbor.value > e.value && overlaps(e, neighbor)) {
                const arc = getOverlapArc(e, neighbor);
                arcs = subtractArc(arcs, arc);
            }
        }

        for (const [start, end] of arcs) {
            ctx.beginPath();
            ctx.ellipse(e.x, e.y, e.rx, e.ry, 0, start, end);
            ctx.stroke();
        }
    }
    ctx.restore();
}

function drawLabeledSquaresInEllipse(ctx, ellipse) {
    if (window.raceActive) return;

    const cubeSize = 48;
    const radius = Math.min(ellipse.rx, ellipse.ry) - cubeSize;

    for (let i = 0; i < 8; i++) {
        const angle = (2 * Math.PI / 8) * i;
        const cx = ellipse.x + radius * Math.cos(angle);
        const cy = ellipse.y + radius * Math.sin(angle);

        const img = window.selectedProfileImages[i];
        if (img) {
            ctx.drawImage(img, cx - cubeSize / 2, cy - cubeSize / 2, cubeSize, cubeSize);
        } else {
            ctx.fillStyle = "#000";
            ctx.fillRect(cx - cubeSize / 2, cy - cubeSize / 2, cubeSize, cubeSize);
            ctx.font = "32px monospace";
            ctx.fillStyle = "#faf741";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText((i + 1).toString(), cx, cy);
        }
    }
}


function redrawCubesOnly() {
    if (
        window.lastEllipses &&
        window.lastCanvas &&
        window.lastCtx
    ) {
        blurBackground(window.lastCanvas, window.lastCtx, window.lastBg);
        const brown = getUniformBrown();
        drawEllipses(window.lastCtx, window.lastEllipses, brown);
        drawEllipseBorders(window.lastCtx, window.lastEllipses);
        drawEllipseLines(window.lastCtx, window.lastEllipses, brown);

        // Always draw all cubes (pfp at selected index, black cubes at others)
        drawLabeledSquaresInEllipse(window.lastCtx, window.lastEllipses[0]);

        drawGoal(window.lastCtx, window.lastEllipses[window.lastEllipses.length - 1], window.lastGoalImg);

        window.staticBoardCanvas = document.createElement('canvas');
        window.staticBoardCanvas.width = window.lastCanvas.width;
        window.staticBoardCanvas.height = window.lastCanvas.height;
        window.staticBoardCanvas.getContext('2d').drawImage(window.lastCanvas, 0, 0);
    }
}

function setupStartRaceButton() {
    const startBtn = document.querySelectorAll('#control-menu button')[1];
    if (startBtn) {
        startBtn.onclick = startRace;
    }
}

function startRace() {
    if (!window.lastEllipses) return;
    window.raceActive = true;
    redrawCubesOnly();

    const ellipse = window.lastEllipses[0];
    const ballRadius = 24; // Half of previous cube size
    const radius = Math.min(ellipse.rx, ellipse.ry) - ballRadius * 2;

    window.movingCubes = [];
    for (let i = 0; i < 8; i++) {
        const img = window.selectedProfileImages[i];
        if (!img) continue;

        const angle = (2 * Math.PI / 8) * i;
        const cx = ellipse.x + radius * Math.cos(angle);
        const cy = ellipse.y + radius * Math.sin(angle);

        window.movingCubes.push({
            x: cx,
            y: cy,
            direction: getRandomDirection(),
            speed: 2,
            radius: ballRadius,
            profileImage: img
        });
    }

    if (window.movingCubes.length > 0) {
        requestAnimationFrame(animateBalls);
    }
}

function animateBalls() {
    if (!window.lastCanvas || !window.lastCtx || !window.lastEllipses || !window.staticBoardCanvas) return;

    window.lastCtx.clearRect(0, 0, window.lastCanvas.width, window.lastCanvas.height);
    window.lastCtx.drawImage(window.staticBoardCanvas, 0, 0);

    const balls = window.movingCubes;
    const ellipses = window.lastEllipses;
    const lineWidth = window.lastLineWidth || 100;

    // Move balls and handle wall/track collision
    balls.forEach((ball) => {
        const nextX = ball.x + ball.direction.dx * ball.speed;
        const nextY = ball.y + ball.direction.dy * ball.speed;

        // Check if the center of the ball is inside the track (ellipse or line)
        let valid = false;
        for (const e of ellipses) {
            const dx = nextX - e.x;
            const dy = nextY - e.y;
            const norm = (dx * dx) / ((e.rx - ball.radius) * (e.rx - ball.radius)) + (dy * dy) / ((e.ry - ball.radius) * (e.ry - ball.radius));
            if (norm <= 1) valid = true;
        }
        // Check lines between ellipses
        for (let i = 0; i < ellipses.length - 1; i++) {
            const e1 = ellipses[i], e2 = ellipses[i + 1];
            const px = nextX, py = nextY;
            const x1 = e1.x, y1 = e1.y, x2 = e2.x, y2 = e2.y;
            const A = px - x1, B = py - y1, C = x2 - x1, D = y2 - y1;
            const dot = A * C + B * D;
            const len_sq = C * C + D * D;
            let param = len_sq !== 0 ? dot / len_sq : -1;
            let xx, yy;
            if (param < 0) { xx = x1; yy = y1; }
            else if (param > 1) { xx = x2; yy = y2; }
            else { xx = x1 + param * C; yy = y1 + param * D; }
            const dxl = px - xx, dyl = py - yy;
            const dist = Math.sqrt(dxl * dxl + dyl * dyl);
            if (dist <= lineWidth / 2 - ball.radius) valid = true;
        }

        if (valid) {
            ball.x = nextX;
            ball.y = nextY;
        } else {
            // Bounce off wall: reverse direction with random offset
            const currentAngle = Math.atan2(ball.direction.dy, ball.direction.dx);
            const randomOffset = (Math.random() - 0.5) * Math.PI;
            const newAngle = currentAngle + Math.PI + randomOffset;
            ball.direction.dx = Math.cos(newAngle);
            ball.direction.dy = Math.sin(newAngle);
            if (ball.speed < 1) ball.speed = 2;
        }
    });

    // Ball-to-ball collision and bounce (circular hitbox)
    for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
            const b1 = balls[i], b2 = balls[j];
            const dx = b2.x - b1.x;
            const dy = b2.y - b1.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < b1.radius + b2.radius) {
                // Bounce with random offset
                const angle = Math.atan2(dy, dx);
                const randomOffset = (Math.random() - 0.5) * Math.PI;
                const bounceAngle1 = angle + Math.PI + randomOffset;
                const bounceAngle2 = angle + randomOffset;

                b1.direction.dx = Math.cos(bounceAngle1);
                b1.direction.dy = Math.sin(bounceAngle1);
                b2.direction.dx = Math.cos(bounceAngle2);
                b2.direction.dy = Math.sin(bounceAngle2);

                if (b1.speed < 1) b1.speed = 2;
                if (b2.speed < 1) b2.speed = 2;

                // Separate balls to avoid sticking
                const overlap = b1.radius + b2.radius - dist;
                const sepX = (dx / dist) * (overlap / 2);
                const sepY = (dy / dist) * (overlap / 2);
                b1.x -= sepX;
                b1.y -= sepY;
                b2.x += sepX;
                b2.y += sepY;
            }
        }
    }

    // Check for goal collision
    let winnerBall = null;
    const goalEllipse = ellipses[ellipses.length - 1];
    const goalCenterX = goalEllipse.x;
    const goalCenterY = goalEllipse.y;
    const goalHitboxRadius = 32; // px, matches the goal image size

    balls.forEach((ball) => {
        const dx = ball.x - goalCenterX;
        const dy = ball.y - goalCenterY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= goalHitboxRadius) {
            winnerBall = ball;
        }
    });
    if (winnerBall) {
        endRace(winnerBall);
        return;
    }

    // Draw pfps as squares (no border)
    balls.forEach((ball) => {
        window.lastCtx.drawImage(
            ball.profileImage,
            ball.x - ball.radius,
            ball.y - ball.radius,
            ball.radius * 2,
            ball.radius * 2
        );
    });

    requestAnimationFrame(animateBalls);
}

function endRace(winnerBall) {
    window.raceActive = false;
    window.movingCubes = [];

    const ctx = window.lastCtx;
    const canvas = window.lastCanvas;
    const bg = window.lastBg;

    // Prepare blurred background
    const offCanvas = document.createElement('canvas');
    offCanvas.width = canvas.width;
    offCanvas.height = canvas.height;
    const offCtx = offCanvas.getContext('2d');
    offCtx.filter = 'blur(8px)';
    offCtx.drawImage(bg, 0, 0, canvas.width, canvas.height);

    // Find winner index
    let winnerIndex = -1;
    for (let i = 0; i < 8; i++) {
        if (window.selectedProfileImages[i] === winnerBall.profileImage) {
            winnerIndex = i;
            break;
        }
    }
    const message = winnerMessages[winnerIndex >= 0 ? winnerIndex : 0];
    const playerBgImg = window.playerBgImages[winnerIndex >= 0 ? winnerIndex : 0];
    const imgHeight = canvas.height * 0.75; // 75% of canvas height

    function startFadeWinner() {
        const imgWidth = playerBgImg.width * (imgHeight / playerBgImg.height);
        const imgX = (canvas.width - imgWidth) / 2;
        const imgY = canvas.height - imgHeight;

        let opacity = 0;
        function fadeWinner() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(offCanvas, 0, 0);
            ctx.drawImage(playerBgImg, imgX, imgY, imgWidth, imgHeight);

            ctx.save();
            ctx.globalAlpha = opacity;
            ctx.drawImage(
                winnerBall.profileImage,
                canvas.width / 2 - 120,
                canvas.height / 2 - 200,
                240, 240
            );
            ctx.restore();

            if (opacity < 1) {
                opacity += 0.02;
                requestAnimationFrame(fadeWinner);
            } else {
                ctx.font = "bold 64px monospace";
                ctx.fillStyle = "#f74bfa";
                ctx.textAlign = "left";
                ctx.textBaseline = "bottom";
                ctx.fillText(message, 40, canvas.height - 40);
            }
        }
        fadeWinner();
    }

    // Only start fade when image is loaded
    if (playerBgImg.complete && playerBgImg.naturalWidth !== 0) {
        startFadeWinner();
    } else {
        playerBgImg.onload = startFadeWinner;
    }
}