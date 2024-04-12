import {Precio,Categoria,Propiedad, Usuario} from '../models/index.js'
import {Sequelize} from 'sequelize'
const inicio = async(req,res)=>{

    const [categorias, precios,casas, departamentos] = await Promise.all([
        Categoria.findAll({raw:true}),
        Precio.findAll({raw:true}),
        Propiedad.findAll({
            limit:3,
            where:{
                categoriaId:1
            },
            include:[
                {
                    model:Precio,
                    as:'precio'
                }
            ],
            order:[
                  ['createdAt','DESC']
            ]
        }),
        Propiedad.findAll({
            limit:3,
            where:{
                categoriaId:2
            },
            include:[
                {
                    model:Precio,
                    as:'precio'
                }
            ],
            order:[
                 ['createdAt','DESC']
            ]
        })
    ])
    let usuario = null; // Inicializa usuario como null
    if( req.usuario){
        const { id } = req.usuario;
        usuario = await Usuario.findByPk(id);    
    } 
    res.render('inicio',{
        pagina:'Inicio',
        categorias,
        precios,
        casas,
        departamentos,
        usuario,
        csrfToken: req.csrfToken()
    })
}

const categoria =  async(req,res)=>{
    const { id} = req.params
    const { usuario } = req;
    //comprobar q la categoria exista 
    const categoria = await Categoria.findByPk(id)
    if(!categoria){
        return res.redirect('/404')
    }
    if (categoria.nombre.toLowerCase() === 'cabañas') {
        categoria.nombre = 'Cabaña'; // Corregir la categoría "cabaña" a "cabañas"
    }

    //obtener las propiedades
    const propiedades= await Propiedad.findAll({
        where:{
            categoriaId:id
        },
        include:[
            {model:Precio, as: 'precio'}
        ]
    })
    res.render('categoria',{
        pagina:`${categoria.nombre}s en venta`,
        propiedades,
        usuario,
        csrfToken: req.csrfToken()

    })
}

const noEncontrado = (req,res)=>{
    res.render('404',{
        pagina:'No encontrada',
        csrfToken: req.csrfToken()

    })
}

const buscador = async (req,res)=>{
    const {termino} =req.body
    const { usuario } = req;

    //validar q termino no este vacio
    if(!termino.trim()){
        return res.redirect('back')
    }

    //consultar las propiedades
    const propiedades = await Propiedad.findAll({
        where:{
            titulo:{
                [Sequelize.Op.like]: '%' + termino + '%'
            },
        },
        include:[
            {model:Precio, as: 'precio'}
        ]
    })
    res.render('busqueda',{
        pagina: 'Resultados de la busqueda',
        propiedades,
        usuario,
        csrfToken: req.csrfToken()

    })
}

export {
    inicio,
    categoria,
    noEncontrado,
    buscador
}