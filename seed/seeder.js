import {exit} from 'node:process'
import categorias from "./categorias.js";
import precios from './precios.js';
import usuarios from './usuarios.js';
import db from '../config/db.js'
import {Categoria,Precio, Usuario} from '../models/index.js'
const importarDatos=async()=>{
    try {
        //autenticar
        await db.authenticate()
        //generar columnas
        await db.sync()

        //insertar datos
        await Promise.all([
            Categoria.bulkCreate(categorias),
            Precio.bulkCreate(precios),
            Usuario.bulkCreate(usuarios)
        ])
        console.log("datos importados correctamente")
        exit() // en 0 significa q termino la ejecucion del codigo pero correctamente
    } catch (error) {
        console.log(error)
        process.exit(1) //termina los procesos, pero con errores por el codigo 1
    }
}

const eliminarDatos = async ()=>{
    try {
        await db.sync({force:true}) //borra todas las tablas PERO como no importamos usuario no borra esa tabla
        console.log("datos eliminados exitosamente")
        exit()
    } catch (error) {
        console.log(error)
        process.exit(1)
    }
}

if(process.argv[2] ==="-i"){
    importarDatos();
}

if(process.argv[2] ==="-e"){
    eliminarDatos();
}