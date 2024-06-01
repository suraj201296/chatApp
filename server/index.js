
const http = require('http');
const {WebSocketServer} = require('ws');
const uuidv4 = require('uuid').v4;

const url  = require('url')


const server = http.createServer()
const wsServer = new WebSocketServer({server});
const port = 8000;


const connections = {}
const users = {};

const broadcast = () => {
    Object.keys(connections).forEach(uuid => {
        const connection = connections[uuid];
        const message = JSON.stringify(users);
        connection.send(message);
    })
}

const handleMessage = (message,uuid) => {
    const message = JSON.parse(message.toString());
    console.log(message);
    const user = users[uuid];
    user.state = message;

    broadcast();

}

const handleClose = (uuid) => {
    
    console.log(`${users[uuid].username} is disconnected`);

    delete connections[uuid];
    delete users[uuid];

    broadcast();
}

wsServer.on('connection', (connection,request) => {

    const uuid = uuidv4();
    const username = url.parse(request.url, true).query;

    connections[uuid] = connection;
    users[uuid] = {
        username,
        state : {}
    }
    console.log(`connected ${username} in ${Object.getOwnPropertyNames(users)}`);
       
    connection.on('message', message => handleMessage(message,uuid));
    connection.on('close', ()=> handleClose());

});

server.listen(port, ()=> {
    console.log(`websocket is running on port ${port}`);
})

