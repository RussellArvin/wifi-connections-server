const find = require('local-devices');
const cron = require('node-cron');
const db = require('./dynamo');


const connections = [];


cron.schedule('* * * * *', () => {
    main();
  });


//Main Function
function main(){
    //Finds connected Devices
    find().then((devices)=>{
        const date = new Date();

        for(const device of devices){
            if(!locateMAC(device.mac)){//If mac address is not stored on local server memory
                connections.push({mac:device.mac, date:date}) //Push to array of connections with connection DateTime and IP
                db.Query(device.mac,date,"Connection") //Sending Connection data to Dynamo
            }         
        }
        const toBeDeleted = locateDisconnected(devices); // array of indexes within the connection array that are no longer connected to the network
        if(toBeDeleted.length != 0){
            for(const i of toBeDeleted){
                db.Query(connections[i].mac,date,"Disconnection"); // Sending Connection Data to Dynamo
                connections.splice(i,1); //Removing from Connection Array
            }
        }
      })
}



//Find Mac Address in Server Memory
function locateMAC(mac){
    for(const obj of connections){
        if(obj.mac == mac) return true;
    }
    return false;
}

//Locate disconnected mac addresses
function locateDisconnected(devices){
    var duplicates = [];
    var toBeDeleted = [];
    for(const [i,con] of connections.entries()){
        for(const device of devices){
            if(con.mac == device.mac) duplicates.push(i);
        }
    }

    for(var i = connections.length-1; i != -1; i--){
        if(!duplicates.includes(i)) toBeDeleted.push(i);
    }
    return toBeDeleted;
}




