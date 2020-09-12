const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true
    },
    mobile: {
        type: Number,
        required: true,
        unique: true
    }
});

userSchema.pre("save", async (next) => {
    try{
        if(!this.isModified("password")){
            return next();
        }
        let hashedPass = await bcrypt.hash(this.password, 10);
        this.password = hashedPass;
        return next();
    }catch(err){
        return next(err);
    }
});

userSchema.methods.comparePassword = async function(candidatePass, next) {
    try{
        let isMatch = await bcrypt.compare(candidatePass, this.password);
        return isMatch;
    }catch(err){
        return next(err);
    }
}

const User = mongoose.model("User", userSchema);

module.exports = User;