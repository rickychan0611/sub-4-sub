import React, { useEffect, useState, useContext } from 'react'
import removeViews from '../../removeViews'
import ElectronBrowserView from '../../ElectronBrowserView';
import BrowserView from 'react-electron-browser-view';
import SetInterval from 'set-interval'
import firebase from 'firebase/app'
import { useHistory } from "react-router-dom";
import { db, auth } from "../../firebaseApp";
import { resolve } from 'path'
import { Context } from '../../context/Context';
import moment from "moment";
import congrat from '../../assets/congrat.jpg';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Box from '@material-ui/core/Box';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Icon from '@material-ui/core/Icon';
import { Divider } from '@material-ui/core';
import { remote } from 'electron'

require('events').EventEmitter.defaultMaxListeners = 20;


const win = remote.getCurrentWindow()
const delay = require('delay');
let preload =""
const path = require("path");
if (process.env.NODE_ENV === 'production') {
  let url =  path.join(__dirname)
  url = url.replace('app.asar','src/preload.js');
  preload = url
}
else {
  preload = path.join(__dirname, "preload.js")

}

var ipcMain = require("electron").remote.ipcMain;
const { shell } = require('electron');

let view;
// URL we want to toggle between
const View = () => {
  let history = useHistory();
  const { user, onlineUsers, admin } = useContext(Context)

  const [stop, setStop] = useState(true)
  const [subing, setSubing] = useState(false)
  const [counter, setCounter] = useState(0)
  const [attached, setAttached] = useState(false)
  const [devTools, setDevTools] = useState(false)
  const [toggleView, setToggleView] = useState(true)
  const [youtubeLogedIn, setYoutubeLogedIn] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [urlToPlay, setUrlToPlay] = useState("https://www.youtube.com/")
  const [ready, setReady] = useState(false)


  ipcMain.on('youtubelogin', function (event, value) {
    if (value === "youtubeLogedIn") {
      setYoutubeLogedIn(true)
    }
    else setYoutubeLogedIn(false)
  });

  ipcMain.on('subscribed', function (event, value) {
    if (value === "subscribed") {
      setSubscribed(true)
    }
  });

  const stopWatch = () => {
    setCounter(prev => {
      return prev - 1000
    })
  }

  useEffect(() => {
    setTimeout(()=>{
      setReady(true)
    },2000)
    return ()=>{setReady(false)}
  }, [user])
  ///<---------auto task--------->///


  const autoWatch = (userToWatch) => {

    const VIDEO_DURATION = 6000 * Math.floor(Math.random() * (55 - 25) + 25)

    console.log(userToWatch)
    return new Promise(async (resolve, reject) => {
      setSubscribed(false)
      setCounter(VIDEO_DURATION)
      setSubing(false)

      SetInterval.start(stopWatch, 1000, 'stopWatch')

      //TODO. choose video
      //ToDo. exclude played video. store uid in played list. check b4 playing?

      db.ref('users/' + user.uid + '/played/' + userToWatch.uid).update({ uid: userToWatch.uid })
      setUrlToPlay(userToWatch.videoUrl1) //play video
      await delay(VIDEO_DURATION) // video play time TODO. set 4mins

      setUrlToPlay(userToWatch.channelUrl) //subscribe channel
      if (userToWatch.uid !== user.uid) {
        db.ref('users/' + userToWatch.uid).update({ views: firebase.database.ServerValue.increment(1) })
      }

      setSubing(true) //change sub text
      setCounter(8000) //subscribe channel time 8sec
      await delay(8000)

      resolve()
    })
  }

  const repeatPlaying = async () => {
    SetInterval.clear('stopWatch')
    setCounter(0)
    await delay(2000)
    console.log("repeating now")
    startPlaying(user.views)
  }

  const startPlaying = async (views) => {

    let snapviews = await db.ref('users/' + user.uid + "/views").once('value').then((snapshot) => snapshot.val())
    console.log("snapviews", snapviews)

    let onlineUsers = await db.ref('onlineUsers/').once('value').then((snapshot) => snapshot.val())
    onlineUsers = onlineUsers && Object.values(onlineUsers)
    //add onlineusers depends on level

    let tempArr = []

    onlineUsers[0] && onlineUsers.map((user)=>{
      if (user.level === 1) {
        for (let i = 0; i < 2; i++){
          tempArr.push(user)
        }
      }
      else if (user.level === 2) {
        for (let i = 0; i < 10; i++){
          tempArr.push(user)
        }
      }
      else if (user.level === 3) {
        for (let i = 0; i < 50; i++){
          tempArr.push(user)
        }
      }
      else {
        return
      }
      onlineUsers = [...onlineUsers, ...tempArr]
    })

    let playedUsers = await db.ref('users/' + user.uid + "/played").once('value').then((snapshot) => snapshot.val())
    playedUsers = playedUsers && Object.values(playedUsers)

    let random = 0;
    let check = true
    let i = 1;
    // find if now playing id is not in played list
    await new Promise((resolve, reject) => { 

      while (i <= onlineUsers.length && check === true) { 
        console.log(i <= onlineUsers.length, check === true)
        random = Math.floor(Math.random() * (onlineUsers.length)) //get a random number

        if (!playedUsers){ //have not watched anyone's video, play any video
          check = false
          resolve()
          return
        }

        else if (onlineUsers[random].uid !== user.uid) { //random is not me

          let arr = playedUsers.map(user => { //find the id
            if (user.uid === onlineUsers[random].uid) {
              return 1  //put 1 in the arry, otherwise undefined. 
            }
          })
          check = arr.includes(1) //check any "1" in arry, if can't found it, check == false, otherwise continue to loop for another random number
          i++ 
        }
        else {
          console.log("only me online")
          resolve()
          check = false //break the loop
        }  
      }
      resolve()
    })

    // check is false = all user in played list
    if (check){
      console.log("All video has been watched, watching old video")
    }
    else {
      console.log("watching a NEW video")
    }

    if (snapviews < admin.v0_1_0.maxViews) {
     autoWatch(onlineUsers[random])
        .then(() => { repeatPlaying() })
    }
  }

  const stopPlaying = () => {
    removeViews()
    window.location.reload(false)
  }

  useEffect(() => {
    if (attached) {
      setSubscribed(false)
      view.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.130 Safari/537.36 Edg/78.0.100.0")
      console.log(view.getUserAgent())
    }
  }, [attached])

  let myviews;
  // stop all played
  useEffect(() => {
    myviews = user.views
  }, [user.views])

  const timer = (counter) => {
    return moment.utc(counter).format('mm:ss');
  }

  const level = (level) => {
    // 👑💎🥇⭐️

    if (level === 0) {
      return "🙂 "
    }

    else if (level === 1) {
      return "⭐️ "
    }

    else if (level === 2) {
      return "💎 "
    }

    else if (level === 3) {
      return "👑 "
    }

    else {
      return "🙂 "
    }

  }

  return (

    <div style={{ padding: 50, paddingTop: 0, overflow: "auto"}}>
      {/* {JSON.stringify(filteredUsers.map(item => item.uid))}<br /> */}
      {/* <Button variant="contained" color="primary" onClick={() => setDevTools(!devTools)}>Toggle DevTools</Button><br />
      <Button variant="contained" color="primary" onClick={() => switchURL()}>Switch URL</Button><br />
      <Button variant="contained" color="primary" onClick={() => setToggleView(!toggleView)}>tdoggleView</Button><br /> */}
  
      <div style={{ marginLeft: 8, marginBottom: 40, textAlign: 'center', fontSize: 30, fontWeight: "bold" }} >

        <Box style={{ color: "grey", marginBottom: 20 }}>
          <span style={{ fontSize: 20, }}>You've got
        <span style={{ fontSize: 24, color: "#f75a4f" }}> {user.views} </span>
        subscribers and counting!</span>
        </Box>

        {/* //free verison 100, pro veriosn 500 (need to set code more places find them)*/}
        {(!(user.level === 0 && user.views >= 100) || !(user.level === 1 && user.views >= 500))  && 
        
        <>

          {youtubeLogedIn ?
            // {/* {true ? */ }
            <>
            { stop?<>
                < Box style={{ color: "grey" }}>
                  Ready...
                <Button
            style={{ margin: 10, backgroundColor: "#2cbf2c", color: "white", fontWeight: "bold" }}
            variant="contained"
            endIcon={<Icon fontSize="large">play_arrow</Icon>}
            fontSize="large"
            onClick={() => {
              setStop(prev => !prev)
              startPlaying(user.views)
            }}
          >
            Start
          </Button>
          </Box>
        </>

        :
        
      <>
        <Box style={{ color: "grey" }}>
          {subing ? "Subscribing " : "Next Video in "} {timer(counter)}
          <Button
            style={{ margin: 10, backgroundColor: "red", color: "white", fontWeight: "bold" }}
            variant="contained"
            endIcon={<Icon fontSize="large">stop</Icon>}
            fontSize="large"
            onClick={() => { stopPlaying() }}
          >
            Stop
           </Button>
           <div style={{fontSize: 14, color: "#349e50"}}>Automation started. Now you can sit back and relex. <br/> You can mute the video, minimize the window and keep it running in the background.</div>
        </Box>
      </>
    }
            </>
            :
        <>
          {
            // FREE Version
            // !user.views > (admin.v0_1_0 ? admin.v0_1_0.maxViews : 0) &&
            <div>
              Please login to your youtube account below <br />
              <div style={{ color: "grey" }}>
                Waiting for login signal...
                    </div>
            </div>
          }
        </>
          }

        </>
        }

      </div >
  <Grid container container
    // direction="row"
    // justify="center"
    // alignItems="flex-start"
    style={{ flexGlow: 1 }} spacing={2}>

    <Grid item xs={10}
    >
      <Paper elevation={3} style={{
        minHeight: 670, margin: 10, marginTop: 0, paddingTop: 35, padding: 15, marginBottom: 20,
      }}>

        {/* //free verison 100, pro veriosn 500 (need to set code more places find them)*/}
        {(user.level === 0 && user.views >= 100) || (user.level === 1 && user.views >= 500) ?
          <>

          {////when level 0 version greter than 100 views--->start
          user.level === 0 && user.views >= 100 && 
          <div style={{ color: "grey", marginLeft: 8, marginBottom: 40, textAlign: 'center', fontSize: 20, fontWeight: "bold" }} >

            <img src={congrat} style={{ width: "80%", height: "auto" }} /><br />
                YEAH! You have reached 100 subscribers!<br /> <br />
                 However, the free trial is now over.<br /> <br />
            <br /> <br />
                To continue to reach 1000 subscribers, <br /> <br />
            <span
              style={{ color: "#7aa7f0", cursor: "pointer" }}
              onClick={(event) => {
                event.preventDefault();
                shell.openExternal("https://www.patreon.com/autosub4sub");
              }}
            >
              click to activate full version.😄😎
              </span>
          </div> 
          //when level 0 version greter than 100 views--->end
          }

          {//when level 1 version greter than 500 views--->start
          user.level === 1 && user.views >= 500 && 
          <div style={{ color: "grey", marginLeft: 8, marginBottom: 40, textAlign: 'center', fontSize: 20, fontWeight: "bold" }} >

            <img src={congrat} style={{ width: "80%", height: "auto" }} /><br />
                YEAH! You have reached 500 subscribers!<br /> <br />
            <br /> <br />
            You have reached your limit.<br /> <br />
            To get unlimited subscribers, activate the VIP or KING version <br /> <br />
            <span
              style={{ color: "#7aa7f0", cursor: "pointer" }}
              onClick={(event) => {
                event.preventDefault();
                shell.openExternal("https://www.patreon.com/autosub4sub");
              }}
            >
              👑💎Upgrade my membership now.💎👑
              </span>
          </div> 
          //when level 0 version greter than 100 views--->end
          }

          
          </>
          
          :

          <>
            {toggleView && win &&
              <BrowserView
                src={urlToPlay ? urlToPlay : "https://www.youtube.com"}
                className="browser"
                preload={preload}
                // Keep instance reference so we can execute methods
                ref={(viewRef) => {
                  view = viewRef
                }}
                devtools={devTools}
                onDidAttach={() => {
                  setAttached(true)
                  console.log("BrowserView attached");
                }}
                onUpdateTargetUrl={() => {
                  // console.log("Updating url");
                  // setAttached(false)
                }}
                onDidFinishLoad={() => {
                  // setAttached(true)
                  // console.log("Updated url");
                }}
                style={{
                  height: 650,
                }}
                disablewebsecurity={true}
                contextIsolation={false}
                enableRemoteModule={true}
              />
            }
        </>}
      </Paper>
    </Grid>

    <Grid item xs={2}>
      <Paper elevation={3} style={{ paddingTop: 5, marginBottom: 20, minHeight: 590, }}>
        <h4 style={{ textAlign: "center" }}>
          Online Buddies({onlineUsers.length})

          {admin.v0_1_0.showLevel && <>
           <div style={{ fontSize: 12, marginTop: 10, marginBottom: 10 }}>
            🙂=Free <br />
              ⭐️=Pro<br />
              💎=VIP<br />
              👑=KING<br />
          </div>
        </>}
        
        </h4>
        <Divider />
        <List component="nav" style={{ padding: 10 }}>
          {onlineUsers && onlineUsers.map((item) => {
            return (
              <ListItemText key={item.uid} primary={level(item.level) + item.nickname} />
            )
          })}
        </List>
      </Paper>
    <Box display="flex" justifyContent="center">
        <Button style={{ width: "100%" }} variant="contained" color="primary"
          onClick={() => {
            auth.signOut().then(function () {
              // Sign-out successful.
              history.push('/home')
            }).catch(function (error) {
              // An error happened.
            });
          }}>Sign Out</Button><br />
      </Box>
    <Box display="flex" justifyContent="center">
        <Button style={{ width: "100%", marginTop: 10 }} variant="contained" color="primary"
          onClick={() => {
            history.push('/activate')
          }}>Activation</Button><br />
      </Box>
    </Grid>
  </Grid>
    </div >
  )
}


export default View
