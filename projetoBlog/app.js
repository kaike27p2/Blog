const express = require('express')
const app = express()
const handlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const admin = require('./routes/admin')
const usuarios = require("./routes/usuarios")
const path = require('path')
const mongoose = require ('mongoose')
const session = require('express-session')
const flash = require('connect-flash')
require("./models/Postagem")
require("./models/Categorias")
const Categoria = mongoose.model("categorias")
const Postagem = mongoose.model("postagens")
const passport = require("passport")
require("./config/auth")(passport)
const {vAdmin} = require('../projetoBlog/helpers/vAdmin')

//configurações
    // Sessão
    app.use(session({
        secret: "cursodenode",
        resave: true,
        saveUnitialized: true
    }))

    app.use(passport.initialize())
    app.use(passport.session())
    app.use(flash())
    //Middleware
        app.use((req,res,next) => {
            res.locals.success_msg = req.flash("success_msg")
            res.locals.error_msg = req.flash("error_msg")
            res.locals.error = req.flash("error")
            res.locals.user = req.user || null
            next()
        })

    //bodyParser
       app.use(bodyParser.urlencoded({extended: true}))
       app.use(bodyParser.json())

    //handlebars
         app.engine('handlebars', handlebars({defaultLayout: 'main'}))
        app.set('view engine', 'handlebars')    
    
    //mongoose
    mongoose.connect('banco de dados', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(() => {
        console.log("Conectado ao Banco de Dados")
    }).catch((erro) => {
        console.log(erro)
    })

    //public
        app.use(express.static(path.join(__dirname, 'public')))
//rotas


app.get('/', (req,res)=>{

    Postagem.find().populate("categoria").lean().sort({date: "desc"}).then((postagens)=>{
        res.render("index", {postagens: postagens})
    }).catch((err)=>{
        req.flash("error_msg", "Houve um erro interno")
        res.redirect("/404")
    })
})

app.get('/postagem/:slug', (req,res)=>{
    Postagem.findOne({slug: req.params.slug}).lean().then(
        (postagem)=>{
            if(postagem){
                res.render("postagem/index", {postagem:postagem})
            }else{
                req.flash("error_msg", "Essa postagem não existe")
                res.redirect("/")
            }
        }
    )
})

app.get("/categorias", (req,res)=>{
    Categoria.find().lean().then((categoria)=>{
        res.render("categoria/index", {categoria:categoria})
    }).catch((err)=>{
        req.flash("erro_msg", "Houve um erro interno ao carregar as Categorias")
        res.redirect("/")
    })

})

app.get("/categorias/:slug", (req,res)=>{
    Categoria.findOne({slug: req.params.slug}).lean().then((categoria)=>{
        //caso exista a categoria
        if(categoria){

          Postagem.find({categoria:categoria._id}).lean().then(postagem =>{
            res.render("categoria/postagem", {postagem:postagem, categoria: categoria })
          }).catch((err)=>{
            req.flash("error_msg", "Não existe posts nessa categoria")
          })

        }else{
            req.flash("error_msg", "Esta categoria não existe")
            res.redirect("/")
        }


    }).catch((err)=>{
        req.flash("error_msg", "Houve um erro ao Carregar a pagina desta categoria")

    })
})

app.get("/404", (req,res)=>{
    res.send("Erro interno")
})
app.use("/usuarios", usuarios)
app.use('/admin', vAdmin, admin)

//outros

app.listen(3003, () => {console.log("App On!!")})