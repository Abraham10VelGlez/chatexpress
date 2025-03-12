import express from "express"
import logger from "morgan"
import { Server } from "socket.io"
import { createServer } from 'node:http'
import dotenv from "dotenv"
import { createClient } from "@libsql/client"

//llamada a las variables de entorno de .env
dotenv.config()

const port = process.env.PORT ?? 3000

const app = express()
//implementacion de servidor http
const nodeserver = createServer(app)
///usarl el socket io de bidireccional entrada y salida
const io = new Server(nodeserver, {
    connectionStateRecovery: {}
})

//conexion con TURSO
const db = createClient({
    url: "libsql://mibase-abraham10velglez.turso.io",
    authToken: process.env.DBTOKEN
})

///CREACION DE UNA TABLA DESDE EXPRESS A TURSO
/*
await db.execute(`
    CREATE TABLE  IF NOT EXISTS messages (
    id integer primary key autoincrement,
    content text
    )
    `)
*/

///CREACION DE UNA TABLA DESDE EXPRESS A TURSO CON USUARIOS YA MAS COMPLETO
// Garantiza que el campo no tenga valores repetido
await db.execute(`
    CREATE TABLE IF NOT EXISTS messagesuser (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT,    
        user TEXT
    );`);


/*
const io = new Server(nodeserver, {
    cors: {
        origin: "*", // Cambia según la URL de tu frontend
        methods: ["GET", "POST"]
    }
});
*/
//cuando el sokcet tenga una cone xion ejecuta esto
io.on('connection', async (socket) => {
    console.log(' user has connected, hello');
    socket.on('disconnect', () => {
        console.log('user has disconnected, bye');
    })



    socket.on('chat message', async (msm) => {
        // console.log('llegada de mensaje:' + msm);
        //es un brokcats para un mensaje para todos para esparcir
        // io.emit('chat message', msm)

        //cada vez que llegue un mensaje se guarda en base de datos
        let res
        //cada vez que llegua un socket de cada mensaje se recupera el nombre del usuario
        const username = socket.handshake.auth.username ?? 'anonimus'
        try {

            res = await db.execute({
                //sql: 'INSERT INTO messages(content) VALUES(:msm,:username)',
                sql: 'INSERT INTO messagesuser(content, user) VALUES(:msm,:username)',
                args: { msm, username }
            })
        } catch (a) {
            console.log(a);
            return
        }
        io.emit('chat message', msm, res.lastInsertRowid.toString(), username)

    })

    ///ver el objeto del cliente
    //console.log(socket.handshake.auth);

    //si no se recupero, recuparar los mensjaes sin conexion
    if (!socket.recovered) {
        try {
            const results = await db.execute({
                //sql: 'select id, content from messages where id > ?',
                sql: 'select id, content, user from messagesuser where id > ?',
                args: [socket.handshake.auth.serverOffset ?? 0]
            })
            results.rows.forEach(row => {
                socket.emit('chat message', row.content, row.id.toString(), row.user)
            })
        } catch (e) {
            console.log('existe un errror: ' + e);

        }
    }
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