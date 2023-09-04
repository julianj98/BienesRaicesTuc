import express from "express"
import {inicio,categoria,noEncontrado,buscador} from "../controllers/appController.js"
import identificarUsuario from "../middleware/identificarUsuario.js"

const router = express.Router()

//pag de inicio
router.get('/',identificarUsuario,inicio)
//categorias

router.get('/categorias/:id',categoria)
//pag 404
router.get('/404',noEncontrado)

//buscador
router.post('/buscador',buscador)


export default router;