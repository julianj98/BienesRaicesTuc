import Sequelize  from "sequelize";
import dotenv from 'dotenv'
dotenv.config({path:'.env' })

const db= new Sequelize(process.env.BD_NOMBRE,process.env.BD_USER,process.env.BD_USER,{
    host: process.env.BD_HOST,
    port:3306,
    dialect:'mysql',
    define:{
        timestamps:true //agrega las columnas de createAt y updatedAt
    },
    pool:{
        max:5, //max de conexiones a mantener
        min:0,
        acquire:30000, // miliseg el tiempo antes de marcar un error
        idle:10000 // miliseg si no hay nada de mov se corta la conexion
    },
    operatorAliases: false //se usaba antes en sequalize  y estan obsoletos ahora
});

export default db;