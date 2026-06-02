
import { validarAcceso }    from './login.js';
import { cargarBienvenido } from './bienvenido.js';
import { iniciarCRUD, setListaUsuarios, renderizarTabla } from './crud.js';
async function iniciarApp() {
    try {
        const response = await fetch('usuarios.json');
        console.log('Status del fetch:', response.status);
        const datosIniciales = await response.json();
        console.log('Datos cargados:', datosIniciales);
        const usuariosLogin   = datosIniciales.filter(u => u.clave);
        const usuariosSistema = datosIniciales.filter(u => u.documento);

        if (!localStorage.getItem('usuariosLogin')) {
            localStorage.setItem('usuariosLogin', JSON.stringify(usuariosLogin));
            console.log('Usuarios de login guardados desde JSON');
        }
        const datosExistentes = JSON.parse(
            localStorage.getItem('usuariosApp')
        ) || [];

        if (datosExistentes.length === 0) {
            localStorage.setItem('usuariosApp', JSON.stringify(usuariosSistema));
            console.log('Usuarios del sistema cargados desde JSON');
        } else {
            console.log('Usuarios del sistema cargados desde localStorage');
        }

        if (document.getElementById('tbody-usuarios')) {
            const datosFinales = JSON.parse(
                localStorage.getItem('usuariosApp')
            ) || [];
            setListaUsuarios(datosFinales);
            renderizarTabla(datosFinales);
        }

    } catch (error) {
        console.error('Error en iniciarApp:', error);

        if (document.getElementById('tbody-usuarios')) {
            const datosGuardados = JSON.parse(
                localStorage.getItem('usuariosApp')
            ) || [];
            setListaUsuarios(datosGuardados);
            renderizarTabla(datosGuardados);
        }
    }
}

iniciarApp().then(() => {

    if (document.getElementById('btn-login')) {
        document.getElementById('btn-login')
            .addEventListener('click', function(e) {
                e.preventDefault();
                validarAcceso();
            });

        ['email', 'password'].forEach(function(id) {
            document.getElementById(id)
                .addEventListener('keydown', function(e) {
                    if (e.key === 'Enter') validarAcceso();
                });
        });
    }

    if (document.getElementById('usuario-activo')) {
        cargarBienvenido();
    }

    if (document.getElementById('tbody-usuarios')) {
        if (localStorage.getItem('sesionActiva') !== 'true') {
            window.location.href = 'iniciosesion.html';
        }
        iniciarCRUD();
    }

});