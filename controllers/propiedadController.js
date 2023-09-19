import { unlink } from 'node:fs/promises'
import { body, validationResult } from "express-validator"
import { Precio, Categoria, Propiedad, Mensaje, Usuario } from '../models/index.js'
import { esVendedor, formatearFecha } from '../helpers/index.js'

const admin = async (req, res) => {
    //leer queryString

    const { pagina: paginaActual } = req.query
    const expresion = /^[1-9]$/
    if (!expresion.test(paginaActual)) {
        return res.redirect("/mis-propiedades?pagina=1")
    }
    try {
        const { id } = req.usuario
        const usuario = await Usuario.findByPk(id);
        //limites para el paginador
        const limit = 5;
        const offset = ((paginaActual * limit) - limit)

        const [propiedades, total] = await Promise.all([
            Propiedad.findAll({
                limit,
                offset,
                where: {
                    usuarioId: id
                },
                include: [
                    { model: Categoria, as: 'categoria' },
                    { model: Precio, as: 'precio' },
                    { model: Mensaje, as: 'mensajes' }
                ]
            }),
            Propiedad.count({
                where: {
                    usuarioId: id
                }
            })
        ])
        //console.log(paginaActual)
        res.render('propiedades/admin', {
            pagina: 'Mis propiedades',
            csrfToken: req.csrfToken(),
            propiedades,
            paginas: Math.ceil(total / limit),
            paginaActual: Number(paginaActual),
            total,
            offset,
            limit,
            usuario
        })
    } catch (error) {
        console.log(error)
    }

}
//formulario para crear una nueva propiedad
const crear = async (req, res) => {
    const { usuario } = req;
    //consultar modelo de precios y categoria
    const [categorias, precios] = await Promise.all([
        Categoria.findAll(),
        Precio.findAll()
    ])

    res.render('propiedades/crear', {
        pagina: 'Crear propiedad',
        csrfToken: req.csrfToken(),
        categorias,
        usuario,
        precios,
        datos: {}
    })
}

const guardar = async (req, res) => {
    //validacion 
    let resultado = validationResult(req)
    const { usuario } = req;

    if (!resultado.isEmpty()) {
        const [categorias, precios] = await Promise.all([
            Categoria.findAll(),
            Precio.findAll()
        ])

        res.render('propiedades/crear', {
            pagina: 'Crear propiedad',
            csrfToken: req.csrfToken(),
            categorias,
            precios,
            usuario,
            errores: resultado.array(),
            datos: req.body
        })
    }

    //crear registro
    const { titulo, descripcion, habitaciones, estacionamiento, baños, calle, lat, lng, precio: precioId, categoria: categoriaId } = req.body
    const { id: usuarioId } = req.usuario
    try {
        const propiedadGuardada = await Propiedad.create({
            titulo,
            descripcion,
            habitaciones,
            estacionamiento,
            baños,
            calle,
            lat,
            lng,
            precioId,
            categoriaId,
            usuarioId,
            imagen: ''
        })

        const { id } = propiedadGuardada
        res.redirect(`/propiedades/agregar-imagen/${id}`)
    } catch (error) {
        console.log(error)
    }
}

const agregarImagen = async (req, res) => {
    const { id } = req.params
    //validar q la propiedad exista
    const propiedad = await Propiedad.findByPk(id)
    if (!propiedad) {
        return res.redirect("/mis-propiedades")
    }
    //validar q la propiedad no este publicada
    if (propiedad.publicado) {
        return res.redirect("/mis-propiedades")
    }

    //validad q la propiedad pertenece a quien visita la pagina
    if (req.usuario.id.toString() !== propiedad.usuarioId.toString()) {
        return res.redirect("/mis-propiedades")
    }

    res.render('propiedades/agregar-imagen', {
        pagina: `Agregar imagen: ${propiedad.titulo}`,
        csrfToken: req.csrfToken(),
        propiedad
    })
}

