const URL = import.meta.env.VITE_SERVER_ORIGIN+"/api/"
// const URL = "http://localhost:8001/api/"
import axios from "axios"

const API = {
    post : {
        login : async function(name,phone){
            const result = await axios.post(URL+"user/login",{name,phone});
            return result.data;
        },
        logout : async function(userId){
            await axios.post(URL+"user/logout",{userId});
        },
        updateNotificationToken : async function(userId,notificationRegistrationToken){
            await axios.post(URL+"user/add/notification/registrationToken",{userId,notificationRegistrationToken});
        },
        requestUserConnection : async function(userId){
            const response = await axios.post(URL+"user/request",{userId});
            return response.data;
        }
    },
    get : {
        getPeerId : async function(userId){
            const result = await axios.get(URL+"user/peerId?userId="+userId);
            return result.data;
        },
        getContacts : async function(userId){
            const result = await axios.get(URL+"user/contacts?userId="+userId);
            return result.data;
        },
    }
}

export default API;