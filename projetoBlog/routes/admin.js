const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/Categorias')
require('../models/Postagem')
const Categorias = mongoose.model('categorias')
const Postagem = mongoose.model('postagens')

//renderizando o /adimin/index
router.get('/',(req, res, next) => {
    res.render('admin/index')
})

router.get('/posts', (req,res,next) => {
    res.send('Aqui é os Posts')
})

router.get('/categorias', (req, res) => {
    Categorias.find().lean().then((categorias)=> {
        res.render('admin/categorias', {categorias:categorias})
    }).catch((err)=>{
        req.flash("error_msg", "Houve um erro ao Listar categorias")
        res.redirect("/admin")
    })
})
router.get('/categorias/add', (req, res) => {
    res.render('admin/addcategorias')
})

router.post('/categorias/nova', (req, res) => {
  
    var erros = []

    if (!req.body.nome || req.body.nome === undefined || req.body.nome === null){
        erros.push({texto: "Nome Inválido"})
    }

    if(!req.body.slug || req.body.slug === undefined ||  req.body.slug === null){
        erros.push({texto: "Slug Inválido"})
    }
    
    if(req.body.nome.length <= 0){
        erros.push({texto: "Nome de Categoria Muito Pequena"})
    }

    if(erros.length > 0){
        res.render("admin/addcategorias", {erros: erros})
    }else{
        const novaCategoria = {
            nome:req.body.nome,
            slug:req.body.slug,
        }
        
        new Categorias(novaCategoria).save().then(() => {
            req.flash("success_msg", "Categoria Criada Com Sucesso")
            res.redirect("/admin/categorias")
        }).catch((err) => {
            req.flash("error_msg", "Houve algum erro ao Criar Categoria")
            res.redirect("/admin")
        })
    }

    
})

router.get('/categorias/edit/:id', (req,res)=>{
    Categorias.findOne({_id:req.params.id}).lean().then((categoria)=>{
        res.render("admin/editcategoria", {categoria:categoria})
    }).catch((err)=>{
        req.flash("error_msg", "Essa Categoria Não Existe")
        res.redirect("admin/categorias")

    })
  

})

router.post("/categorias/edit",(req,res) =>{
    Categorias.findOne({_id: req.body.id}).then((categoria)=>{
        categoria.nome = req.body.nome
        categoria.slug = req.body.slug

        categoria.save().then(()=>{
            req.flash("success_msg", "Categoria Edita Com Sucesso")
            res.redirect("/admin/categorias")
        }).catch(()=>{
            req.flash("error_msg","Houve um erro interno ao editar a categoria")
            res.redirect("/admin/categorias")
        })
    }).catch((err)=>{
        req.flash("error_msg", "Não foi Possivel editar a categoria")
        res.redirect("/admin/categorias")
    })
})

router.post("/categorias/deletar", (req,res)=>{
    Categorias.deleteOne({_id:req.body.id}).then(()=>{
        req.flash("success_msg", "Categoria Removida Com Sucesso")
        res.redirect("/admin/categorias")
    }).catch((err)=>{
        req.flash("error_msg", "Categoria Não Pôde ser Removida")
        res.redirect("/admin/categorias")
    })
})

router.get("/postagens", (req,res)=>{
    Postagem.find().lean().populate("categoria").sort({data:"desc"}).then((postagens)=>{
        res.render("admin/postagens", {postagens:postagens})
    }).catch((err)=>{
        req.flash("error_msg", "Houve um erro ao Listar postagens")
        req.redirect("/admin")
    })
})

router.get("/postagens/add", (req,res)=>{
    Categorias.find().lean().then((categorias)=>{
        res.render("admin/addpostagens", {categorias:categorias})
    }).catch((err)=>{
        req.flash("error_msg", "Houve um erro ao carregar o formulário")
        res.redirect("/admin")
    })

})

router.post("/postagens/nova", (req,res)=>{
    const novaPostagem = {
        titulo: req.body.titulo,
        slug: req.body.slug,
        descricao: req.body.descricao,
        conteudo: req.body.conteudo,
        categoria: req.body.categoria
    }

    let erros =[]

    if (!req.body.titulo || req.body.titulo === null || req.body.titulo === undefined ||
        !req.body.slug || req.body.slug === null || req.body.slug === undefined||
        !req.body.descricao || req.body.descricao === null || req.body.descricao === undefined||
        !req.body.conteudo || req.body.conteudo === null || req.body.conteudo === undefined){       
        erros.push({texto: "Preencha Todos os Campos de forma correta !!!"})
        res.render("admin/addpostagens", {erros:erros})
        }else{
        new Postagem(novaPostagem).save().then(()=>{
            req.flash("success_msg", "Postagem cadastrada com sucesso.")
            res.redirect("/admin/postagens")
        }).catch((err)=>{
            req.flash("error_msg", "Houve algum erro ao cadastrar postagem")
            res.redirect("/admin/postagens")
            console.log(err)
        })
    }

})

router.get("/postagens/edit/:id", (req, res)=>{

    Postagem.findOne({_id: req.params.id}).lean().then((postagem)=>{
    
        Categorias.find().lean().then((categorias)=>{
            res.render("admin/editpostagens", {postagem:postagem, categorias:categorias,})

    }).catch((err)=>{
        req.flash("error_msg", "Houve um erro ao alistar as categorias")
        res.redirect("/admin/postagens")
    })
    }).catch((err)=>{
        req.flash("error_msg", "Houve um erro ao carregar o formulario de postganes")
        res.redirect("/admin/postagens")
    })


})

router.post("/postagens/edit",(req,res)=>{

    Postagem.findOne({_id: req.body.id}).then((postagem)=>{
        postagem.titulo = req.body.titulo
        postagem.slug = req.body.slug
        postagem.descricao = req.body.descricao
        postagem.conteudo = req.body.conteudo
        postagem.categoria = req.body.categoria

        postagem.save().then(()=>{
            req.flash('success_msg', 'Postagem editada com sucesso')
            res.redirect("/admin/postagens")
        }).catch((err)=>{
            req.flash('error_msg', 'Postagem não pôde ser editada')
            res.redirect("/admin/postagens")
        })

    }).catch((err)=>{
        console.log(err)
    })



})

router.post("/postagens/deletar",(req,res)=>{
    Postagem.deleteOne({_id: req.body.id}).then(()=>{
        req.flash("success_msg", "Postagem deletada com sucesso")
        res.redirect("/admin/postagens")
    }).catch((err)=>{
        req.flash("error_msg", "Houve um erro ao deletar Postagem")
        res.redirect("/admin/postagens")
    })
})

module.exports = router