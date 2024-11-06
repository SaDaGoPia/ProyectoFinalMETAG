let isAuthenticated = false; // Estado de autenticación
let currentUserRole = ''; // Rol del usuario actual
let users = []; // Array para almacenar usuarios
let subjects = []; // Array para almacenar asignaturas
let activities = {}; // Objeto para almacenar actividades por asignatura
let studentEnrollments = {}; // Objeto para almacenar las asignaturas de los estudiantes
let studentGrades = {}; // Objeto para almacenar calificaciones por estudiante y actividad

document.getElementById('link-inicio-sesion').addEventListener('click', mostrarLogin);

function mostrarLogin() {
    document.getElementById('contenido').innerHTML = `
        <h2>Iniciar Sesión</h2>
        <form id="login-form">
            <label for="username">Usuario:</label>
            <input type="text" id="username" required>
            <br>
            <label for="password">Contraseña:</label>
            <input type="password" id="password" required>
            <br>
            <button type="submit">Ingresar</button>
        </form>
        <div id="mensaje" style="color: red;"></div>
    `;

    document.getElementById('login-form').addEventListener('submit', function(event) {
        event.preventDefault();
        verificarLogin();
    });
}

function verificarLogin() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username === 'superadmin' && password === 'admin') {
        isAuthenticated = true;
        currentUserRole = 'superadmin';
        mostrarDashboardSuperadmin();
    } else if (username === 'docente1' && password === 'docente123') {
        isAuthenticated = true;
        currentUserRole = 'docente';
        mostrarDashboardDocente();
    } else if (username === 'estudiante1' && password === 'estudiante123') {
        isAuthenticated = true;
        currentUserRole = 'estudiante';
        mostrarDashboardEstudiante();
    } else {
        document.getElementById('mensaje').textContent = 'Usuario o contraseña incorrectos. Intenta de nuevo.';
    }
}

function mostrarDashboardSuperadmin() {
    if (!isAuthenticated) return;
    document.getElementById('contenido').innerHTML = `
        <h2>Panel de Control del Superadministrador</h2>
        <button id="gestionar-usuarios">Gestionar Usuarios</button>
        <button id="gestionar-asignaturas">Gestionar Asignaturas</button>
        <button id="consultar-usuarios">Consultar Usuarios</button>
        <div id="resultado-superadmin"></div>
    `;

    document.getElementById('gestionar-usuarios').addEventListener('click', gestionarUsuarios);
    document.getElementById('gestionar-asignaturas').addEventListener('click', gestionarAsignaturas);
    document.getElementById('consultar-usuarios').addEventListener('click', consultarUsuarios);
}

function gestionarUsuarios() {
    document.getElementById('resultado-superadmin').innerHTML = `
        <h3>Gestionar Usuarios</h3>
        <form id="form-usuario">
            <label for="usuario-nombre">Nombre:</label>
            <input type="text" id="usuario-nombre" required>
            <br>
            <label for="usuario-email">Email:</label>
            <input type="email" id="usuario-email" required>
            <br>
            <label for="usuario-rol">Rol:</label>
            <select id="usuario-rol" required>
                <option value="docente">Docente</option>
                <option value="estudiante">Estudiante</option>
            </select>
            <br>
            <button type="submit">Registrar Usuario</button>
        </form>
        <div id="mensaje-usuario" style="color: green;"></div>
        <h3>Matricular Estudiantes a Asignaturas</h3>
        <select id="select-estudiantes" required>
            <option value="" disabled selected>Selecciona un estudiante</option>
        </select>
        <select id="select-asignaturas" required>
            <option value="" disabled selected>Selecciona una asignatura</option>
        </select>
        <button id="matricular-estudiante">Matricular Estudiante</button>
        <div id="mensaje-matricula" style="color: green;"></div>
        <h3>Usuarios Registrados</h3>
        <ul id="lista-usuarios">${users.map((user, index) => `
            <li>${user.nombre} - ${user.rol}
                <button onclick="eliminarUsuario(${index})">Eliminar</button>
            </li>
        `).join('')}</ul>
    `;

    users.forEach(user => {
        if (user.rol === 'estudiante') {
            const option = document.createElement('option');
            option.value = user.nombre;
            option.textContent = user.nombre;
            document.getElementById('select-estudiantes').appendChild(option);
        }
    });

    subjects.forEach(subject => {
        const option = document.createElement('option');
        option.value = subject.nombre;
        option.textContent = subject.nombre;
        document.getElementById('select-asignaturas').appendChild(option);
    });

    document.getElementById('form-usuario').addEventListener('submit', function(event) {
        event.preventDefault();
        const nombre = document.getElementById('usuario-nombre').value;
        const email = document.getElementById('usuario-email').value;
        const rol = document.getElementById('usuario-rol').value;

        // Añadir usuario al array
        users.push({ nombre, email, rol });
        document.getElementById('mensaje-usuario').textContent = `Usuario ${nombre} registrado con éxito.`;
    });

    document.getElementById('matricular-estudiante').addEventListener('click', function() {
        const estudiante = document.getElementById('select-estudiantes').value;
        const asignatura = document.getElementById('select-asignaturas').value;

        if (!studentEnrollments[estudiante]) {
            studentEnrollments[estudiante] = [];
        }
        studentEnrollments[estudiante].push(asignatura);
        document.getElementById('mensaje-matricula').textContent = `Estudiante ${estudiante} matriculado en ${asignatura} con éxito.`;
    });
}

