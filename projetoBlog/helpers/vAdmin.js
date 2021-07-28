module.exports = {
    vAdmin: function(req,res,next){

        if(req.isAuthenticated() && req.user.admin == 1){
            return next();
        }

        req.flash("error_msg", "Você não é um admin")
        res.redirect("/")
    }
}