const almacenarImagen = async (req, res, next) => {
    const { id } = req.params
    const propiedad = await Propiedad.findByPk(id)
    if (!propiedad) {
        return res.redirect("/mis-propiedades")
    }
    //validar q la propiedad no este publicada
    if (propiedad.publicado) {
        return res.redirect("/mis-propiedades")
    }

    //validad q la propiedad pertenece a quien visita la pagina
    if (req.usuario.id.toString() !== propiedad.usuarioId.toString()) {
        return res.redirect("/mis-propiedades")
    }

    try {
        //console.log(req.file)

        //almacenar la imagen para publicar propiedad
        propiedad.imagen = req.file.filename
        propiedad.publicado = 1
        await propiedad.save()
        next()
        //res.redirect('/mis-propiedades')
    } catch (error) {
        console.log(error)
    }
}
const editar = async (req, res) => {
    const { id } = req.params
    const { usuario } = req;
    //validar q la propiedad exista
    const propiedad = await Propiedad.findByPk(id)

    if (!propiedad) {
        return res.redirect("/mis-propiedades")
    }
    //revisar quien visita la url es quien creo la propiedad
    if (propiedad.usuarioId.toString() !== req.usuario.id.toString()) {
        return res.redirect("/mis-propiedades")
    }
    //consultar modelo de precios y categoria
    const [categorias, precios] = await Promise.all([
        Categoria.findAll(),
        Precio.findAll()
    ])

    res.render('propiedades/editar', {
        pagina: `Editar propiedad: ${propiedad.titulo}`,
        csrfToken: req.csrfToken(),
        categorias,
        usuario,
        precios,
        datos: propiedad
    })
}

const guardarCambios = async (req, res) => {

    //verificar la validacion
    const { usuario } = req;
    let resultado = validationResult(req)

    if (!resultado.isEmpty()) {
        const [categorias, precios] = await Promise.all([
            Categoria.findAll(),
            Precio.findAll()
        ])

        res.render('propiedades/editar', {
            pagina: 'Editar propiedad',
            csrfToken: req.csrfToken(),
            categorias,
            precios,
            usuario,
            errores: resultado.array(),
            datos: req.body
        })
    }

    const { id } = req.params
    //validar q la propiedad exista
    const propiedad = await Propiedad.findByPk(id)

    if (!propiedad) {
        return res.redirect("/mis-propiedades")
    }
    //revisar quien visita la url es quien creo la propiedad
    if (propiedad.usuarioId.toString() !== req.usuario.id.toString()) {
        return res.redirect("/mis-propiedades")
    }
    //reescribir el objeto y actualizarlo
    try {
        const { titulo, descripcion, habitaciones, estacionamiento, baños, calle, lat, lng, precio: precioId, categoria: categoriaId } = req.body
        propiedad.set({
            titulo,
            descripcion,
            habitaciones,
            estacionamiento,
            baños,
            calle,
            lat,
            lng,
            precioId,
            categoriaId
        })
        await propiedad.save()
        res.redirect("/mis-propiedades")

    } catch (error) {
        console.log(error)
    }
}

const eliminar = async (req, res) => {
    const { id } = req.params
    //validar q la propiedad exista
    const propiedad = await Propiedad.findByPk(id)

    if (!propiedad) {
        return res.redirect("/mis-propiedades")
    }
    //revisar quien visita la url es quien creo la propiedad
    if (propiedad.usuarioId.toString() !== req.usuario.id.toString()) {
        return res.redirect("/mis-propiedades")
    }
    //eliminar las imagenes
    await unlink(`public/uploads/${propiedad.imagen}`)
    console.log(`se elimino la imagen ${propiedad.imagen}`)

    //eliminar la propiedad
    await propiedad.destroy()
    res.redirect("/mis-propiedades")
}

