import express from 'express';
import csrf from 'csurf';
import cookieParser from 'cookie-parser';
import usuarioRoutes from './routes/usuarioRoutes.js';
import propiedadesRoutes from './routes/propiedadesRoutes.js';
import appRoutes from './routes/appRoutes.js';
import apiRoutes from './routes/apiRoutes.js';
import db from './config/db.js';

// Crear la app
const app = express();

// Habilitar lectura de datos de formularios
app.use(express.urlencoded({ extended: true }));

// Habilitar cookie parser
app.use(cookieParser());

// Habilitar CSRF
app.use(csrf({ cookie: true }));

// Excluir CSRF solo para la ruta /auth/confirmar/:token
app.use((req, res, next) => {
    const csrfExcludedRoutes = [
        /^\/auth\/confirmar\/[\w-]+$/
    ];
    const isExcluded = csrfExcludedRoutes.some((pattern) => pattern.test(req.path));

    if (isExcluded) {
        return next(); // No intenta usar csrfToken
    }

    // Si no está excluida, asigna el token a las vistas
    res.locals.csrfToken = req.csrfToken();
    next();
});

// Conexión a la base de datos
try {
    await db.authenticate();
    await db.sync();
    console.log("Conexión exitosa a la base de datos");
} catch (error) {
    console.log(error);
}

// Habilitar Pug
app.set('view engine', 'pug');
app.set('views', './views');

// Carpeta pública
app.use(express.static('public'));

// Routing
app.use("/auth", usuarioRoutes);
app.use("/", propiedadesRoutes);
app.use("/", appRoutes);
app.use("/api", apiRoutes);

// Página 404
app.use((req, res) => {
    res.status(404).render('404', {
        pagina: '404 - Página no encontrada',
        csrfToken: res.locals.csrfToken || '' // por si no se setea en rutas excluidas
    });
});

const port = process.env.PORT || 8080;
const host = '0.0.0.0';

app.listen(port, host, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
