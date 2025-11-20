document.addEventListener('DOMContentLoaded', () => {
    const rueda = document.getElementById('rueda');
    const girarBtn = document.getElementById('girarBtn');
    const resultadoDisplay = document.getElementById('resultado');
    const saldoDisplay = document.getElementById('saldoActual');
    const limpiarApuestaBtn = document.getElementById('limpiarApuestaBtn');
    const fichas = document.querySelectorAll('.ficha');
    const celdasApuesta = document.querySelectorAll('.celda-apuesta');
    const numerosRecientes = document.getElementById('numerosRecientes');

    const numerosRuleta = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
    const numSectores = numerosRuleta.length;
    const gradosPorSector = 360 / numSectores;

    const coloresNumeros = {
        0: 'green', 32: 'red', 15: 'black', 19: 'red', 4: 'black', 21: 'red',
        2: 'black', 25: 'red', 17: 'black', 34: 'red', 6: 'black', 27: 'red',
        13: 'black', 36: 'red', 11: 'black', 30: 'red', 8: 'black', 23: 'red',
        10: 'black', 5: 'red', 24: 'black', 16: 'red', 33: 'black', 1: 'red',
        20: 'black', 14: 'red', 31: 'black', 9: 'red', 22: 'black', 18: 'red',
        29: 'black', 7: 'red', 28: 'black', 12: 'red', 35: 'black', 3: 'red', 26: 'black'
    };

    let girando = false;
    let numerosSalidos = [6, 15, 11, 33];
    let saldo = 1000;
    let apuestasActuales = {};
    let fichaSeleccionada = 100;

    function actualizarSaldo(monto) {
        saldo += monto;
        saldoDisplay.textContent = saldo.toFixed(2);
    }

    function actualizarNumerosRecientes() {
        numerosRecientes.innerHTML = '';
        numerosSalidos.slice(-4).forEach(numero => {
            const color = coloresNumeros[numero];
            const div = document.createElement('div');
            div.className = `numero-reciente ${color}`;
            div.textContent = numero;
            numerosRecientes.appendChild(div);
        });
    }

    function girarRuleta() {
        const totalApostado = Object.values(apuestasActuales).reduce((sum, val) => sum + val, 0);

        if (totalApostado === 0) {
            mostrarResultado('¡Coloca una apuesta antes de girar!', 'error');
            return;
        }
        if (girando) return;

        girando = true;
        mostrarResultado('¡Girando...!', 'info');

        const numeroGanador = numerosRuleta[Math.floor(Math.random() * numSectores)];
        const indiceGanador = numerosRuleta.indexOf(numeroGanador);

        const vueltasRueda = 8;
        const anguloGanador = 360 - indiceGanador * gradosPorSector - gradosPorSector / 2;
        const rotacionObjetivo = vueltasRueda * 360 + anguloGanador;

        rueda.style.transition = 'transform 3s cubic-bezier(0.2, 0.8, 0.4, 1)';
        rueda.style.transform = `rotate(${rotacionObjetivo}deg)`;

        rueda.ontransitionend = () => {
            girando = false;

            const gananciaNeta = calcularResultados(numeroGanador);
            actualizarSaldo(gananciaNeta);

            numerosSalidos.push(numeroGanador);
            actualizarNumerosRecientes();

            if (gananciaNeta > 0) {
                mostrarResultado(`¡GANASTE ${gananciaNeta.toFixed(2)}$! Número: ${numeroGanador}`, 'ganador');
            } else if (gananciaNeta < 0) {
                mostrarResultado(`Perdiste ${Math.abs(gananciaNeta).toFixed(2)}$. Número: ${numeroGanador}`, 'perdedor');
            } else {
                mostrarResultado(`Empate. Número: ${numeroGanador}`, 'info');
            }

            limpiarApuestas();

            setTimeout(() => {
                rueda.style.transition = 'none';
                rueda.style.transform = `rotate(${anguloGanador}deg)`;
                void rueda.offsetWidth;
            }, 80);
        };
    }

    function calcularResultados(numeroGanador) {
        let gananciaBruta = 0;
        let totalApostado = 0;
        const colorGanador = coloresNumeros[numeroGanador];
        const esPar = numeroGanador !== 0 && numeroGanador % 2 === 0;

        for (const apuesta in apuestasActuales) {
            const valorApostado = apuestasActuales[apuesta];
            totalApostado += valorApostado;
            let pago = 0;

            if (!isNaN(parseInt(apuesta)) && parseInt(apuesta) === numeroGanador) pago += valorApostado * 35;

            switch (apuesta) {
                case 'ROJO': if (colorGanador === 'red') pago += valorApostado * 1; break;
                case 'NEGRO': if (colorGanador === 'black') pago += valorApostado * 1; break;
                case 'EVEN': if (esPar) pago += valorApostado * 1; break;
                case 'ODD': if (!esPar && numeroGanador !== 0) pago += valorApostado * 1; break;
                case '1to18': if (numeroGanador >= 1 && numeroGanador <= 18) pago += valorApostado * 1; break;
                case '19to36': if (numeroGanador >= 19 && numeroGanador <= 36) pago += valorApostado * 1; break;
                case '1st12': if (numeroGanador >= 1 && numeroGanador <= 12) pago += valorApostado * 2; break;
                case '2nd12': if (numeroGanador >= 13 && numeroGanador <= 24) pago += valorApostado * 2; break;
                case '3rd12': if (numeroGanador >= 25 && numeroGanador <= 36) pago += valorApostado * 2; break;
                case '2to1-col1': if (numeroGanador % 3 === 1 && numeroGanador !== 0) pago += valorApostado * 2; break;
                case '2to1-col2': if (numeroGanador % 3 === 2) pago += valorApostado * 2; break;
                case '2to1-col3': if (numeroGanador % 3 === 0 && numeroGanador !== 0) pago += valorApostado * 2; break;
                case '0': if (numeroGanador === 0) pago += valorApostado * 35; break;
            }

            gananciaBruta += pago;
        }

        return gananciaBruta - totalApostado;
    }

    function mostrarResultado(mensaje, tipo) {
        resultadoDisplay.textContent = mensaje;
        resultadoDisplay.style.display = 'block';

        switch (tipo) {
            case 'ganador': resultadoDisplay.style.backgroundColor = '#008000'; resultadoDisplay.style.color = 'white'; break;
            case 'perdedor': resultadoDisplay.style.backgroundColor = 'red'; resultadoDisplay.style.color = 'white'; break;
            case 'error': resultadoDisplay.style.backgroundColor = 'red'; resultadoDisplay.style.color = 'white'; break;
            default: resultadoDisplay.style.backgroundColor = 'rgba(0,0,0,0.7)'; resultadoDisplay.style.color = 'yellow';
        }

        setTimeout(() => resultadoDisplay.style.display = 'none', 4000);
    }

    function colocarFichaVisual(celda, valor) {
        const fichaVisual = document.createElement('div');
        fichaVisual.classList.add('chip-on-table');
        fichaVisual.textContent = valor;

        const fichaEstilo = Array.from(fichas).find(f => parseInt(f.dataset.valor) === valor);
        if (fichaEstilo) fichaVisual.style.backgroundImage = fichaEstilo.style.backgroundImage;

        celda.appendChild(fichaVisual);
    }

    function limpiarApuestas() {
        apuestasActuales = {};
        document.querySelectorAll('.chip-on-table').forEach(chip => chip.remove());
    }

    fichas.forEach(ficha => {
        ficha.addEventListener('click', () => {
            fichas.forEach(f => f.classList.remove('seleccionada'));
            ficha.classList.add('seleccionada');
            fichaSeleccionada = parseInt(ficha.dataset.valor);
        });
    });

    celdasApuesta.forEach(celda => {
        celda.addEventListener('click', () => {
            if (girando || !celda.dataset.apuesta) return;

            const tipoApuesta = celda.dataset.apuesta;

            if (saldo >= fichaSeleccionada) {
                apuestasActuales[tipoApuesta] = (apuestasActuales[tipoApuesta] || 0) + fichaSeleccionada;
                actualizarSaldo(-fichaSeleccionada);
                colocarFichaVisual(celda, fichaSeleccionada);
            } else {
                mostrarResultado('¡Saldo insuficiente!', 'error');
            }
        });
    });

    limpiarApuestaBtn.addEventListener('click', () => {
        if (girando) return;

        const totalApostado = Object.values(apuestasActuales).reduce((sum, val) => sum + val, 0);
        actualizarSaldo(totalApostado);
        limpiarApuestas();
        mostrarResultado('Apuestas eliminadas', 'info');
    });

    girarBtn.addEventListener('click', girarRuleta);

    actualizarSaldo(0);
    actualizarNumerosRecientes();
    rueda.style.transform = `rotate(${Math.random() * 360}deg)`;
});