function gestionarAsignaturas() {
    document.getElementById('resultado-superadmin').innerHTML = `
        <h3>Gestionar Asignaturas</h3>
        <form id="form-asignatura">
            <label for="asignatura-nombre">Nombre Asignatura:</label>
            <input type="text" id="asignatura-nombre" required>
            <br>
            <button type="submit">Registrar Asignatura</button>
        </form>
        <div id="mensaje-asignatura" style="color: green;"></div>
        <h4>Asignaturas Registradas</h4>
        <div id="listado-asignaturas"></div>
    `;

    document.getElementById('form-asignatura').addEventListener('submit', function(event) {
        event.preventDefault();
        const nombre = document.getElementById('asignatura-nombre').value;

        // Añadir asignatura al array
        subjects.push({ nombre, docente: null });
        document.getElementById('mensaje-asignatura').textContent = `Asignatura ${nombre} registrada con éxito.`;
        mostrarAsignaturas();
    });

    mostrarAsignaturas();
}

function mostrarAsignaturas() {
    const listadoAsignaturas = subjects.map((subject, index) => `
        <div>
            <strong>${subject.nombre}</strong> - Docente: ${subject.docente || 'Sin asignar'}
            <button onclick="asignarDocente(${index})">Asignar Docente</button>
            <button onclick="modificarAsignatura(${index})">Modificar</button>
            <button onclick="eliminarAsignatura(${index})">Eliminar</button>
            <button onclick="verDetalles(${index})">Ver Detalles</button>
        </div>
    `).join('');

    document.getElementById('listado-asignaturas').innerHTML = listadoAsignaturas;
}

function modificarAsignatura(index) {
    const nuevaNombre = prompt("Introduce el nuevo nombre de la asignatura:", subjects[index].nombre);
    if (nuevaNombre) {
        subjects[index].nombre = nuevaNombre;
        mostrarAsignaturas();
    }
}

function eliminarAsignatura(index) {
    subjects.splice(index, 1);
    mostrarAsignaturas();
}

function asignarDocente(index) {
    const docente = prompt("Introduce el nombre del docente a asignar:");
    if (docente) {
        subjects[index].docente = docente;
        mostrarAsignaturas();
    }
}

function verDetalles(index) {
    const subject = subjects[index];
    const estudiantes = Object.keys(studentEnrollments).filter(estudiante => studentEnrollments[estudiante].includes(subject.nombre));
    const actividades = activities[subject.nombre] || [];
    
    let detalles = `<h4>Detalles de la Asignatura: ${subject.nombre}</h4>`;
    detalles += `<p>Docente: ${subject.docente || 'Sin asignar'}</p>`;
    detalles += `<h5>Estudiantes Matriculados:</h5><ul>${estudiantes.map(e => `<li>${e}</li>`).join('')}</ul>`;
    detalles += `<h5>Actividades:</h5><ul>${actividades.map(a => `<li>${a.titulo} - ${a.descripcion}</li>`).join('')}</ul>`;
    
    document.getElementById('resultado-superadmin').innerHTML = detalles;
}

