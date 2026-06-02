
export let listaUsuarios = [];

export function setListaUsuarios(datos) {
    listaUsuarios = datos;
}

const params   = new URLSearchParams(window.location.search);
const modoURL  = params.get('modo') || 'registrar';
const rolURL   = params.get('rol')  || '';

let modoEdicion = false;
let idEditando  = null;

export function renderizarTabla(lista) {
    const tbody = document.getElementById('tbody-usuarios');
    const vacio = document.getElementById('lista-vacia');
    const tabla = document.getElementById('tabla-usuarios');

    while (tbody.firstChild) {
        tbody.removeChild(tbody.firstChild);
    }

    if (lista.length === 0) {
        tabla.style.display = 'none';
        vacio.style.display = 'block';
    } else {
        tabla.style.display = 'table';
        vacio.style.display = 'none';

        lista.forEach(function(usuario, index) {
            const fila = document.createElement('tr');
            fila.setAttribute('data-id', usuario.id);
            const badgeClass = usuario.rol === 'Docente' ? 'docente' : 'estudiante';

            fila.innerHTML = `
                <td>${index + 1}</td>
                <td>${usuario.nombre}</td>
                <td>${usuario.documento}</td>
                <td>${usuario.correo}</td>
                <td><span class="badge-rol ${badgeClass}">${usuario.rol}</span></td>
                <td>${usuario.grado || '—'}</td>
                <td>
                    <button class="btn-edit" data-id="${usuario.id}">✏️ Editar</button>
                    <button class="btn-del"  data-id="${usuario.id}">🗑️ Eliminar</button>
                </td>
            `;
            tbody.appendChild(fila);
        });

        tbody.querySelectorAll('.btn-edit').forEach(function(btn) {
            btn.addEventListener('click', function() {
                cargarEdicion(this.getAttribute('data-id'));
            });
        });

        tbody.querySelectorAll('.btn-del').forEach(function(btn) {
            btn.addEventListener('click', function() {
                eliminarUsuario(this.getAttribute('data-id'));
            });
        });
    }

    actualizarContadores();
}

function actualizarContadores() {
    const est = listaUsuarios.filter(u => u.rol === 'Estudiante').length;
    const doc = listaUsuarios.filter(u => u.rol === 'Docente').length;
    document.getElementById('cnt-total').innerText       = `Total: ${listaUsuarios.length}`;
    document.getElementById('cnt-estudiantes').innerText = `Estudiantes: ${est}`;
    document.getElementById('cnt-docentes').innerText    = `Docentes: ${doc}`;
}

export function filtrarTabla() {
    const texto = document.getElementById('inp-buscar').value.toLowerCase();
    const rol   = document.getElementById('sel-filtro-rol').value;

    const filtrada = listaUsuarios.filter(function(u) {
        const coincideTexto = u.nombre.toLowerCase().includes(texto) ||
                              u.documento.includes(texto) ||
                              u.correo.toLowerCase().includes(texto);
        const coincideRol   = rol === '' || u.rol === rol;
        return coincideTexto && coincideRol;
    });

    renderizarTabla(filtrada);
}

export function iniciarCRUD() {

    const inpRol     = document.getElementById('inp-rol');
    const grupoGrado = document.getElementById('grupo-grado');

    configurarModo(inpRol, grupoGrado);

    inpRol.addEventListener('change', function() {
        grupoGrado.style.display = this.value ? 'block' : 'none';
        document.getElementById('inp-grado').placeholder =
            this.value === 'Docente' ? 'Ej: Matemáticas' : 'Ej: 10°A';
    });

    document.getElementById('inp-buscar').addEventListener('input', filtrarTabla);
    document.getElementById('sel-filtro-rol').addEventListener('change', filtrarTabla);

    document.getElementById('btn-guardar').addEventListener('click', function() {
        const nombre    = document.getElementById('inp-nombre').value.trim();
        const documento = document.getElementById('inp-documento').value.trim();
        const correo    = document.getElementById('inp-correo').value.trim();
        const rol       = document.getElementById('inp-rol').value;
        const grado     = document.getElementById('inp-grado').value.trim();
        const msgForm   = document.getElementById('msg-form');

        if (!nombre || !documento || !correo || !rol) {
            msgForm.style.color = '#dc2626';
            msgForm.innerText = '⚠️ Completa todos los campos obligatorios.';
            return;
        }

        if (modoEdicion) {
            listaUsuarios = listaUsuarios.map(function(u) {
                return u.id === idEditando
                    ? { ...u, nombre, documento, correo, rol, grado }
                    : u;
            });
            msgForm.style.color = '#16a34a';
            msgForm.innerText = 'Registro actualizado correctamente.';
            cancelarEdicion();
        } else {
            listaUsuarios.push({
                id: Date.now().toString(),
                nombre, documento, correo, rol, grado
            });
            msgForm.style.color = '#16a34a';
            msgForm.innerText = ' Registro guardado correctamente.';
        }

        localStorage.setItem('usuariosApp', JSON.stringify(listaUsuarios));
        limpiarFormulario(grupoGrado);
        filtrarTabla();
        setTimeout(function() { msgForm.innerText = ''; }, 3000);
    });

    document.getElementById('btn-cancelar').addEventListener('click', cancelarEdicion);

   // Estilos del panel
    document.getElementById('btn-toggle-estilo').addEventListener('click', function(e) {
        e.stopPropagation();
        const panel = document.getElementById('style-panel');
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    });

    // Cerrar con el botón X
    document.getElementById('btn-cerrar-panel').addEventListener('click', function() {
        document.getElementById('style-panel').style.display = 'none';
    });

    document.addEventListener('click', function(e) {
        const panel    = document.getElementById('style-panel');
        const btnAbrir = document.getElementById('btn-toggle-estilo');
        if (!panel.contains(e.target) && e.target !== btnAbrir) {
            panel.style.display = 'none';
        }
    });

    // Aplicar estilos
    document.getElementById('btn-aplicar-estilo').addEventListener('click', function() {
        document.body.style.backgroundColor =
            document.getElementById('sel-fondo').value;

        const tabla = document.getElementById('tabla-usuarios');
        if (tabla) tabla.style.fontSize =
            document.getElementById('sel-fuente').value;

        const temaTabla = document.getElementById('sel-tema-tabla').value;
        const wrapper   = document.getElementById('tabla-wrapper');
        wrapper.classList.remove('tema-azul', 'tema-verde');
        if (temaTabla === 'azul')  wrapper.classList.add('tema-azul');
        if (temaTabla === 'verde') wrapper.classList.add('tema-verde');

        const btn = document.getElementById('btn-aplicar-estilo');
        const textoOriginal = btn.innerText;
        btn.innerText = 'Aplicado';
        btn.style.background = '#16a34a';
        setTimeout(function() {
            btn.innerText = textoOriginal;
            btn.style.background = '';
        }, 1800);
    });

    // Cerrar sesión
    const btnCerrar = document.getElementById('btn-cerrar-sesion');
    if (btnCerrar) {
        btnCerrar.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('sesionActiva');
            localStorage.removeItem('usuarioActual');
            window.location.href = 'iniciosesion.html';
        });
    }

    filtrarTabla();
}

