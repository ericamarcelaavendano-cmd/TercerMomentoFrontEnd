
export function cargarBienvenido() {

    if (localStorage.getItem('sesionActiva') !== 'true') {
        window.location.href = 'iniciosesion.html';
        return;
    }

    const usuarioGuardado = localStorage.getItem('usuarioActual') || 'Usuario';
    document.getElementById('usuario-activo').innerText = usuarioGuardado;

    // Cerrar sesión
    document.getElementById('btn-cerrar-sesion').addEventListener('click', function(e) {
        e.preventDefault();
        localStorage.removeItem('sesionActiva');
        localStorage.removeItem('usuarioActual');
        window.location.href = 'iniciosesion.html';
    });

    const usuariosGuardados = JSON.parse(localStorage.getItem('usuariosApp')) || [];
    const totalEst = usuariosGuardados.filter(u => u.rol === 'Estudiante').length;
    const totalDoc = usuariosGuardados.filter(u => u.rol === 'Docente').length;

    document.getElementById('res-estudiantes').innerText = totalEst;
    document.getElementById('res-docentes').innerText    = totalDoc;
    document.getElementById('res-total').innerText       = usuariosGuardados.length;
}