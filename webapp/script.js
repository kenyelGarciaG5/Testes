const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const info = document.getElementById('info');
let drawing = false;
let points = [];

// audio context
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function getFrequency(y) {
    const minFreq = 220; // A3
    const maxFreq = 880; // A5
    const ratio = 1 - y / canvas.height;
    return minFreq + (maxFreq - minFreq) * ratio;
}

function playSound(path) {
    let startTime = audioCtx.currentTime;
    path.forEach((p, i) => {
        const osc = audioCtx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = getFrequency(p.y);
        osc.connect(audioCtx.destination);
        const duration = 0.1;
        osc.start(startTime + i * duration);
        osc.stop(startTime + (i + 1) * duration);
    });
}

canvas.addEventListener('pointerdown', e => {
    drawing = true;
    points = [];
    ctx.beginPath();
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.moveTo(x, y);
    points.push({x, y});
});

canvas.addEventListener('pointermove', e => {
    if (!drawing) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
    points.push({x, y});
});

canvas.addEventListener('pointerup', () => {
    drawing = false;
    playSound(points);
    const explanation = `O desenho foi convertido em som associando a posicao vertical de cada ponto a uma frequencia entre 220 Hz e 880 Hz. Assim, partes mais altas soam mais agudas.`;
    info.textContent = explanation;
});
