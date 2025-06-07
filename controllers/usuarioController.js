import {check,validationResult} from 'express-validator'
import bcrypt from 'bcrypt';
import Usuario from '../models/Usuario.js'
import { generarId,generarJWT } from '../helpers/tokens.js'
import { emailRegistro, emailOlvidePassword } from '../helpers/emails.js'

const formularioLogin=(req,res)=>{
        res.render('auth/login',{
            pagina: 'Iniciar Sesion',
            csrfToken: req.csrfToken()
                })
}

const autenticar = async(req,res)=>{
    //validacion
    await check('email').isEmail().withMessage("El email es obligatorio").run(req)
    await check('password').notEmpty().withMessage("El password es obligatorio").run(req)
    let resultado= validationResult(req)

    //verificar que el resultado este vacio
    if(!resultado.isEmpty()){
        //errores
        return  res.render('auth/login',{
            pagina: 'Iniciar Sesion',
            csrfToken: req.csrfToken(),
            errores: resultado.array(),
        })
    }
    const {email,password} = req.body
    //comprobar si el usuario existe
    const usuario = await Usuario.findOne({where:{email}})
    if(!usuario){
        return res.render('auth/login',{
            pagina: 'Iniciar Sesion',
            csrfToken: req.csrfToken(),
            errores:[{msg: "El usuario no existe"}] ,
        })
    }
    //comporbar si el usuario esta confirmado
    if(!usuario.confirmado){
        return res.render('auth/login',{
            pagina: 'Iniciar Sesion',
            csrfToken: req.csrfToken(),
            errores:[{msg: "Tu cuenta no fue confirmada"}] ,
        })
    }

    //revisar el password
    if(!usuario.verificarPassword(password)){
        return res.render('auth/login',{
            pagina: 'Iniciar Sesion',
            csrfToken: req.csrfToken(),
            errores:[{msg: "password incorrecto"}] ,
        })
    }

    //autenticar el usuario
    const token= generarJWT({id:usuario.id,nombre:usuario.nombre})
    //console.log(token)
    //almacenar en un cookie
    return res.cookie('_token',token,{
        httpOnly:true,
        //secure:true,
        //sameSite:true
    }).redirect('/mis-propiedades')

}

const cerrarSesion = (req,res)=>{
    return res.clearCookie('_token').status(200).redirect('/auth/login')
}

const formularioRegistro = (req,res)=>{
    
    res.render('auth/registro',{
        pagina: 'Crear Cuenta',
        csrfToken: req.csrfToken()
    })
}

const registrar = async(req,res)=>{
    //validacion
    await check('nombre').notEmpty().withMessage("El nombre es obligatorio").run(req)
    await check('email').isEmail().withMessage("No es un email valido").run(req)
    await check('password').isLength({min: 6}).withMessage("la contraseña debe tener al menos 6 caracteres").run(req)
    await check('repetir_password').equals(req.body.password).withMessage("las contraseñas no son iguales").run(req)
    
    let resultado= validationResult(req)

    //verificar que el resultado este vacio
    if(!resultado.isEmpty()){
        //errores
        return  res.render('auth/registro',{
            pagina: 'Crear Cuenta',
            csrfToken: req.csrfToken(),
            errores: resultado.array(),
            usuario:{
                nombre:req.body.nombre,
                email: req.body.email
            }
        })
    }

    //extrar los datos
    const {nombre,email, password} = req.body

    //verificar que el usuario no este duplicado
    const existeUsuario= await Usuario.findOne({where:{email}})
    if(existeUsuario){
        return  res.render('auth/registro',{
            pagina: 'Crear Cuenta',
            csrfToken: req.csrfToken(),
            errores: [{msg:'El usuario ya esta registrado'}],
            usuario:{
                nombre:req.body.nombre,
                email: req.body.email
            }
        })
    }

    //almacenar un usuario
    const usuario = await Usuario.create({
        nombre,
        email,
        password,
        token:generarId()
    })

    //Envia email de confirmacion
    emailRegistro({
        nombre:usuario.nombre,
        email: usuario.email,
        token:usuario.token
    })

    //mostrar mensaje de confirmacion
    res.render('templates/mensaje',{
        pagina:"cuenta creada correctamente",
        mensaje: "enviamos un mail de confirmacion, presiona el enlace"
    })
}
//funcion que comprueba una cuenta
const confirmar = async (req,res)=>{
    const {token} = req.params
    console.log('Token recibido:', token);
    
    //verificar si el token es valido
    const usuario = await Usuario.findOne({where:{token}})
    console.log('Usuario encontrado:', usuario ? 'Sí' : 'No');
    
    if(!usuario){
        return res.render('auth/confirmar-cuenta',{
            pagina:'Error al confirmar tu cuenta',
            mensaje: 'Hubo un error al confirmar tu cuenta, intenta de nuevo',
            error:true
        })
    }
    //confirmar la cuenta 
    usuario.token = null;
    usuario.confirmado=true;
    await usuario.save();
    console.log('Cuenta confirmada exitosamente');
    
    return res.render('auth/confirmar-cuenta',{
        pagina:'Cuenta confirmada',
        mensaje: 'la cuenta se confirmo correctamente'
    })
}

