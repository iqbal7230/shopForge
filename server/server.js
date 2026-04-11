import express, { json }  from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js'
import productRoutes from './routes/product.routes.js'

const app = express()
app.use(express.json())

dotenv.config()
const PORT = process.env.PORT

app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/products', productRoutes)
app.get("/",(req,res)=>{
    res.send("Live server")
})
app.listen(PORT, ()=>{
    console.log(`Server running on http:localhost:${PORT}`)
})