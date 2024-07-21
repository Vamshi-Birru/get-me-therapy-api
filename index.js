import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs'
import User from './userModel.js';
import mongoose from 'mongoose';

 
const app = express();

app.use(cors());
app.use(express.json())
dotenv.config()

const username = process.env.MONGO_USERNAME;
const password = process.env.MONGO_PASSWORD;
const connection = async (USER,PASS) => {    
    try{
        await mongoose.connect(process.env.URL);
        console.log('Mongo DB is 💝')
    }catch(er){
        console.log('failed connection',er)
    }
}; 
connection(username, password);
const signup = async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password || username.trim() === "" || email.trim() === "" || password.length < 3) {
        return res.status(422).json({ message: "Invalid data" });
    }

    try {
        const emailExists = await User.findOne({ email });
        const usernameExists = await User.findOne({ username });

        if (usernameExists) {
            return res.status(409).json({ message: 'Username already exists' });
        }

        if (emailExists) {
            return res.status(409).json({ message: 'Email already exists' });
        }

        const salt = bcrypt.genSaltSync(10); 
        const hashedPassword = bcrypt.hashSync(password, salt); 

        const user = new User({ username, email, password: hashedPassword });

        await user.save();
        return res.status(201).json({ user });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal error", error: err });
    }
};

const loginUser = async (req,res) => {
    const {email,password} = req.body;

    if(!email && email.trim() === "" &&
        !password && password.length < 7
    ){
        return res.status(422).json({message : "Invalid data"}) ;
    }

    let existsUser;

    try{
        existsUser = await User.findOne({email}); //finding email from mongo collection
    }catch(er){
        return console.log(er)
    }

    if(!existsUser){
        return res.status(404).json({message : "no user found" });
    }

    const isPassCorrect = bcrypt.compareSync(password,existsUser.password);

    if(!isPassCorrect){
        return res.status(400).json({ message : "Incorrect password"});
    }else{
        return res.status(200).json({ id : existsUser._id,message : "Login Successfully"})
    }
}
app.use('/login',loginUser);
app.use("/register",signup)



const PORT = process.env.PORT
app.listen(PORT,() => {
    console.log('Connected to server!!!')
});