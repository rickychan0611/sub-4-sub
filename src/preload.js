const { contextBridge } = require("electron");
var ipcRenderer = require('electron').ipcRenderer;
console.log("PRELOADED!!!!")
let youtubeAvatar;
let button;

require('events').EventEmitter.defaultMaxListeners = Infinity;

window.onload = () => {
  setTimeout(() => {
    youtubeAvatar = document.getElementById("avatar-btn");
    console.log('window onload', youtubeAvatar)
    ipcRenderer.send('youtubelogin', youtubeAvatar !== null ? "youtubeLogedIn" : "not logged in");
  }, 1500)

  setTimeout(() => {
    button = document.getElementById("confirm-button");
    console.log(button, "This loads no problem!");
    button.click()
    ipcRenderer.send('subscribed', "subscribed");
  }, 2500)

};

