const find = require('local-devices');
const cron = require('node-cron');
const AWS = require('aws-sdk');
const awsConfig = require('./secrets/awsConfig');
const { v4: uuid } = require('uuid');

const connections = [];

AWS.config.update(awsConfig)

let docClient = new AWS.DynamoDB.DocumentClient();

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
                connectionQuery(device.mac,date) //Sending Connection data to Dynamo
            }         
        }
      })
}

//Insert Connection to DynamoDB
function connectionQuery(mac,date){
    const obj = {
        id: uuid(),
        mac: mac,
        info: `Connected at ${date.toString().substring(3,15)} ${formatTime(date)}`
    }

    const params = {
        TableName: "wifi-connections",
        Item: obj
    }

    docClient.put(params,function(err,data){
        if(err) console.log("DynamoDB Error - " + JSON.stringify(err))
    })
}

//Find Mac Address in Server Memory
function locateMAC(mac){
    for(const obj of connections){
        if(obj.mac == mac) return true;
    }
    return false;
}

//Format Time for Display
function formatTime(d){
    var hours = d.getHours();
    var abbr = "PM"
    if(d.getHours() >= 12) if(hours != 12) hours -= 12
    else {
        if(hours == 0) hours = 12
        abbr = "AM"
    }
    return `${hours}:${("0" + d.getMinutes()).slice(-2)}${abbr}`
}


