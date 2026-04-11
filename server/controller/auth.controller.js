import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
// import PrismaClient from '@prisma/client';
import { prisma } from '../config/db.js';


export const signin = async (req, res) => {
    try {
        const { fullname, email, password } = req.body;
        if (!fullname || !email || !password) {
            return res.status(400).json({ message: "All fields are required" })
        }
        const existingUser = await prisma.user.findUnique({ where: { email } })
        if (existingUser) {
            return res.status(400).json({ message: "user already exists" })
        }
        const hashPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashPassword,
                full_name: fullname,
                role: "USER" //default role
            }
        })
        const token = jwt.sign({ userId: user.id, fullname: user.full_name, role: user.role }, process.env.SECRETKEY)
        res.status(201).json({
            token,
            message: "User created Successfully"
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "error in signin" })
    }

}
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password not entered" })
        }
        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) {
            return res.status(400).json({ message: "email not found" })
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "password is wrong" })
        }
        const token = jwt.sign({ userId: user.id, fullname: user.full_name, role: user.role }, process.env.SECRETKEY)
        res.status(200).json({
            token,
            message: "User logged In Successfully"
        })
    }
    catch (error) {
        res.status(500).json({ error: "login error " })
    }
}      

export const logout = (req, res)=>{
    // pending
}
export const refresh =()=>{
     // pending
}
export const forgetPassword =()=>{
     // pending
}