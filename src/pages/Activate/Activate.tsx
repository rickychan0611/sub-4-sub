import React, { useState, useContext } from 'react'
import bgImg from '../../assets/mainbg.jpg'
import { useHistory } from "react-router-dom";

import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Box from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';

import { db } from "../../firebaseApp";
import { Context } from '../../context/Context';

// URL we want to toggle between
const Home = () => {
  let history = useHistory();

  const [err, setErr] = useState({})
  const [loading, setLoading] = useState(false)
  const [code, setCode] = useState("")
  const [open, setOpen] = useState(false);

  const {user} = useContext(Context)

  const handleChange = (value) => {
    setCode(value)
  }

  const onSubmit = (e) => {
    e.preventDefault()
    setErr({})
    setLoading(true)

      if (code === "102938") {
        db.ref('users/'+ user.uid ).update({level: 1})
        .then(()=>{
          alert("Thank you! You have updated to Pro version")
          history.push('/view')
          setLoading(false)
        })
        .catch(()=>{
          alert("Server disconnected. Please try again later.")
        })
      }

      else if (code === "817450") {
        db.ref('users/'+ user.uid ).update({level: 2})
        .then(()=>{
          alert("Thank you! You have updated to VIP version")
          history.push('/view')
          setLoading(false)
        })
        .catch(()=>{
          alert("Server disconnected. Please try again later.")
        })
      }

      else if (code === "936203") {
        db.ref('users/'+ user.uid ).update({level: 3})
        .then(()=>{
          alert("Thank you! You have updated to KING version")
          history.push('/view')
          setLoading(false)
        })
        .catch(()=>{
          alert("Server disconnected. Please try again later.")
        })
      }

      else {
        setErr({code: "Code Invalid"})
        setLoading(false)
      }
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
            Enter Activation Code</Typography>

          <form id="signin" onSubmit={onSubmit}>
            <TextField style={{ margin: 8 }} variant="outlined" label="Code" fullWidth required
              onChange={(event) => { handleChange(event.target.value) }}
              helperText={err.code} error={err.code && true}
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
          <Button type="submit" form="signin"
            style={{ margin: 8 }} variant="contained" color="grey">
            Go Back</Button>
        </Box>
      </Paper>
    </Grid>
  )
}



export default Home
