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

// Conexión a la base de datos
try {
    await db.authenticate();
    await db.sync();
    console.log("✅ Conexión exitosa a la base de datos");
} catch (error) {
    console.log("❌ Error en la base de datos:", error);
}

// Habilitar lectura de formularios
app.use(express.urlencoded({ extended: true }));

// Habilitar cookie parser
app.use(cookieParser());

// Middleware CSRF aplicado globalmente
const csrfProtection = csrf({ cookie: true });
app.use((req, res, next) => {
    // Rutas que no usan csrfToken
    const csrfExcludedRoutes = [
        /^\/auth\/confirmar\/[\w-]+$/
    ];
    const isExcluded = csrfExcludedRoutes.some((pattern) => pattern.test(req.path));

    if (isExcluded) {
        return next(); // Saltar protección CSRF
    } else {
        return csrfProtection(req, res, next); // Aplicar CSRF
    }
});

// Agregar csrfToken a res.locals si existe
app.use((req, res, next) => {
    if (typeof req.csrfToken === 'function') {
        res.locals.csrfToken = req.csrfToken();
    } else {
        res.locals.csrfToken = '';
    }
    next();
});

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
        csrfToken: res.locals.csrfToken || ''
    });
});

const port = process.env.PORT || 8080;
const host = '0.0.0.0';

app.listen(port, host, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
});
