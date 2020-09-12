const jwt = require('jsonwebtoken');
const db = require("../models")

exports.signin = async (req, res, next) => {
    try{
        let user = await db.User.findOne({email:req.body.email});
        let isMatch = await user.comparePassword(req.body.password);
        if(isMatch){
            let token = jwt.sign({
                id:user.id,
                email:user.email
            }, process.env.SECRET_KEY);
            res.status(200).json({
                email:user.email,
                token:token
            });
        }else{
            next({
                status:400,
                message:"Invalid Email or Password!"
            })
        }
    }catch(err){
        next({
            status:400,
            message:"Invalid Email or Password!"
        })
    }
}
exports.signup = async (req, res, next) => {
    try{
        let user = await db.User.create(req.body);
        let token = jwt.sign({
            id:user.id,
            email:user.email
        }, process.env.SECRET_KEY);
        res.status(200).json({
            email:user.email,
            token:token
        })
    }catch(err){
        if(err.code == 11000){
            err.message = "Email or mobile number already exists"
        }
        next({
            status:400,
            message:err.message
        });
    }
}