import express from 'express';
import csrf from 'csurf';
import cookieParser from 'cookie-parser';
import usuarioRoutes from './routes/usuarioRoutes.js'
import propiedadesRoutes from './routes/propiedadesRoutes.js'
import appRoutes from './routes/appRoutes.js'
import apiRoutes from './routes/apiRoutes.js'
import db from './config/db.js'

//crear la app
const app = express();

//habilitar lectura de datos de formlularios
app.use(express.urlencoded({ extended: true }));

//habilitar cookie parser
app.use(cookieParser());

//conexion a la db
try {
    await db.authenticate();
    db.sync();
    console.log("Conexión exitosa a la base de datos");
} catch (error) {
    console.log(error);
}

//habilitar pug
app.set('view engine', 'pug');
app.set('views', './views');

//carpeta pública
app.use(express.static('public'));

//Routing SIN CSRF para la ruta de confirmación (GET)
app.use("/auth", usuarioRoutes);

// Aplica CSRF a todo lo que viene después
app.use(csrf({ cookie: true }));

// Middleware para pasar el token CSRF a todas las vistas
app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    next();
});

// Resto del routing CON CSRF
app.use("/", propiedadesRoutes);
app.use("/", appRoutes);
app.use("/api", apiRoutes);

// Manejar rutas no encontradas
app.use((req, res) => {
    res.status(404).render('404', {
        pagina: '404 - Página no encontrada',
        csrfToken: req.csrfToken()
    });
});

const port = process.env.PORT || 8080;
const host = '0.0.0.0';

app.listen(port, host, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
