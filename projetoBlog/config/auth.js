const localStrategy = require("passport-local").Strategy
const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

//model user
require("../models/Usuario")
const Usuario = mongoose.model("usuarios")



module.exports = function(passport){

passport.use(new localStrategy({usernameField: 'email', passwordField: "senha"}, (email,senha,done)=>{


    Usuario.findOne({email:email}).lean().then(user =>{
        if(!user){
            return done(null, false, {message: "Essa conta não exite"})
        }
        bcrypt.compare(senha, user.senha, (erro, batem)=>{
            if(batem){
                return done(null,user)
            }else{
                return done(null, false, {message:"Senha incorreta"})
            }
        })

    })
}))

passport.serializeUser((user, done)=>{
    done(null, user)
})


passport.deserializeUser((id, done)=>{
    Usuario.findById(id, (err, User)=>{
        done(err, User)
    })
})

}