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



const port = process.env.port || 3000;
app.listen(port,()=>{
    console.log(`Server is running in port ${port}`)
})