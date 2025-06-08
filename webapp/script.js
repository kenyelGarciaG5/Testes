const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const info = document.getElementById('info');
const clearBtn = document.getElementById('clear');

let drawing = false;
let points = [];

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function drawToWave(path) {
    const width = canvas.width;
    const height = canvas.height;
    const sampleRate = audioCtx.sampleRate;
    const duration = 1; // seconds
    const sampleCount = sampleRate * duration;
    const temp = new Float32Array(width).fill(height / 2);

    for (let i = 0; i < path.length - 1; i++) {
        const p0 = path[i];
        const p1 = path[i + 1];
        const dx = p1.x - p0.x;
        const steps = Math.max(Math.abs(dx), 1);
        for (let s = 0; s <= steps; s++) {
            const t = s / steps;
            const x = Math.round(p0.x + dx * t);
            const y = p0.y + (p1.y - p0.y) * t;
            if (x >= 0 && x < width) {
                temp[x] = y;
            }
        }
    }

    const buffer = audioCtx.createBuffer(1, sampleCount, sampleRate);
    const channel = buffer.getChannelData(0);
    for (let i = 0; i < sampleCount; i++) {
        const x = i * width / sampleCount;
        const idx = Math.floor(x);
        const nextIdx = Math.min(idx + 1, width - 1);
        const frac = x - idx;
        const y = temp[idx] + (temp[nextIdx] - temp[idx]) * frac;
        channel[i] = (height / 2 - y) / (height / 2);
    }
    return buffer;
}

function playBuffer(buffer) {
    const src = audioCtx.createBufferSource();
    src.buffer = buffer;
    src.connect(audioCtx.destination);
    src.start();
}

function getPos(evt) {
    const rect = canvas.getBoundingClientRect();
    const clientX = evt.touches ? evt.touches[0].clientX : evt.clientX;
    const clientY = evt.touches ? evt.touches[0].clientY : evt.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
}

function startDraw(e) {
    e.preventDefault();
    drawing = true;
    points = [];
    ctx.beginPath();
    const { x, y } = getPos(e);
    ctx.moveTo(x, y);
    points.push({ x, y });
}

function moveDraw(e) {
    if (!drawing) return;
    e.preventDefault();
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    points.push({ x, y });
}

function endDraw() {
    drawing = false;
    if (points.length < 2) return;
    const buffer = drawToWave(points);
    playBuffer(buffer);
    info.textContent = `A forma desenhada foi interpretada como uma onda sonora de 1 segundo. O eixo x representa o tempo e o eixo y a amplitude entre -1 e 1. A onda é reproduzida a ${audioCtx.sampleRate} Hz.`;
}

['pointerdown', 'mousedown', 'touchstart'].forEach(evt =>
    canvas.addEventListener(evt, startDraw));
['pointermove', 'mousemove', 'touchmove'].forEach(evt =>
    canvas.addEventListener(evt, moveDraw));
['pointerup', 'mouseup', 'touchend', 'touchcancel'].forEach(evt =>
    canvas.addEventListener(evt, endDraw));

clearBtn.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    info.textContent = '';
});
