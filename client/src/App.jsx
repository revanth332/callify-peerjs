// import './App.css'
// import {Peer} from 'peerjs';
// import { useEffect,useRef,useState } from 'react';

// function App() {
//   const peerInstance = useRef(null);
//   const [peerId,setPeerId] = useState("");
//   const [recieverPeerId,setRecieverPeerId] = useState("");
//   const connectionRef = useRef(null);
//   const [message,setMessage] = useState("");

//   useEffect(() => {
//     const peer = new Peer();

//     peer.on("open",(id) => {
//       console.log("peer id ",id)
//       setPeerId(id);
//     })
    
//     peer.on("connection",(conn) => {
//       console.log(conn)
//       const proceed = window.confirm(`Do you want to connect with ${conn.metadata.name}`)
//         if(proceed){
//             conn.on("open", (data) => {
//               console.log("connection created",data);
//             });
//             conn.on("data", (data) => {
//             console.log(data);
//             });
//             connectionRef.current = conn;
//       }
//     })
    
//     peerInstance.current = peer;

//   },[])

//   const handlePeerConnection = () => {
//     try{
//           const connection = peerInstance.current.connect(recieverPeerId,{metadata : {name:"Revanth"}});
//        connection.on("data",(data) => {
//       console.log(data);
//     })
//     connectionRef.current = connection;
//     }
//     catch(err){
//       console.log(err)
//     }
//   }

//   const sendMessage = () => {
//     connectionRef.current.send(message);
//   }

//   return (
//     <>
//       <div>Connect with : <input type="text" name="peerId" value={recieverPeerId} onChange={(e) => setRecieverPeerId(e.target.value)} /> <button onClick={handlePeerConnection}>connect</button> </div>
//       <div>My PeerId : {peerId} </div>
//       <div>Message : <input value={message} onChange={e => setMessage(e.target.value)} type="text" /> <button onClick={sendMessage}>send</button></div>
//     </>
//   )
// }

// export default App

import { useState,useEffect } from "react"
import { LoginScreen } from "@/components/LoginScreen"
import { MainInterface } from "@/components/MainInterface"
import API from "./services/API";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo,setUserInfo] = useState();

  useEffect(() => {
    const localUserInfo = localStorage.getItem("userInfo");
    if (localUserInfo) {
      setUserInfo(JSON.parse(localUserInfo));
      setIsLoggedIn(true);
    }
  },[]);

  const handleLogin = async (name,phone) => {
    try{
      const result = await API.post.login(name,phone);
      console.log(result.user);
      localStorage.setItem("userInfo", JSON.stringify(result.user));
      setUserInfo(result.user)
      setIsLoggedIn(true)
    }
    catch(err){
      console.log(err);
    }
  }

  const handleLogout = async () => {
    try{
      await API.post.logout(userInfo._id);
      localStorage.removeItem("userInfo");
      setUserInfo(null);
      setIsLoggedIn(false);
    }
    catch(err){
      console.log(err);
    }

  }

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />
  }

  return <MainInterface userInfo={userInfo} onLogout={handleLogout} />
}