function consultarUsuarios() {
    let usuariosHTML = `<h3>Usuarios del Sistema</h3><select id="select-usuarios" required><option value="" disabled selected>Selecciona un usuario</option>`;
    
    users.forEach(user => {
        usuariosHTML += `<option value="${user.nombre}">${user.nombre} - ${user.rol}</option>`;
    });
    
    usuariosHTML += `</select><button id="ver-info-usuario">Ver Información</button><div id="resultado-info-usuario"></div>`;
    document.getElementById('resultado-superadmin').innerHTML = usuariosHTML;

    document.getElementById('ver-info-usuario').addEventListener('click', function() {
        const selectedUser = document.getElementById('select-usuarios').value;
        const user = users.find(u => u.nombre === selectedUser);
        
        if (user) {
            let infoHTML = `<h4>Información de ${user.nombre}</h4>`;
            infoHTML += `<p>Email: ${user.email}</p>`;
            if (user.rol === 'docente') {
                const asignaturasDocente = subjects.filter(subject => subject.docente === user.nombre);
                infoHTML += `<h5>Asignaturas Asignadas:</h5><ul>${asignaturasDocente.map(a => `<li>${a.nombre}</li>`).join('')}</ul>`;
            } else if (user.rol === 'estudiante') {
                const asignaturasEstudiante = studentEnrollments[user.nombre] || [];
                const calificacionesHTML = asignaturasEstudiante.map(asignatura => {
                    const grades = studentGrades[user.nombre] && studentGrades[user.nombre][asignatura] || {};
                    const calificacionesDetalles = Object.entries(grades).map(([actividad, { calificacion, retroalimentacion }]) => {
                        return `<p>Actividad: ${actividad}, Calificación: ${calificacion}, Retroalimentación: ${retroalimentacion}</p>`;
                    }).join('');
                    
                    return `<h5>Calificaciones: ${asignatura}</h5>${calificacionesDetalles}`;
                }).join('');
                infoHTML += `<h5>Asignaturas Matriculadas:</h5><ul>${asignaturasEstudiante.map(a => `<li>${a}</li>`).join('')}</ul>${calificacionesHTML}`;
            }
            document.getElementById('resultado-info-usuario').innerHTML = infoHTML;
        }
    });
}

function eliminarUsuario(index) {
    users.splice(index, 1);
    gestionarUsuarios();
}

function mostrarDashboardDocente() {
    if (!isAuthenticated) return;
    document.getElementById('contenido').innerHTML = `
        <h2>Panel de Control del Docente</h2>
        <button id="consultar-info-docente">Consultar Información Personal</button>
        <button id="consultar-calificaciones">Consultar y Modificar Calificaciones</button>
        <button id="consultar-estudiantes">Consultar Estudiantes Matriculados</button>
        <button id="crear-actividad">Crear Actividad</button>
        <button id="consultar-actividades">Consultar Actividades</button>
        <div id="resultado-docente"></div>
    `;

    document.getElementById('consultar-info-docente').addEventListener('click', consultarInfoDocente);
    document.getElementById('consultar-calificaciones').addEventListener('click', consultarCalificaciones);
    document.getElementById('consultar-estudiantes').addEventListener('click', consultarEstudiantesMatriculados);
    document.getElementById('crear-actividad').addEventListener('click', crearActividad);
    document.getElementById('consultar-actividades').addEventListener('click', consultarActividades);
}

function consultarInfoDocente() {
    document.getElementById('resultado-docente').innerHTML = `<p>Información del docente: Nombre - Docente1, Email - docente1@example.com</p>`;
}

function consultarCalificaciones() {
    const asignaturasDocente = subjects.filter(subject => subject.docente === 'docente1');
    let calificacionesHTML = `<h3>Calificaciones de Asignaturas</h3>`;

    asignaturasDocente.forEach(asignatura => {
        calificacionesHTML += `<h4>${asignatura.nombre}</h4>`;
        const estudiantes = Object.keys(studentEnrollments).filter(est => studentEnrollments[est].includes(asignatura.nombre));
        estudiantes.forEach(est => {
            const actividad = prompt(`Introduce el nombre de la actividad para ${est} en ${asignatura.nombre}:`);
            const calificacion = prompt(`Introduce la calificación para ${est} en ${asignatura.nombre} - Actividad: ${actividad}:`);
            const retroalimentacion = prompt(`Introduce la retroalimentación para ${est} en ${asignatura.nombre} - Actividad: ${actividad}:`);
            // Guardar calificación y retroalimentación en el objeto studentGrades
            if (!studentGrades[est]) {
                studentGrades[est] = {};
            }
            if (!studentGrades[est][asignatura.nombre]) {
                studentGrades[est][asignatura.nombre] = {};
            }
            studentGrades[est][asignatura.nombre][actividad] = { calificacion, retroalimentacion };

            calificacionesHTML += `<p>${est} - Actividad: ${actividad}, Calificación: ${calificacion}, Retroalimentación: ${retroalimentacion}</p>`;
        });
    });

    document.getElementById('resultado-docente').innerHTML = calificacionesHTML;
}

