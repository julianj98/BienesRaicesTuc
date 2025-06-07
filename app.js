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
app.use(express.urlencoded({extended:true}))

//habilitar cookie parser
app.use(cookieParser())

//habilitar CSRF
app.use(csrf({cookie:true}))

//conexion a la db
try {
    await db.authenticate();
    db.sync()
    console.log("Conexion exitosa a la base de datos")
} catch (error) {
    console.log(error)
}

//habilitar pug
app.set('view engine','pug')
app.set('views','./views')

//carpeta publica
app.use(express.static('public'))

//Routing
app.use("/auth",usuarioRoutes)
app.use("/",propiedadesRoutes)
app.use('/',appRoutes)
app.use('/api',apiRoutes)

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
    console.log(`Server is running on http://localhost:${port}`)
})