//modifica el estado de la propiedad
const cambiarEstado = async (req, res) => {
    const { id } = req.params
    //validar q la propiedad exista
    const propiedad = await Propiedad.findByPk(id)

    if (!propiedad) {
        return res.redirect("/mis-propiedades")
    }
    //revisar quien visita la url es quien creo la propiedad
    if (propiedad.usuarioId.toString() !== req.usuario.id.toString()) {
        return res.redirect("/mis-propiedades")
    }

    //actualizar
    propiedad.publicado = !propiedad.publicado
    await propiedad.save()
    res.json({
        resultado: 'ok'
    })
}


//muestra una propiedad
const mostrarPropiedad = async (req, res) => {
    const { id } = req.params
    //comprobar q la propiedad exista
    const propiedad = await Propiedad.findByPk(id, {
        include: [
            { model: Precio, as: 'precio' },
            { model: Categoria, as: 'categoria' },
        ]
    })
    if (!propiedad || !propiedad.publicado) {
        return res.redirect('/404')
    }

    res.render("propiedades/mostrar", {
        propiedad,
        pagina: propiedad.titulo,
        csrfToken: req.csrfToken(),
        usuario: req.usuario,
        esVendedor: esVendedor(req.usuario?.id, propiedad.usuarioId) // el ? es el optional chaining, sirve para decir puede o no existir ese valor

    })
}

const enviarMensaje = async (req, res) => {
    const { id } = req.params
    //comprobar q la propiedad exista
    const propiedad = await Propiedad.findByPk(id, {
        include: [
            { model: Precio, as: 'precio' },
            { model: Categoria, as: 'categoria' },
        ]
    })
    if (!propiedad) {
        return res.redirect('/404')
    }

    //renderizar errores 
    let resultado = validationResult(req)
    if (!resultado.isEmpty()) {
        return res.render("propiedades/mostrar", {
            propiedad,
            pagina: propiedad.titulo,
            csrfToken: req.csrfToken(),
            usuario: req.usuario,
            esVendedor: esVendedor(req.usuario?.id, propiedad.usuarioId), // el ? es el optional chaining, sirve para decir puede o no existir ese valor
            errores: resultado.array()
        })
    }

    const { mensaje } = req.body
    const { id: propiedadId } = req.params
    const { id: usuarioId } = req.usuario
    //almacenar el mensaje
    await Mensaje.create({
        mensaje,
        propiedadId,
        usuarioId

    })

    res.redirect('/')
}

//leer mensajes recibidos
const verMensajes = async (req, res) => {
    const { id } = req.params
    const { usuario } = req;
    //validar q la propiedad exista
    const propiedad = await Propiedad.findByPk(id, {
        include: [
            {
                model: Mensaje, as: 'mensajes',
                include: [
                    { model: Usuario.scope('eliminarPassword'), as: 'usuario' }
                ]
            }
        ]
    })
    if (!propiedad) {
        return res.redirect("/mis-propiedades")
    }
    //revisar quien visita la url es quien creo la propiedad
    if (propiedad.usuarioId.toString() !== req.usuario.id.toString()) {
        return res.redirect("/mis-propiedades")
    }

    res.render('propiedades/mensajes', {
        pagina: 'Mensajes',
        usuario,
        mensajes: propiedad.mensajes,
        formatearFecha,
        usuario
    })
}

const perfil = async (req, res) => {
    // Obtener los datos del usuario y la cantidad de propiedades
    const { usuario } = req;
    const { id } = req.usuario;
    const cantidadDePropiedades = await Propiedad.count({
        where: {
            usuarioId: id,
        },
    });
    // Renderizar la vista de perfil y pasar los datos
    res.render('propiedades/perfil', {
        pagina: "Mi perfil",
        usuario,
        csrfToken: req.csrfToken(),
        cantidadDePropiedades,
    });
};
export {
    admin,
    crear,
    guardar,
    agregarImagen,
    almacenarImagen,
    editar,
    guardarCambios,
    eliminar,
    cambiarEstado,
    mostrarPropiedad,
    enviarMensaje,
    verMensajes,
    perfil
}