function consultarEstudiantesMatriculados() {
    const asignaturasDocente = subjects.filter(subject => subject.docente === 'docente1');
    let estudiantesHTML = `<h3>Estudiantes Matriculados</h3>`;

    asignaturasDocente.forEach(asignatura => {
        estudiantesHTML += `<h4>${asignatura.nombre}</h4>`;
        const estudiantes = Object.keys(studentEnrollments).filter(est => studentEnrollments[est].includes(asignatura.nombre));
        estudiantesHTML += `<ul>${estudiantes.map(e => `<li>${e}</li>`).join('')}</ul>`;
    });

    document.getElementById('resultado-docente').innerHTML = estudiantesHTML;
}

function crearActividad() {
    const asignatura = prompt("Introduce el nombre de la asignatura para la actividad:");
    const titulo = prompt("Introduce el título de la actividad:");
    const descripcion = prompt("Introduce la descripción de la actividad:");

    if (!activities[asignatura]) {
        activities[asignatura] = [];
    }
    activities[asignatura].push({ titulo, descripcion });
    alert(`Actividad '${titulo}' creada para la asignatura '${asignatura}' con éxito.`);
}

function consultarActividades() {
    const asignatura = prompt("Introduce el nombre de la asignatura para consultar las actividades:");
    const actividades = activities[asignatura] || [];

    if (actividades.length > 0) {
        let actividadesHTML = `<h3>Actividades en ${asignatura}</h3>`;
        actividadesHTML += `<ul>${actividades.map(a => `<li>${a.titulo} - ${a.descripcion}</li>`).join('')}</ul>`;
        document.getElementById('resultado-docente').innerHTML = actividadesHTML;
    } else {
        document.getElementById('resultado-docente').innerHTML = `<p>No hay actividades registradas para la asignatura ${asignatura}.</p>`;
    }
}

function mostrarDashboardEstudiante() {
    if (!isAuthenticated) return;
    document.getElementById('contenido').innerHTML = `
        <h2>Panel de Control del Estudiante</h2>
        <button id="consultar-info-estudiante">Consultar Información Personal</button>
        <button id="consultar-asignaturas">Consultar Asignaturas Matriculadas</button>
        <div id="resultado-estudiante"></div>
    `;

    document.getElementById('consultar-info-estudiante').addEventListener('click', consultarInfoEstudiante);
    document.getElementById('consultar-asignaturas').addEventListener('click', consultarAsignaturas);
}

function consultarInfoEstudiante() {
    document.getElementById('resultado-estudiante').innerHTML = `<p>Información del estudiante: Nombre - Estudiante1, Email - estudiante1@example.com</p>`;
}

function consultarAsignaturas() {
    const asignaturasMatriculadas = studentEnrollments['estudiante1'] || [];
    let asignaturasHTML = `<h3>Asignaturas Matriculadas</h3>`;

    asignaturasMatriculadas.forEach(asignatura => {
        asignaturasHTML += `<h4>${asignatura}</h4>`;
        const actividades = activities[asignatura] || [];
        asignaturasHTML += `<h5>Actividades:</h5><ul>${actividades.map(a => `<li>${a.titulo}</li>`).join('')}</ul>`;

        // Consultar calificaciones y retroalimentación para cada actividad
        const grades = studentGrades['estudiante1'] && studentGrades['estudiante1'][asignatura] || {};
        for (const [actividad, { calificacion, retroalimentacion }] of Object.entries(grades)) {
            asignaturasHTML += `<p>Actividad: ${actividad}, Calificación: ${calificacion}, Retroalimentación: ${retroalimentacion}</p>`;
        }
    });

    document.getElementById('resultado-estudiante').innerHTML = asignaturasHTML;
}

// Iniciar el sistema
mostrarLogin();
