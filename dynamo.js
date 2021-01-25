const AWS = require('aws-sdk');
const awsConfig = require('./secrets/awsConfig');
const { v4: uuid } = require('uuid');
AWS.config.update(awsConfig)

let docClient = new AWS.DynamoDB.DocumentClient();


const Dynamo = {
    Query: function(mac,date,type){
        const obj = {
            id: uuid(),
            mac: mac,
            info: date.toString(),
            type: type
        }
    
        const params = {
            TableName: "wifi-connections",
            Item: obj
        }
    
        docClient.put(params,function(err,data){
            if(err) console.log("DynamoDB Error - " + JSON.stringify(err))
        })
    },
    Get: function(){
        return new Promise((resolve)=>{
            const params = {TableName:"wifi-connections"}
            docClient.scan(params,function(err,data){
                if(err) {
                    console.log("ERROR: " + err);
                    resolve(null)
                }
                else resolve(data);
            })
        })
    }
}


module.exports = Dynamo;