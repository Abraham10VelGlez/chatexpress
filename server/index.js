import express from "express"
import logger from "morgan"
import { Server } from "socket.io"
import { createServer } from 'node:http'

const port = process.env.PORT ?? 3000

const app = express()
//implementacion de servidor http
const nodeserver = createServer(app)
///usarl el socket io de bidireccional entrada y salida
const io = new Server(nodeserver,{
    connectionStateRecovery: {}
})
/*
const io = new Server(nodeserver, {
    cors: {
        origin: "*", // Cambia según la URL de tu frontend
        methods: ["GET", "POST"]
    }
});
*/
//cuando el sokcet tenga una cone xion ejecuta esto
io.on('connection', (socket) => {
    console.log(' user has connected, hello');
    socket.on('disconnect', () => {
        console.log('user has disconnected, bye');
    })

    socket.on('chat message', (msm) => {
        console.log('llegada de mensaje:' + msm);
        //es un brokcats para un mensaje para todos para esparcir
        io.emit('chat message', msm)

    })

});
//nos da la informacion de las peticiones
app.use(logger('dev'))

app.get('/', (req, res) => {
    //res.send('inicio de chat')
    //process.cwd() es de node para decir desde donde se inicializo esta ruta
    res.sendFile(process.cwd() + '/client/index.html')
});


//escucha solo al servidor 
// app.listen(port, () => {
// console.log(`abrajam, hola server running on to port ${port}`);
// })

nodeserver.listen(port, () => {
    console.log(`abrajam, hola server running on to port ${port}`);
})