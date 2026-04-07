import express, { json }  from 'express';
import dotenv from 'dotenv';
import registerRoutes from './routes/auth.routes.js'
import loginRoutes from './routes/auth.routes.js'

const app = express()
app.use(express.json())

dotenv.config()
const PORT = process.env.PORT

app.use('/api/v1/', registerRoutes)
app.use('/api/v1/', loginRoutes)
app.get("/",(req,res)=>{
    res.send("Live server")
})
app.listen(PORT, ()=>{
    console.log(`Server running on http:localhost:${PORT}`)
})