// Configurar modo 
function configurarModo(inpRol, grupoGrado) {
    const formTitulo     = document.getElementById('form-titulo');
    const formSubtitulo  = document.getElementById('form-subtitulo');
    const tablaTitulo    = document.getElementById('tabla-titulo');
    const tablaSubtitulo = document.getElementById('tabla-subtitulo');
    const filtroRol      = document.getElementById('sel-filtro-rol');

    if (rolURL) {
        inpRol.value = rolURL;
        grupoGrado.style.display = 'block';
        document.getElementById('inp-grado').placeholder =
            rolURL === 'Docente' ? 'Ej: Matemáticas' : 'Ej: 10°A';
        filtroRol.value = rolURL;
    }

    if (modoURL === 'registrar') {
        formTitulo.innerText     = rolURL ? `Registrar ${rolURL}` : 'Registrar Usuario';
        formSubtitulo.innerText  = `Completa los campos para agregar un nuevo ${rolURL || 'usuario'}.`;
        tablaTitulo.innerText    = rolURL ? `${rolURL}s Registrados` : 'Usuarios Registrados';
        tablaSubtitulo.innerText = `Lista de ${rolURL ? rolURL.toLowerCase() + 's' : 'usuarios'} en el sistema`;
    } else {
        formTitulo.innerText     = rolURL ? `Actualizar ${rolURL}` : 'Actualizar Usuario';
        formSubtitulo.innerText  = `Selecciona un registro de la tabla para editarlo.`;
        tablaTitulo.innerText    = rolURL ? `${rolURL}s — Selecciona uno para editar` : 'Selecciona un usuario';
        tablaSubtitulo.innerText = `Haz clic en "✏️ Editar" en la fila que deseas modificar`;
    }
}

// Cargar edición 
function cargarEdicion(id) {
    const usuario = listaUsuarios.find(u => u.id === id);
    if (!usuario) return;

    modoEdicion = true;
    idEditando  = id;

    document.getElementById('inp-nombre').value    = usuario.nombre;
    document.getElementById('inp-documento').value = usuario.documento;
    document.getElementById('inp-correo').value    = usuario.correo;
    document.getElementById('inp-rol').value       = usuario.rol;
    document.getElementById('inp-grado').value     = usuario.grado || '';
    document.getElementById('grupo-grado').style.display = 'block';
    document.getElementById('form-titulo').innerText     = '✏️ Editando registro';
    document.getElementById('btn-cancelar').style.display = 'block';
    document.querySelector('.registro-sidebar')
        .scrollIntoView({ behavior: 'smooth' });
}

//  Cancelar edición 
function cancelarEdicion() {
    modoEdicion = false;
    idEditando  = null;
    document.getElementById('form-titulo').innerText =
        modoURL === 'actualizar'
            ? (rolURL ? `Actualizar ${rolURL}` : 'Actualizar Usuario')
            : (rolURL ? `Registrar ${rolURL}` : 'Registrar Usuario');
    document.getElementById('btn-cancelar').style.display = 'none';
    limpiarFormulario(document.getElementById('grupo-grado'));
}

// Eliminar usuario 
function eliminarUsuario(id) {
    const usuario = listaUsuarios.find(u => u.id === id);
    if (!usuario) return;

    if (confirm(`¿Eliminar a "${usuario.nombre}"? Esta acción no se puede deshacer.`)) {
        listaUsuarios = listaUsuarios.filter(u => u.id !== id);
        localStorage.setItem('usuariosApp', JSON.stringify(listaUsuarios));
        const fila = document.querySelector(`tr[data-id="${id}"]`);
        if (fila) fila.remove();
        actualizarContadores();
        if (listaUsuarios.length === 0) renderizarTabla([]);
    }
}

// Limpiar formulario 
function limpiarFormulario(grupoGrado) {
    document.getElementById('inp-nombre').value    = '';
    document.getElementById('inp-documento').value = '';
    document.getElementById('inp-correo').value    = '';
    if (!rolURL) {
        document.getElementById('inp-rol').value = '';
        grupoGrado.style.display = 'none';
    }
    document.getElementById('inp-grado').value = '';
}