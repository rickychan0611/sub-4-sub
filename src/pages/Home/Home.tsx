import React, { useState } from 'react'
import bgImg from '../../assets/mainbg.jpg'
import { useHistory, Link } from "react-router-dom";

import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Box from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';

import { db, auth } from "../../firebaseApp";

var validator = require("email-validator");

let view;

// URL we want to toggle between
const Home = () => {
  let history = useHistory();

  const [err, setErr] = useState({})
  const [loading, setLoading] = useState(false)
  const [userInfo, setUserInfo] = useState({})
  const [open, setOpen] = useState(false);

  const handleChange = (name, value) => {
    setUserInfo(prev => ({ ...prev, [name]: value }))
  }

  const onSubmit = (e) => {
    e.preventDefault()
    setErr({})

    let validate = new Promise((resolve, reject) => {

      if (!validator.validate(userInfo.email)) {
        setErr(prev => ({ ...prev, email: "Not a valid email address" }))
        reject()
      }
      if (!userInfo.email) {
        setErr(prev => ({ ...prev, email: "Required" }))
        reject()
      }
      if (!userInfo.password) {
        setErr(prev => ({ ...prev, password: "Required" }))
        reject()
      }
      else resolve()
    })

    validate.then(() => {
      setLoading(true)

      auth.signInWithEmailAndPassword(userInfo.email, userInfo.password)
        .then((doc) => {
          console.log("signed in user uid:", doc.user.uid)
          // set level for this user of this verions. FREE Verison
          db.ref("/users/"+doc.user.uid).update({level: 0})

          setLoading(false)
          console.log("signed in")
          history.push("/view");


        })
        .catch((error) => {
          setLoading(false)

          setErr(prev => ({ ...prev, email: error.message }))
        })
    })

    validate.catch((error) => {
      setLoading(false)
      console.log(error)
    })
  }

  return (

    <Grid
      container
      direction="row"
      justify="center"
      alignItems="center"
      style={{ padding: 50 }}
    >

      <Paper elevation={3} style={{ paddingBottom: 50, paddingRight: 60, marginBottom: 20, maxWidth: 800 }}>
        <Box>
          <img src={bgImg} style={{ width: "100%", height: "auto" }} />
        </Box>
        <Box style={{ paddingLeft: "30%", paddingRight: "30%" }}>
          <Typography style={{ marginBottom: 10, textAlign: 'center', fontSize: 30, fontWeight: "bold" }} gutterBottom>
            Sign in</Typography>

          <form id="signin" onSubmit={onSubmit}>
            <TextField style={{ margin: 8 }} variant="outlined" label="Your E-mail" fullWidth required
              onChange={(event) => { handleChange('email', event.target.value) }}
              helperText={err.email} error={err.email && true}
            />
            <TextField style={{ margin: 8 }} variant="outlined" label="Password" fullWidth required
              onChange={(event) => { handleChange('password', event.target.value) }}
              helperText={err.password} error={err.password && true}
            />
          </form>

        </Box>
        <Box display="flex" justifyContent="center">
          <Button type="submit" form="signin"
            startIcon={loading && <CircularProgress color="inherit" size={14} />}
            style={{ margin: 8 }} variant="contained" color="primary">
            Submit</Button>
        </Box>
        <Box display="flex" justifyContent="center">
          <Link to="/register">
            <br />
            <Typography style={{ marginBottom: 10, textAlign: 'center', fontSize: 15, fontWeight: "bold" }} gutterBottom>
              New User? Register
          </Typography>
          </Link>
        </Box>
      </Paper>
    </Grid>
  )
}



export default Home
