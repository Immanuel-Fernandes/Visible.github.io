document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const textInput = document.getElementById('text-input');
    const styleSelect = document.getElementById('style-select');
    const sizeSlider = document.getElementById('size-slider');
    const spacingSlider = document.getElementById('spacing-slider');
    const curveSlider = document.getElementById('curve-slider');
    const rotationSlider = document.getElementById('rotation-slider');
    const alignSlider = document.getElementById('align-slider');
    const animationSelect = document.getElementById('animation-select');
    const sizeValue = document.getElementById('size-value');
    const spacingValue = document.getElementById('spacing-value');
    const curveValue = document.getElementById('curve-value');
    const rotationValue = document.getElementById('rotation-value');
    const alignValue = document.getElementById('align-value');
    
    const previewCanvas = document.getElementById('preview-canvas');
    const renderCanvas = document.getElementById('render-canvas');
    const previewCtx = previewCanvas.getContext('2d');
    const renderCtx = renderCanvas.getContext('2d');
    
    const downloadPngBtn = document.getElementById('download-png-btn');
    const downloadGifBtn = document.getElementById('download-gif-btn');

    // --- State & Config ---
    const state = {
        text: 'I.M.A.G.E.',
        style: 'style1',
        size: 1,
        spacing: 0,
        curve: 0,
        rotation: 0,
        vOffset: 0,
        animation: 'None',
        images: {},
        animationFrameId: null,
    };

   const charMap = {
        '!': '!.png', '&': '&.png', ',': ',.png', '-': '-.png', 
        '0': '0.png', '1': '1.png', '2': '2.png', '3': '3.png', 
        '4': '4.png', '5': '5.png', '6': '6.png', '7': '7.png', 
        '8': '8.png', '9': '9.png', '.': 'Dot.png', '+': '+.png',
        'A': 'A.png', 'B': 'B.png', 'C': 'C.png', 'D': 'D.png', 
        'E': 'E.png', 'F': 'F.png', 'G': 'G.png', 'H': 'H.png', 
        'I': 'I.png', 'J': 'J.png', 'K': 'K.png', 'L': 'L.png', 
        'M': 'M.png', 'N': 'N.png', 'O': 'O.png', 'P': 'P.png', 
        'Q': 'Q.png', 'R': 'R.png', 'S': 'S.png', 'T': 'T.png', 
        'U': 'U.png', 'V': 'V.png', 'W': 'W.png', 'X': 'X.png', 
        'Y': 'Y.png', 'Z': 'Z.png', 
        '?': 'QM.png', '/': 'SL.png', ' ': 'SP.png'
    };
    
    // --- Animation Logic ---
    // p is progress (0-1), i is char index, n is total chars
    const PI = Math.PI;
    const animationEffects = {
        'None': (p,i,n) => ({}),
        'Beat': (p,i,n) => ({ scale: 1 + Math.sin(p * PI * 2) * 0.15 }),
        'Blink': (p,i,n) => ({ alpha: p < 0.5 ? 1 : 0 }),
        'Blur': (p,i,n) => ({ blur: Math.sin(p * PI) * 5 }),
        'Bounce': (p,i,n) => ({ y: -Math.abs(Math.sin(p * PI * 2)) * 20 }),
        'Breathe': (p,i,n) => ({ scale: 1 + Math.sin(p * PI * 2) * 0.05 }),
        'Clock': (p,i,n) => ({ rotation: p * 360 }),
        'Damage': (p,i,n) => ({ x: (Math.random()-0.5)*8, y: (Math.random()-0.5)*8, alpha: Math.random() > 0.1 ? 1 : 0.5 }),
        'Fade': (p,i,n) => ({ alpha: Math.sin(p * PI) }),
        'Floating': (p,i,n) => ({ y: Math.sin(p * PI * 2 + i * 0.5) * 10 }),
        'Heartbeat': (p,i,n) => ({ scale: p < 0.1 ? 1.2 : (p < 0.2 ? 1 : (p < 0.3 ? 1.2 : 1)) }),
        'Flip': (p,i,n) => ({ scaleY: Math.cos(p * PI * 2) }),
        'Horizontal Coin': (p,i,n) => ({ scaleX: Math.cos(p * PI * 2) }),
        'Horizontal Flip': (p,i,n) => ({ scaleX: p < 0.5 ? 1 : -1 }),
        'Horizontal Rubber': (p,i,n) => ({ scaleX: 1 + Math.sin(p * PI * 2) * 0.2 }),
        'Horizontal Shake': (p,i,n) => ({ x: Math.sin(p * PI * 16) * 5 }),
        'Horizontal Wander': (p,i,n) => ({ x: Math.sin(p * PI * 2 + i * 0.5) * 15 }),
        'Jelly': (p,i,n) => { const s = 1 + Math.sin(p * PI * 2) * 0.1; return { scaleX: s, scaleY: 1/s }; },
        'Jelly 2': (p,i,n) => { const s = 1 + Math.sin(p * PI * 2 + i*0.5) * 0.2; return { scaleX: 1/s, scaleY: s }; },
        'Jingle': (p,i,n) => ({ rotation: Math.sin(p * PI * 8 + i*0.5) * 15 }),
        'Jump': (p,i,n) => ({ y: p < 0.5 ? -Math.sin(p * PI * 2) * 20 : 0 }),
        'Left Rotation': (p,i,n) => ({ rotation: -p * 360 }),
        'Rifle': (p,i,n) => ({ x: p < 0.1 ? -15 : 0 }),
        'Right Cycle': (p,i,n) => { const prog = (p + i/n) % 1; return { alpha: prog < 0.2 ? 1 : 0.3 }; },
        'Shake': (p,i,n) => ({ x: (Math.random()-0.5)*5, y: (Math.random()-0.5)*5 }),
        'Shiver': (p,i,n) => ({ x: Math.sin(p * PI * 20) * 2 }),
        'Skew': (p,i,n) => ({ skewX: Math.sin(p * PI * 2) * 20 }),
        'Skew 2': (p,i,n) => ({ skewX: Math.sin(p * PI * 2 + i*0.5) * 20, skewY: Math.cos(p * PI * 2 + i*0.5) * 20 }),
        'Slide Down': (p,i,n) => ({ y: p < 0.5 ? (1 - p*2) * -50 : 0, alpha: p < 0.5 ? p*2 : 1 }),
        'Slide Left': (p,i,n) => ({ x: p < 0.5 ? (1 - p*2) * 50 : 0, alpha: p < 0.5 ? p*2 : 1 }),
        'Slide Right': (p,i,n) => ({ x: p < 0.5 ? (1 - p*2) * -50 : 0, alpha: p < 0.5 ? p*2 : 1 }),
        'Slide Up': (p,i,n) => ({ y: p < 0.5 ? (1 - p*2) * 50 : 0, alpha: p < 0.5 ? p*2 : 1 }),
        'Smash': (p,i,n) => ({ scaleY: p < 0.1 ? 0.5 : 1, scaleX: p < 0.1 ? 1.5 : 1 }),
        'Spin': (p,i,n) => ({ rotation: p * 360 }),
        'Squeeze': (p,i,n) => ({ scaleX: 1 - Math.sin(p * PI * 2) * 0.2 }),
        'Surprise': (p,i,n) => ({ scale: p < 0.2 ? 1.3 : 1 }),
        'Swim': (p,i,n) => ({ x: Math.sin(p * PI * 2 + i*0.5) * 10, rotation: Math.sin(p * PI * 2 + i*0.5) * 10 }),
        'Tick': (p,i,n) => ({ rotation: p < 0.5 ? 10 : -10 }),
        'Tick 2': (p,i,n) => ({ rotation: p < 0.2 ? 10 : (p < 0.4 ? -10 : 0) }),
        'Tremor': (p,i,n) => ({ x: (Math.random()-0.5)*3, y: (Math.random()-0.5)*3, rotation: (Math.random()-0.5)*3 }),
        'Vertical Coin': (p,i,n) => ({ scaleY: Math.cos(p * PI * 2) }),
        'Vertical Flip': (p,i,n) => ({ scaleY: p < 0.5 ? 1 : -1 }),
        'Vertical Rubber': (p,i,n) => ({ scaleY: 1 + Math.sin(p * PI * 2) * 0.2 }),
        'Vertical Shake': (p,i,n) => ({ y: Math.sin(p * PI * 16) * 5 }),
        'Vertical Wander': (p,i,n) => ({ y: Math.sin(p * PI * 2 + i * 0.5) * 15 }),
        'Vortex': (p,i,n) => ({ x: Math.sin(p*PI*2)*50, y: Math.cos(p*PI*2)*50, alpha: 1-p, scale: 1-p }),
        'Vortex 2': (p,i,n) => ({ x: Math.sin(p*PI*2+i*0.5)*50, y: Math.cos(p*PI*2+i*0.5)*50, rotation: p*360, alpha: 1-p }),
    };

    // --- Core Functions ---

    function populateAnimations() {
        animationSelect.innerHTML = Object.keys(animationEffects).map(a => `<option value="${a}">${a}</option>`).join('');
    }

    async function loadCharImages() {
        const fontPath = `fonts/${state.style}/`;
        const promises = Object.entries(charMap).map(([char, file]) => {
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = () => resolve({ char, img });
                img.onerror = () => resolve({ char, img: null });
                img.src = `${fontPath}${file}`;
            });
        });
        const results = await Promise.all(promises);
        state.images = results.reduce((acc, { char, img }) => {
            if (img) acc[char] = img;
            return acc;
        }, {});
    }

    function getTransform(progress, charIndex, totalChars) {
        const effect = animationEffects[state.animation];
        if (!effect) return {};
        // Stagger per-character animations
        const staggeredProgress = (progress + (charIndex / totalChars) * 0.3) % 1;
        return effect(staggeredProgress, charIndex, totalChars);
    }
    
    function drawText(ctx, canvas, frameProgress = 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const chars = state.text.toUpperCase().split('').filter(c => state.images[c]);
        if (chars.length === 0) return;

        const { size, spacing, curve, rotation, vOffset } = state;
        const charData = chars.map(c => ({
            img: state.images[c],
            width: state.images[c].width * size,
            height: state.images[c].height * size
        }));

        const totalWidth = charData.reduce((sum, char) => sum + char.width, 0) + (chars.length - 1) * spacing;
        const maxHeight = Math.max(...charData.map(c => c.height));
        
        canvas.width = totalWidth + 150;
        canvas.height = maxHeight + Math.abs(curve) * 2 + 150;
        
        ctx.save();
        // Global transforms: Alignment and Rotation
        ctx.translate(canvas.width / 2, canvas.height / 2 + vOffset);
        ctx.rotate(rotation * Math.PI / 180);

        if (curve !== 0) {
            const radius = (totalWidth * 2) / (Math.abs(curve)/50);
            let currentAngle = -totalWidth / (2 * radius);

            charData.forEach((char, i) => {
                const arcLength = (char.width / 2) / radius;
                currentAngle += arcLength;
                
                const anim = getTransform(frameProgress, i, chars.length);
                ctx.save();
                ctx.rotate(currentAngle * (curve > 0 ? 1 : -1));
                const yPos = curve > 0 ? -radius : radius;
                
                drawCharWithTransform(ctx, char.img, -char.width / 2, yPos, char.width, char.height, anim);
                ctx.restore();
                
                const nextArcLength = (char.width / 2 + (i < charData.length -1 ? spacing : 0)) / radius;
                currentAngle += nextArcLength;
            });
        } else { // Linear text
            let currentX = -totalWidth / 2;
            charData.forEach((char, i) => {
                const anim = getTransform(frameProgress, i, chars.length);
                drawCharWithTransform(ctx, char.img, currentX, 0, char.width, char.height, anim);
                currentX += char.width + spacing;
            });
        }
        ctx.restore();
    }
    
    function drawCharWithTransform(ctx, img, x, y, w, h, anim) {
        ctx.save();
        const finalX = x + (anim.x || 0);
        const finalY = y + (anim.y || 0);
        ctx.translate(finalX + w / 2, finalY + h / 2);

        if (anim.rotation) ctx.rotate(anim.rotation * Math.PI / 180);
        if (anim.skewX) ctx.transform(1, 0, anim.skewX * Math.PI / 180, 1, 0, 0);
        if (anim.skewY) ctx.transform(1, anim.skewY * Math.PI / 180, 0, 1, 0, 0);
        if (anim.scaleX || anim.scaleY) ctx.scale(anim.scaleX || 1, anim.scaleY || 1);
        if (anim.scale) ctx.scale(anim.scale, anim.scale);
        
        ctx.globalAlpha = anim.alpha !== undefined ? anim.alpha : 1;
        if (anim.blur) ctx.filter = `blur(${anim.blur}px)`;
        
        ctx.drawImage(img, -w / 2, -h / 2, w, h);
        ctx.restore();
    }

    function startPreviewAnimation() {
        if (state.animationFrameId) cancelAnimationFrame(state.animationFrameId);
        
        let startTime = null;
        const duration = state.animation === 'None' ? 1 : 2000;

        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const progress = (elapsed % duration) / duration;
            
            drawText(previewCtx, previewCanvas, state.animation === 'None' ? 0 : progress);
            state.animationFrameId = requestAnimationFrame(animate);
        };
        state.animationFrameId = requestAnimationFrame(animate);
    }
    
    function handleDownloadPNG() {
        drawText(renderCtx, renderCanvas, 0); // Draw a single static frame
        const link = document.createElement('a');
        link.download = `${state.text.toLowerCase().replace(/[^a-z0-9]/g, '_')}.png`;
        link.href = renderCanvas.toDataURL('image/png');
        link.click();
    }
    
    function handleDownloadGIF() {
        if (state.animation === 'None') {
            alert("Please select an animation to export a GIF.");
            return;
        }
        downloadGifBtn.disabled = true;
        downloadPngBtn.disabled = true;
        downloadGifBtn.textContent = 'Generating...';

        const gif = new GIF({
            workers: 2,
            quality: 10,
            workerScript: 'js/gif.worker.js',
            width: renderCanvas.width,
            height: renderCanvas.height,
        });

        const frames = 60; // 30fps for 2 seconds
        const delay = 1000 / 30;

        for (let i = 0; i < frames; i++) {
            const progress = i / frames;
            drawText(renderCtx, renderCanvas, progress);
            gif.addFrame(renderCtx, { copy: true, delay });
        }

        gif.on('finished', (blob) => {
            const link = document.createElement('a');
            link.download = `${state.text.toLowerCase().replace(/[^a-z0-9]/g, '_')}.gif`;
            link.href = URL.createObjectURL(blob);
            link.click();
            downloadGifBtn.disabled = false;
            downloadPngBtn.disabled = false;
            downloadGifBtn.textContent = 'Download as GIF';
        });

        gif.render();
    }

    // --- Event Handlers & Initial Setup ---
    function updateState(newState) {
        const needsReload = newState.style && newState.style !== state.style;
        Object.assign(state, newState);
        
        if (needsReload) {
            loadCharImages().then(startPreviewAnimation);
        } else if (newState.animation) {
            startPreviewAnimation();
        }
    }
    
    textInput.addEventListener('input', (e) => updateState({ text: e.target.value || 'ANIMATE' }));
    styleSelect.addEventListener('change', (e) => updateState({ style: e.target.value }));
    sizeSlider.addEventListener('input', (e) => {
        updateState({ size: parseFloat(e.target.value) });
        sizeValue.textContent = `${state.size.toFixed(1)}x`;
    });
    spacingSlider.addEventListener('input', (e) => {
        updateState({ spacing: parseInt(e.target.value) });
        spacingValue.textContent = `${state.spacing}px`;
    });
    curveSlider.addEventListener('input', (e) => {
        updateState({ curve: parseInt(e.target.value) });
        curveValue.textContent = state.curve;
    });
    rotationSlider.addEventListener('input', (e) => {
        updateState({ rotation: parseInt(e.target.value) });
        rotationValue.textContent = `${state.rotation}°`;
    });
    alignSlider.addEventListener('input', (e) => {
        updateState({ vOffset: parseInt(e.target.value) });
        alignValue.textContent = `${state.vOffset}px`;
    });
    animationSelect.addEventListener('change', (e) => updateState({ animation: e.target.value }));

    downloadPngBtn.addEventListener('click', handleDownloadPNG);
    downloadGifBtn.addEventListener('click', handleDownloadGIF);

    // Initialize the app
    populateAnimations();
    textInput.value = state.text;
    sizeValue.textContent = `${state.size.toFixed(1)}x`;
    spacingValue.textContent = `${state.spacing}px`;
    curveValue.textContent = state.curve;
    rotationValue.textContent = `${state.rotation}°`;
    alignValue.textContent = `${state.vOffset}px`;
    loadCharImages().then(startPreviewAnimation);
});
