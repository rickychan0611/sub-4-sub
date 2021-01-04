import React, { useState, useContext } from 'react'
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import { useHistory } from "react-router-dom";
import passwordValidator from 'password-validator';
import { Context } from '../../context/Context';

import { db, auth } from "../../firebaseApp";
var validator = require("email-validator");

var schema = new passwordValidator();
schema
.is().min(6)                                    // Minimum length 8
.is().max(100)                                  // Maximum length 100
.has().uppercase()                              // Must have uppercase letters
.has().lowercase()                              // Must have lowercase letters
.has().digits(2)                                // Must have at least 2 digits
.has().not().spaces()                           // Should not have spaces

// URL we want to toggle between
const Edit = () => {
  let history = useHistory();
  const {user} = useContext(Context)

  const [userInfo, setUserInfo] = useState({
    nickname: user.nickname,
    channelUrl: user.channelUrl.replace("?sub_confirmation=1", ""),
    videoUrl1: user.videoUrl1,
    videoUrl2: user.videoUrl2,
    videoUrl3: user.videoUrl3
  })

  const [err, setErr] = useState({})
  const [loading, setLoading] = useState(false)

  const handleChange = (name, value) => {
     setUserInfo(prev => ({ ...prev, [name]: value }))
  }


  const onSubmit = () => {
    setErr({})

    let validate = new Promise((resolve, reject) => {
      if (!userInfo.nickname) {
        setErr(prev => ({ ...prev, nickname: "Required" }))
        reject()
      }
      if (!userInfo.channelUrl) {
        setErr(prev => ({ ...prev, channelUrl: "Required" }))
        reject()
      }
      if (!userInfo.videoUrl1) {
        setErr(prev => ({ ...prev, videoUrl1: "Required" }))
        reject()
      }
      else resolve()
    })

    validate.then(async() => {
    setLoading(true)

      setUserInfo(prev => ({ ...prev, "channelUrl": prev.channelUrl + "?sub_confirmation=1" }))

    db.ref('users/' + user.uid).update({ ...userInfo, "channelUrl": userInfo.channelUrl + "?sub_confirmation=1"})
      .then(() => {
        console.log("Done")
        setLoading(false)
        alert("User info updated.")
        history.push('/view')
      })
    })
    .catch((err) => {
      console.log(err)
      setLoading(false)
      alert("Server disconnected. Try again later")

    })

    validate.catch(() => {
      setLoading(false)
      console.log(err)
    })
  }

  return (

    <div style={{ margin: 50 }}>
      <Typography style={{ marginLeft: 8, marginBottom: 40, textAlign: 'center', fontSize: 30, fontWeight: "bold" }} gutterBottom>Step 1: Register</Typography>
      <Paper elevation={3} style={{ padding: 50, paddingRight: 60, marginBottom: 20 }}>
        <form noValidate autoComplete="off">
         
          <TextField style={{ margin: 8 }} variant="outlined" label="Your nickname " fullWidth required
            value={userInfo.nickname}
            onChange={(event) => { handleChange('nickname', event.target.value) }}
            helperText={err.nickname} error={err.nickname && true}
          />
          <TextField style={{ margin: 8 }} variant="outlined" label="Your Youtube channel URL" fullWidth required
           value={userInfo.channelUrl}
            onChange={(event) => { handleChange('channelUrl', event.target.value) }}
            helperText={err.channelUrl} error={err.channelUrl && true}
          />
          <TextField style={{ margin: 8 }} variant="outlined" label="Your Video's URL #1" fullWidth required
            value={userInfo.videoUrl1}
            onChange={(event) => { handleChange('videoUrl1', event.target.value) }}
            helperText={err.videoUrl1} error={err.videoUrl1 && true}
          />
          <TextField style={{ margin: 8 }} variant="outlined" label="Your Video's URL #2" fullWidth
            value={userInfo.videoUrl2}
            onChange={(event) => { handleChange('videoUrl2', event.target.value) }}
            helperText={err.videoUrl2} error={err.videoUrl2 && true}
          />
          <TextField style={{ margin: 8 }} variant="outlined" label="Your Video's URL #3" fullWidth
            value={userInfo.videoUrl3}
            onChange={(event) => { handleChange('videoUrl3', event.target.value) }}
            helperText={err.videoUrl3} error={err.videoUrl3 && true}
          />
          <br />
        </form>
        <Box display="flex" justifyContent="flex-end">
          <Button style={{ margin: 8 }} variant="contained" color="grey" onClick={() => history.push('/view')}>Back</Button><br />
          <Button startIcon={loading && <CircularProgress color="inherit" size={14} />} style={{ margin: 8 }} variant="contained" color="primary" onClick={() => onSubmit()}>Save</Button><br />
        </Box>
      </Paper>

    </div>
  )
}



export default Edit
