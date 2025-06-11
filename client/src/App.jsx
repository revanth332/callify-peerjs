import { useState,useEffect } from "react"
import { LoginScreen } from "@/components/LoginScreen"
import { MainInterface } from "@/components/MainInterface"
import API from "./services/API";
import { generateToken } from "./notifications/firebase";
// import { generateToken,messaging } from "./notifications/firebase";
// import {onMessage} from "firebase/messaging";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo,setUserInfo] = useState();

  // useEffect(() => {
  //   const token = generateToken();
  //   onMessage(messaging,(payload) => {
  //     console.log("Message received. ", payload);
  //   });
  // },[])

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
      const notificationRegistrationToken = await generateToken();
      // console.log(notificationRegistrationToken);
      await API.post.updateNotificationToken(result.user._id,notificationRegistrationToken);
      // console.log(result.user);
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
