const { Kafka } = require('kafkajs')
const config = require('./config')
const app = require("express")
const http= require('http').createServer(app);
const io= require('socket.io')(http); 
const kafka = new Kafka({
  clientId: config.kafka.CLIENTID,
  brokers: config.kafka.BROKERS
})

const topic = config.kafka.TOPIC
const consumer = kafka.consumer({
  groupId: config.kafka.GROUPID
})
io.on('connection',function(socket){
  console.log("ok")
  const run = async () => {
    await consumer.connect()
    await consumer.subscribe({ topic, fromBeginning: true })
    await consumer.run({
      eachMessage: async ({ message }) => {
        try {
          const jsonObj = JSON.parse(message.value.toString())
          let passengerInfo = filterPassengerInfo(jsonObj)
          io.emit("test",passengerInfo);
          
        } catch (error) {
          console.log('err=', error)
        }
      }
    })
  }
  run().catch(e => console.error(`[example/consumer] ${e.message}`, e))

  function filterPassengerInfo(jsonObj) {
    let returnVal = null
  
    console.log(`eventId ${jsonObj.eventId} received!`)
  
  
      returnVal = jsonObj;
  
    return returnVal
  }
  
  
  
  const errorTypes = ['unhandledRejection', 'uncaughtException']
  const signalTraps = ['SIGTERM', 'SIGINT', 'SIGUSR2']
  
  errorTypes.map(type => {
    process.on(type, async e => {
      try {
        console.log(`process.on ${type}`)
        console.error(e)
        await consumer.disconnect()
        process.exit(0)
      } catch (_) {
        process.exit(1)
      }
    })
  })
  
  signalTraps.map(type => {
    process.once(type, async () => {
      try {
        await consumer.disconnect()
      } finally {
        process.kill(process.pid, type)
      }
    })
  })
})
// module.exports = {
//   filterPassengerInfo
// }
http.listen(3000, () => {
  console.log('listening on *:3000');
});