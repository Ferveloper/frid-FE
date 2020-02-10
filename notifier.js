'use strict';

const fs = require('fs');
const cote = require('cote');
const requester = new cote.Requester({ name: 'Tag Notifier' });
var tags = JSON.parse(fs.readFileSync('tags.json'));
var tagsUIDs = tags.map(tag => tag.UID);

// Get path to last log file
// var logPath = './';
// var dir = fs.readdirSync('./').forEach(file => {
//   if (file.includes('NTFLog_')) {
//     logPath = `./${file}`
//     console.log("TCL: logPath", logPath)
//   };
// });

var filename = fs.readdirSync('../').filter( file => file.includes('NTFLog_')).reverse()[0];
var logPath = '../' + filename;
console.log(`[NOTIFIER] Leyendo datos de ${filename}`);

// Get log size
var stats = fs.statSync(logPath);
var fileSizeInBytes = stats['size'];

function printUID(newFileSizeInBytes) {
  let data = fs.readFileSync(logPath, 'utf-8');

  var lines = data.trim().split('\n');
  var lastLine = lines.slice(-1)[0];

  var fields = lastLine.split(';');
  // console.log("TCL: printUID -> fields", fields)
  var UID = fields[3];
  var time = fields[6];
  var kind = tagsUIDs.includes(UID) ? tags.filter(tag => tag.UID === UID)[0].type : undefined;
  var description = tagsUIDs.includes(UID) ? tags.filter(tag => tag.UID === UID)[0].description : undefined;

  console.log(`[NOTIFIER] UID : ${UID}, Time : ${time}, Type : ${kind}, Description : ${description}, Log size : ${newFileSizeInBytes} bytes`);

  requester.send({
    type: 'notification',
    UID: UID,
    time: time,
    kind: kind,
    description: description
  }, response => {
    console.log(`[NOTIFIER] Respuesta --> ${response}`, Date.now());
  });
}

function checkFileSize() {
  let stats = fs.statSync(logPath);
  let newFileSizeInBytes = stats['size'];
  // console.log("TCL: fileSizeInBytes", fileSizeInBytes)
  // console.log("TCL: newfileSizeInBytes", newFileSizeInBytes)
  if (newFileSizeInBytes > fileSizeInBytes) {
    // console.log('executed')
    printUID(newFileSizeInBytes);
    fileSizeInBytes = newFileSizeInBytes;
  }
}

setInterval(checkFileSize, 3000);


