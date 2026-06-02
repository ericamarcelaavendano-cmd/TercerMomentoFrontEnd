
let intentosRealizados = 0;
const maximoIntentos = 3;

export function validarAcceso() {
    const userIn = document.getElementById('email').value.trim();
    const passIn = document.getElementById('password').value;
    const status = document.getElementById('mensaje-estado');
    const usuariosLogin = JSON.parse(
        localStorage.getItem('usuariosLogin') || '[]'
    );

    //  Busca si hay coincidencia
    let accesoConcedido = false;
    let usuarioEncontrado = null;

    for (let i = 0; i < usuariosLogin.length; i++) {
        if (userIn === usuariosLogin[i].usuario &&
            passIn === usuariosLogin[i].clave) {
            accesoConcedido = true;
            usuarioEncontrado = usuariosLogin[i];
            break;
        }
    }

    if (accesoConcedido) {
        // Guarda la sesión activa
        localStorage.setItem('sesionActiva', 'true');
        localStorage.setItem('usuarioActual', usuarioEncontrado.usuario);
        localStorage.setItem('nombreActual', usuarioEncontrado.nombre);

        status.style.color = "#16a34a";
        status.innerText = "¡ACCESO EXITOSO! Redirigiendo...";

        setTimeout(() => {
            window.location.href = "bienvenido.html";
        }, 1500);

    } else {
        intentosRealizados++;
        const restantes = maximoIntentos - intentosRealizados;

        if (restantes > 0) {
            status.style.color = "#d97706";
            status.innerText = `Datos incorrectos. Intento ${intentosRealizados} de ${maximoIntentos}.`;
        } else {
            status.style.color = "#dc2626";
            status.innerText = "USUARIO BLOQUEADO: Contacte a soporte técnico.";
            document.getElementById('btn-login').disabled = true;
            document.getElementById('btn-login').style.opacity = "0.5";
        }
    }
}