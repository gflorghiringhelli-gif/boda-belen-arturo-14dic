let musicaTocando = false;

function activarInvitacion() {
    const contenedorPrincipal = document.getElementById('contenedor-principal');
    const seccionFinal = document.getElementById('seccion-final');
    const audio = document.getElementById('musicaInvitacion');
    const videoSobre = document.getElementById('videoSobre');
    const musicBtn = document.getElementById('music-toggle');

    videoSobre.play().catch(err => {
        console.log("Video autoplay prevented:", err);
    });

    audio.play().then(() => {
        musicaTocando = true;
        musicBtn.classList.add('playing');
    }).catch(err => {
        console.log("Audio bloqueado:", err);
    });

    setTimeout(() => {
        contenedorPrincipal.style.opacity = '0';
        contenedorPrincipal.style.transform = 'scale(1.05)';
        setTimeout(() => {
            contenedorPrincipal.style.display = 'none';
            seccionFinal.classList.remove('oculto');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            inicializarRaspaditas();
        }, 600);
    }, 1500);
}

function toggleMusic() {
    const audio = document.getElementById('musicaInvitacion');
    const musicBtn = document.getElementById('music-toggle');
    
    if (musicaTocando) {
        audio.pause();
        musicaTocando = false;
        musicBtn.classList.remove('playing');
    } else {
        audio.play();
        musicaTocando = true;
        musicBtn.classList.add('playing');
    }
}

// COPIAR DATOS BANCARIOS
function copiarDatosBancarios() {
    const textoACopiar = "Banco Familiar\nCaja de Ahorro N.º 0-13158440\nAlias: 0986178893\nTitular: Ana Belén Medina Ortiz";
    
    navigator.clipboard.writeText(textoACopiar).then(() => {
        const toast = document.getElementById('toast');
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }).catch(err => {
        console.error('Error al copiar: ', err);
    });
}

// CUENTA REGRESIVA 19/12/2026
const fechaBoda = new Date('2026-12-19T20:00:00').getTime();

function actualizarCuentaRegresiva() {
    const ahora = new Date().getTime();
    const diferencia = fechaBoda - ahora;

    if (diferencia > 0) {
        const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
        const horas = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
        const segundos = Math.floor((diferencia % (1000 * 60)) / 1000);

        document.querySelectorAll('.cd-days-val').forEach(el => el.innerText = String(dias).padStart(2, '0'));
        document.querySelectorAll('.cd-hours-val').forEach(el => el.innerText = String(horas).padStart(2, '0'));
        document.querySelectorAll('.cd-mins-val').forEach(el => el.innerText = String(minutos).padStart(2, '0'));
        document.querySelectorAll('.cd-secs-val').forEach(el => el.innerText = String(segundos).padStart(2, '0'));
    }
}
setInterval(actualizarCuentaRegresiva, 1000);

// SISTEMA DE RASPADITA REAL CON CANVAS
let circulosRevelados = 0;
let totalCanvas = 3;

function inicializarRaspaditas() {
    const canvases = document.querySelectorAll('.scratch-canvas');
    
    canvases.forEach(canvas => {
        const ctx = canvas.getContext('2d');
        canvas.width = canvas.offsetWidth || 88;
        canvas.height = canvas.offsetHeight || 88;

        ctx.fillStyle = '#bdbda7';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#2c3528';
        ctx.font = '11px Montserrat, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('RASPÁ', canvas.width / 2, canvas.height / 2);

        let isDrawing = false;
        let reveladoCompleto = false;

        function raspar(x, y) {
            if (reveladoCompleto) return;
            ctx.globalCompositeOperation = 'destination-out';
            ctx.beginPath();
            ctx.arc(x, y, 16, 0, Math.PI * 2);
            ctx.fill();

            verificarPorcentaje(canvas);
        }

        function getMousePos(e) {
            const rect = canvas.getBoundingClientRect();
            return {
                x: (e.clientX || e.touches[0].clientX) - rect.left,
                y: (e.clientY || e.touches[0].clientY) - rect.top
            };
        }

        canvas.addEventListener('mousedown', (e) => {
            isDrawing = true;
            const pos = getMousePos(e);
            raspar(pos.x, pos.y);
        });

        canvas.addEventListener('mousemove', (e) => {
            if (!isDrawing) return;
            const pos = getMousePos(e);
            raspar(pos.x, pos.y);
        });

        window.addEventListener('mouseup', () => {
            isDrawing = false;
        });

        canvas.addEventListener('touchstart', (e) => {
            isDrawing = true;
            const pos = getMousePos(e);
            raspar(pos.x, pos.y);
            e.preventDefault();
        }, { passive: false });

        canvas.addEventListener('touchmove', (e) => {
            if (!isDrawing) return;
            const pos = getMousePos(e);
            raspar(pos.x, pos.y);
            e.preventDefault();
        }, { passive: false });

        canvas.addEventListener('touchend', () => {
            isDrawing = false;
        });

        function verificarPorcentaje(cv) {
            if (reveladoCompleto) return;
            const imgData = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height);
            let transparentes = 0;
            const totalPixels = imgData.data.length / 4;

            for (let i = 3; i < imgData.data.length; i += 4) {
                if (imgData.data[i] < 50) {
                    transparentes++;
                }
            }

            if (transparentes / totalPixels > 0.45) {
                reveladoCompleto = true;
                cv.style.transition = 'opacity 0.6s ease';
                cv.style.opacity = '0';
                setTimeout(() => cv.remove(), 600);

                circulosRevelados++;
                const rect = cv.getBoundingClientRect();
                lanzarPetalosDesdePunto(rect.left + rect.width / 2, rect.top + rect.height / 2);

                if (circulosRevelados >= totalCanvas) {
                    const desplegable = document.getElementById('seccion-desplegable');
                    if (desplegable) {
                        desplegable.classList.add('activo');
                    }
                }
            }
        }
    });
}

// ANIMACIÓN DE PÉTALOS DESDE EL CÍRCULO
function lanzarPetalosDesdePunto(startX, startY) {
    const canvas = document.getElementById('petalsCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let petalos = [];
    for (let i = 0; i < 25; i++) {
        const angle = Math.random() * Math.PI - Math.PI / 2;
        const speed = Math.random() * 6 + 2;
        petalos.push({
            x: startX,
            y: startY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 2,
            w: Math.random() * 14 + 8,
            h: Math.random() * 8 + 5,
            gravity: 0.2,
            rotation: Math.random() * 360,
            rotationSpeed: Math.random() * 4 - 2,
            opacity: 1
        });
    }

    function animar() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let activas = false;

        petalos.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity;
            p.rotation += p.rotationSpeed;
            p.opacity -= 0.015;

            if (p.opacity > 0) {
                activas = true;
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate((p.rotation * Math.PI) / 180);
                ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(p.opacity, 0)})`;
                ctx.beginPath();
                ctx.ellipse(0, 0, p.w, p.h, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        });

        if (activas) {
            requestAnimationFrame(animar);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }

    animar();
}

// OBSERVER PARA LAS ANIMACIONES DE SCROLL (FADE-IN)
document.addEventListener("DOMContentLoaded", function() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.12 });

    document.querySelectorAll('.reveal-on-scroll').forEach(section => {
        observer.observe(section);
    });
});