const formularioOlvidePassword= (req,res)=>{
    res.render('auth/olvide-password',{
        pagina: 'Recupera tu acceso a Bienes Raices',
        csrfToken: req.csrfToken(),

    })
}
const resetPassword = async(req,res)=>{
    //validacion
    await check('email').isEmail().withMessage("No es un email valido").run(req)

    let resultado= validationResult(req)

    //verificar que el resultado este vacio
    if(!resultado.isEmpty()){
        //errores
        return  res.render('auth/olvide-password',{
            pagina: 'Recupera tu acceso a Bienes Raices',
            csrfToken: req.csrfToken(),
            errores: resultado.array()
        })
    }

    //buscar el usuario

    const {email} = req.body
    const usuario = await Usuario.findOne({where : {email}})
    if(!usuario){
        return  res.render('auth/olvide-password',{
            pagina: 'Recupera tu acceso a Bienes Raices',
            csrfToken: req.csrfToken(),
            errores: [{msg: 'El email no pertenece a ningun usuario'}]
        })
    }
    //generar un toker y enviar el email
    usuario.token = generarId();
    await usuario.save();
    //enviar email
    emailOlvidePassword({
        email:usuario.email,
        nombre:usuario.nombre,
        token:usuario.token

    })
    //renderizar el mensaje de confirmacion
    res.render('templates/mensaje',{
        pagina:"Reestablece tu password",
        mensaje: "hemos enviado un email con las instrucciones"
    })
}

const comprobarToken = async(req,res)=>{
    const {token} = req.params;
    const usuario = await Usuario.findOne({where:{token}})
    if (!usuario){
        return res.render('auth/confirmar-cuenta',{
            pagina:'Reestablece tu password',
            mensaje: 'Hubo un error al validar tu informacion, intenta nuevamente',
            error:true
        })
    }

    //mostrar formulario para modificar el password
    res.render('auth/reset-password',{
        pagina:"Reestablece tu password",
        csrfToken: req.csrfToken()
    })
}

const nuevoPassword = async(req,res)=>{
    //validar password
    await check('password').isLength({min: 6}).withMessage("la contraseña debe tener al menos 6 caracteres").run(req)
    let resultado = validationResult(req)
    //verificar que el resultado este vacio
    if(!resultado.isEmpty()){
        //errores
        return  res.render('auth/reset-password',{
            pagina: 'Reestablece tu Password',
            csrfToken: req.csrfToken(),
            errores: resultado.array(),
        })
    }
    const {token} = req.params
    const {password} =req.body
    //identificar quien hace el pedido
    const usuario= await Usuario.findOne({where:{token}})

    //hashear de nuevo el password
    const salt = await bcrypt.genSalt(10)
    usuario.password = await bcrypt.hash(password,salt);     
    usuario.token=null;  

    await usuario.save();
    res.render('auth/confirmar-cuenta',{
        pagina:'Password reestablecido',
        mensaje: 'El password se guardo correctamente'
    })
}

export {
    formularioLogin,
    autenticar,
    cerrarSesion,
    formularioRegistro,
    registrar,
    confirmar,
    formularioOlvidePassword,
    resetPassword,
    comprobarToken,
    nuevoPassword,
}