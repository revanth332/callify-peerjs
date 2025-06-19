import { useEffect, useState,useRef } from "react"
import { ChatSidebar } from "@/components/ChatSidebar"
import { ChatView } from "@/components/ChatView"
import { AddContactModal } from "@/components/AddContactModal"
import { AudioCallScreen } from "@/components/AudioCallScreen"
import { VideoCallScreen } from "@/components/VideoCallScreen"
import { IncomingCallScreen } from "@/components/IncomingCallScreen"
import {Peer} from 'peerjs';
import API from "@/services/API"
import { Loader, MessageCircle } from "lucide-react"
import { toast } from "sonner"
import { io } from "socket.io-client"

export function MainInterface({userInfo,onLogout}) {
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [showAddContact, setShowAddContact] = useState(false)
  const [callState, setCallState] = useState("none")
  const [callingContact, setCallingContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [waiting,setWaiting] = useState(false);
  const [callStatus, setCallStatus] = useState("connecting")
  const [isSidebarOpen,setIsSidebarOpen] = useState(true);
  const [remoteVideoStream,setRemoteVideoStream] = useState(null);
  const [localVideoStream,setLocalVideoStream] = useState(null);
  const [isAudioAllowed,setIsAudioAllowed] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [uploadingStatus, setUploadingStatus] = useState(0);
  const [sendingFileId, setSendingFileId] = useState(null);
  const [isLocalVideoOn, setIsLocalVideoOn] = useState(true);
  const [isRemoteVideoOn,setIsRemoteVideoOn] = useState(true);
  const [isSwitchedVideos,setIsSwitchedVideos] = useState(false);
  const [videoChatMessages,setVideoChatMessages] = useState([]);
  const [showVideoChat,setShowVideoChat] = useState(false);
  const [unreadVideoChatMessagesCount,setUnreadVideoChatMessagesCount] = useState(0);
  const socketRef = useRef(null);
  const [userStatus,setUserStatus] = useState("")
  // const [facingMode,setFacingMode]

  const peerInstance = useRef(null);
  const connectionRef = useRef(null);
  const audioCallRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerCallRef = useRef(null);
  const fileBufferRef = useRef(null);

  // useEffect(() => {
  //   const changeUserStatus = async (status) => {
  //     await API.post.changeStatus(userInfo._id,status);
  //   }
  //   let timoutId;
  //   if(userStatus === "offline"){
  //     setUserStatus("online");
  //     changeUserStatus();
  //     timoutId = setTimeout(() => {
  //       console.log("offline");
  //       setUserStatus("offline")
  //     },[5000])
  //     console.log("log")
  //   }
    

  //   return () => {
  //     clearTimeout(timoutId)
  //   }
  // })

  // useEffect(() => {
  //   const socket = io("http://localhost:8000");
  //   socket.on("connect",() => {
  //     console.log(socket.id,"socket connected");
  //   });

  //   socket.emit("join-user",userInfo._id);

  //   socket.on("user-status",(userId,status) => {
  //     console.log("user status triggered",userId,status,contacts,userId);
  //     setContacts((prev) => prev.map(contact => contact._id === userId ? {...contact,status} : contact));
  //   })

  //   socket.on("disconnect", () => {
  //     console.log(socket.id,"disconnected"); // undefined
  //   });

  //   socketRef.current = socket;
  // },[userInfo._id,contacts])

  useEffect(() => {
    const peer = new Peer(userInfo.peerId);
    
    peer.on("open",() => {
      // console.log("peer id ",id);
    })

    peer.on("call",async (call) => {
      const contact = contacts.find(item => item.name === call.metadata.name);
      if(contact){
        setCallState(call.metadata.type);
        call.on("close",() => {
          handleEndCall();
        })
        call.on("stream",(remoteAudioStream) => {
          if(call.metadata.type === "audio"){
            if(audioCallRef.current){
              audioCallRef.current.srcObject = remoteAudioStream;
            }
          }
          else if(call.metadata.type === "video"){
            setRemoteVideoStream(remoteAudioStream);
          }
          else{
            console.error("No audio element found")
          }
        })
        peerCallRef.current = call;
        handleIncomingCall(contact,call.metadata.type);
      }
    })

    peer.on("error", (err) => {
      console.error("PeerJS error:", err);
      // Common errors: 'peer-unavailable', 'socket-error', 'network', 'webrtc'
      // 'peer-unavailable' means the peerId you tried to connect to isn't registered or active.
    });

  peer.on("disconnected", () => {
    console.log("Disconnected from the PeerJS signaling server. Attempting to reconnect...");
    // PeerJS will attempt to reconnect automatically.
    // You might want to update UI or state here.
  });

  peer.on("close", () => {
    console.log("Peer connection completely closed (e.g., by calling peer.destroy()).");
  });
  
    peer.on("connection",(conn) => {
      // const proceed = window.confirm(`Do you want to connect with ${conn.metadata.name}`);
      toast("New connection request", {
          description: conn.metadata.name + " wants to connect with you",
          action: {
            label: "Accept",
            onClick: () => {
              const contact = contacts.find(item => item.name === conn.metadata.name);
              setIsSidebarOpen(false);
              setSelectedContact(contact);
              conn.send(JSON.stringify({type:"con-status",value:true}));
              conn.on("open", () => {
                // console.log("connection created",data);
              });

                conn.on("data", (data) => {
                  if(typeof data === "string"){
                    const dataObj = JSON.parse(data);
                    if(dataObj.type === "text"){
                        const message = {
                        id: Date.now().toString(),
                        type : "text",
                        content: dataObj.value,
                        sender: "contact",
                        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                        status: "read",
                      }
                      setMessages(prev => [...prev,message]);
                    }
                    else if(dataObj.type === "call-status"){
                      if(dataObj.value === false){
                        // console.log("call ended by sender")
                        handleEndCall();
                      }
                    }
                    else if(dataObj.type === "mute"){
                        setIsAudioAllowed(!dataObj.value);
                    }
                    else if(dataObj.type === "end-chat"){
                      closeChat();
                    }
                    else if(dataObj.type === "file-eof"){
                        const blob = new Blob(fileBufferRef.current);
                        const fileUrl = URL.createObjectURL(blob);
                        const message = {
                          id: Date.now().toString(),
                          type:"file",
                          content: dataObj.name,
                          fileSize : (blob.size / 1024).toFixed(2) > 1024 ? ((blob.size / 1024)/1024).toFixed(2) + " MB" : (blob.size / 1024).toFixed(2) + " KB",
                          sender: "contact",
                          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                          status: "read",
                          fileUrl: fileUrl,
                        }
                        setMessages(prev => [...prev,message]);
                        fileBufferRef.current = [];
                    }
                    else if(dataObj.type === "video-toggle"){
                      setIsRemoteVideoOn(dataObj.value);
                    }
                    else if(dataObj.type === "video-chat"){
                      const message = {
                        id: Date.now().toString(),
                        type: "text",
                        content: dataObj.value,
                        sender: "contact",
                        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                        status: "read",
                      }
                      setVideoChatMessages(prev => [...prev,message]);
                      setUnreadVideoChatMessagesCount(prev => prev + 1)
                    }
                  }
                  else{
                    if(!fileBufferRef.current){
                      fileBufferRef.current = [];
                    }
                    fileBufferRef.current.push(data);
                  }
              });

              conn.on("close",()=> {
                console.log("closed")
              })

              connectionRef.current = conn;
            },
            className: "bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded-md transition",
          },
        })
    })
    
    peerInstance.current = peer;

    return () => {
      console.log("Cleaning up PeerJS instance...");
      if (peerInstance.current) {
        peerInstance.current.destroy(); // Important for cleanup
        peerInstance.current = null;
      }
    };
    
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[userInfo,contacts]);

  useEffect(() => {
    fetchContacts(userInfo._id);
  },[userInfo._id]);

  useEffect(() => {
    if(showVideoChat){
      setUnreadVideoChatMessagesCount(0);
    }
  },[showVideoChat,unreadVideoChatMessagesCount])

  // useEffect(() => {
  //   console.log(isAudioAllowed,"kl")
  // },[isAudioAllowed])

  const fetchContacts = async (userId) => {
    try{
      const result = await API.get.getContacts(userId);
      setContacts(result.contacts);
    }
    catch(err){
      console.log(err);
    }
    }

  const handlePeerConnection = async (peerId,contact) => {
    try{
      // console.log("connection started",peerId)
      const connection = peerInstance.current.connect(peerId,{metadata : {name:userInfo.name}});
      setWaiting(true);
      const response = await API.post.requestUserConnection(contact._id);
      if(!response.success){
        toast.error(response.message);
      }
      const requestTimeoutId = setTimeout(() => {
        setWaiting(false);
        setIsSidebarOpen(true);
        toast.error("Connection timed out. Please try again later.");
      },10000)
      // connection.on("open",() => {
      //   setWaiting(false);
      //   setSelectedContact(contact);
      // })
      connection.on("data",(data) => {
        if(typeof data === "string"){
          const dataObj = JSON.parse(data);
          if(dataObj.type === "text"){
            const message = {
                id: Date.now().toString(),
                type: "text",
                content: dataObj.value,
                sender: "contact",
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                status: "read",
            }
            setMessages(prev => [...prev,message])
          }
          else if(dataObj.type === "con-status"){
            if(dataObj.value){
              clearTimeout(requestTimeoutId);
              setWaiting(false);
              setSelectedContact(contact);
            }
          }
          else if(dataObj.type === "call-status"){
            // console.log("call ended by sender");
            if(dataObj.value === false){
              // console.log("call ended by sender")
              handleEndCall();
            }
          }
          else if(dataObj.type === "mute"){
            setIsAudioAllowed(!dataObj.value);
          }
          else if(dataObj.type === "end-chat"){
            closeChat();
          }
          else if(dataObj.type === "file-eof"){
            const blob = new Blob(fileBufferRef.current);
            const fileUrl = URL.createObjectURL(blob);
            const message = {
              id: Date.now().toString(),
              type:"file",
              content: dataObj.name,
              fileSize : (blob.size / 1024).toFixed(2) > 1024 ? ((blob.size / 1024)/1024).toFixed(2) + " MB" : (blob.size / 1024).toFixed(2) + " KB",
              sender: "contact",
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              status: "read",
              fileUrl: fileUrl,
            }
            setMessages(prev => [...prev,message]);
            fileBufferRef.current = [];
          }
          else if(dataObj.type === "video-toggle"){
            setIsRemoteVideoOn(dataObj.value);
          }
          else if(dataObj.type === "video-chat"){
            const message = {
              id: Date.now().toString(),
              type: "text",
              content: dataObj.value,
              sender: "contact",
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              status: "read",
            }
            setVideoChatMessages(prev => [...prev,message]);
            setUnreadVideoChatMessagesCount(prev => prev + 1)
          }
        }
        else{
          if(!fileBufferRef.current){
            fileBufferRef.current = [];
          }
          fileBufferRef.current.push(data);
        }

      })
    connectionRef.current = connection;
    }
    catch(err){
      setWaiting(false);
      console.log(err);
    }
  }

  const sendMessage = (text) => {
    connectionRef.current.send(JSON.stringify({type:"text",value : text}));
  }

  const sendVideoChatMessage = (e) => {
    console.log("sending video chat message",e.target.value);
    setVideoChatMessages(prev => [...prev,{id:Date.now().toString(),type:"text",content:e.target.value,sender:"me",timestamp:new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),status:"read"}])
    connectionRef.current.send(JSON.stringify({type:"video-chat",value : e.target.value}));
    e.target.value = "";
  }

  const switchVideoStreams = () => {
    setIsSwitchedVideos(prev => !prev)
    if (localVideoStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = localVideoStream;
    }
    if (remoteVideoStream && localVideoRef.current) {
      localVideoRef.current.srcObject = remoteVideoStream;
    }
  }

  const handleLocalVideoToggle = () => {
    connectionRef.current.send(JSON.stringify({type:"video-toggle",value : !isLocalVideoOn}));
    setIsLocalVideoOn(!isLocalVideoOn);
  }

  const handleAddContact = (newContact) => {
    const contact = {
      ...newContact,
      id: Date.now().toString(),
      status: "offline",
    }
    setContacts([contact, ...contacts])
    setShowAddContact(false)
  }

  const handleStartCall = async (contact, type) => {
    const mediaStream = await navigator.mediaDevices.getUserMedia({ video: type === "video" ? {facingMode : "user"} : false, audio: {
          noiseSuppression: true,
          echoCancellation: true,
          autoGainControl: true,
        } });
    const result = await API.get.getPeerId(contact._id);
    const call = peerInstance.current.call(result.peerId,mediaStream,{metadata : {name:userInfo.name,type}});
    peerCallRef.current = call;
    call.on("stream",(remoteStream) => {
      setCallStatus("connected");
      if(type === "audio") audioCallRef.current.srcObject = remoteStream;
      else if(type === "video") setRemoteVideoStream(remoteStream);
    })
    call.on("close",() => {
      handleEndCall();
    })
    setCallingContact(contact);
    setCallState(type);
  }
  
  useEffect(() => {
    const streamLocalVideo = async () => {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: {facingMode : "user"}, audio: {
          noiseSuppression: true,
          echoCancellation: true,
          autoGainControl: true,
        } });
      // localVideoRef.current.srcObject = mediaStream;
      setLocalVideoStream(mediaStream);
    }
    if(callState === "video" && callStatus === "connected"){
      streamLocalVideo();
    }
  },[callState,callStatus])

  useEffect(() => {
    if(remoteVideoStream){
      remoteVideoRef.current.srcObject = remoteVideoStream;
    }

  },[remoteVideoStream])

  useEffect(() => {
    if(localVideoStream && localVideoRef.current){
      localVideoRef.current.srcObject = localVideoStream;
    }
  },[localVideoStream])

  const handleEndCall = () => {
    setCallState("none");
    setCallingContact(null);
    peerCallRef.current.close();
    peerCallRef.current = null;
    setCallStatus("connecting");
    if(callState === "video"){
      setRemoteVideoStream(null);
    }
  }

  const handleRemoteStreamMute = () => {
    setIsMuted(prev => {
      const muteValue = !prev;
      connectionRef.current.send(JSON.stringify({type:"mute",value : muteValue}));
      return muteValue;
    })
    
  }

  const handleIncomingCall = (contact, type) => {
    setCallingContact(contact);
    setCallStatus(type === "audio" ? "incoming-audio" : "incoming-video")
  }

  const handleAcceptCall = async () => {
    if (callStatus === "incoming-audio") {
      const audioStream = await navigator.mediaDevices.getUserMedia({ video: false, audio: {
          noiseSuppression: true,
          echoCancellation: true,
          autoGainControl: true,
        } });
      setCallStatus("connected");
      peerCallRef.current.answer(audioStream);
    } else if (callStatus === "incoming-video") {
      const audioStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: {
          noiseSuppression: true,
          echoCancellation: true,
          autoGainControl: true,
        } });
      setCallStatus("connected");
      peerCallRef.current.answer(audioStream);
    }
  }

  const handleDeclineCall = () => {
    connectionRef.current.send(JSON.stringify({type:"call-status",value : false}))
    setCallState("none")
    setCallingContact(null);
    setCallStatus("connecting");
    peerCallRef.current.close();
    peerCallRef.current = null;
  }

  const handleUserSelection = async (contact) => {
    if(contact.status === "online"){
      setIsSidebarOpen(false);
      const result = await API.get.getPeerId(contact._id)
      handlePeerConnection(result.peerId,contact);
    }
    else{
      toast.error("User is offline. Please try again later.");
    }
  }

  const closeChat = () => {
    setSelectedContact(null);
    setIsSidebarOpen(true);
    if (connectionRef.current) {
      connectionRef.current.send(JSON.stringify({type:"end-chat",value : true}))
      connectionRef.current.close();
      connectionRef.current = null;
    }
    setMessages([]);
    fileBufferRef.current = [];
  }

    const sendFile = (file) => {
    if (!connectionRef.current) {
        console.error("Connection is not open or not available.");
        toast.error("Connection is not available. Please try again later.");
        setUploadingStatus(0);
        return;
    }

    // console.log("Attempting to send file:", file.name, "size:", file.size);
    const messageId = Date.now().toString();
    const fileId = Date.now().toString() + file.name;
    setSendingFileId(fileId);
    setMessages((prev) => [...prev, {
              id: Date.now().toString(),
              type:"file",
              fileId : fileId,
              fileSize : (file.size / 1024) > 1024 ? ((file.size / 1024)/1024).toFixed(2) + " MB" : (file.size / 1024).toFixed(2) + " KB",
              content: file.name,
              sender: "me",
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              status: "read",
            }]);

    const reader = new FileReader();
    let offset = 0;
    const chunkSize = 16384; // 16KB. This is a good default. Max SCTP message size is often larger, but 16KB is safe.
    // Max RTCDataChannel message size can be up to 256KB or more for ArrayBuffers on some browsers, but SCTP itself fragments.
    // However, the internal buffer we are concerned about is different.

    // Configure bufferedAmountLowThreshold on your data channel, ideally when it's created.
    // This threshold tells the browser when to fire the 'bufferedamountlow' event.
    // A common value is a fraction of the typical max buffer (e.g. 1MB if max buffer is 16MB).
    // If not set, it defaults to 0, meaning the event fires only when the buffer is empty.
    // For this example, let's assume it's set, or we can set it here if the DC is new.
    // Example: dataChannelRef.current.bufferedAmountLowThreshold = 256 * 1024; // 256KB

    const sendNextChunk = () => {
        // Check if we need to wait for the buffer to drain
        // The HIGH_WATER_MARK should be significantly less than the absolute max buffer of the browser's SCTP stack (often ~16MB).
        // Using 1MB-4MB is a reasonable high water mark to pause sending.
        const HIGH_WATER_MARK = 1 * 1024 * 1024; // 1 MB

        if (connectionRef.current.bufferedAmount > HIGH_WATER_MARK) {
            // console.log(`Buffer high (${connectionRef.current.bufferedAmount} bytes). Pausing send. Waiting for 'bufferedamountlow'.`);
            connectionRef.current.onbufferedamountlow = () => {
                // Clean up the event listener once it fires
                connectionRef.current.onbufferedamountlow = null;
                sendNextChunk(); // Retry sending the current chunk
            };
            return; // Exit and wait for the event
        }

        // If current chunk data is available from reader.onload, send it
        if (reader.readyState === FileReader.LOADING) {
            // This should ideally not happen if logic is correct, means we called sendNextChunk before onload
            console.warn("FileReader still loading, waiting a bit.");
            setTimeout(sendNextChunk, 50); // Small delay and retry
            return;
        }
        
        // If reader.result has data (meaning onload fired for the current slice)
        if (reader.result && reader.result.byteLength > 0) {
            try {
                connectionRef.current.send(reader.result); // reader.result is the ArrayBuffer
                offset += reader.result.byteLength;
                setUploadingStatus((offset / file.size) * 100);
            } catch (e) {
                console.error("Error sending chunk:", e);
                // If 'send queue is full' error occurs here, it means our HIGH_WATER_MARK check
                // wasn't enough or something filled the buffer very quickly between the check and send().
                // The 'bufferedamountlow' logic should eventually recover if it was temporary.
                // For persistent errors, you might need to abort.
                setMessages((prev) => prev.map(msg => msg.messageId === messageId ? {...msg,content : `Error sending ${file.name}`, status: "error"} : msg));
                setUploadingStatus(0); // Abort on send error
                return;
            }
        }

        // Check if more chunks to read and send
        if (offset < file.size) {
            readSlice(offset); // Read the next slice, which will trigger reader.onload, then sendNextChunk
        } else {
            // console.log("Finished sending all chunks for:", file.name);
            try {
                connectionRef.current.send(JSON.stringify({ type: 'file-eof', name: file.name }));
                setSendingFileId(null);
            } catch (e) {
                console.error("Failed to send EOF:", e);
            }
            setUploadingStatus(100); // Or 0 to reset
            // Consider setting uploadingStatus to 0 after a short delay or on acknowledgment from receiver
            setTimeout(() => setUploadingStatus(0), 2000);
        }
    };

    reader.onload = ( ) => {
        // event.target.result contains the ArrayBuffer of the chunk
        // console.log(`Loaded chunk: offset=${offset}, size=${event.target.result.byteLength}`);
        // Now that the chunk is loaded, try to send it.
        // sendNextChunk will handle buffer checks.
        sendNextChunk();
    };

    reader.onerror = (error) => {
        console.error("FileReader error:", error);
        setMessages((prev) => prev.map(msg => msg.messageId === messageId ? {...msg,content : `Error sending ${file.name}`, status: "error"} : msg));
        setUploadingStatus(0);
    };

    const readSlice = (o) => {
        // console.log(`Reading slice at offset: ${o}`);
        const slice = file.slice(o, o + chunkSize);
        reader.readAsArrayBuffer(slice);
        // The actual sending will happen in reader.onload -> sendNextChunk
    };

    // Start the process
        setUploadingStatus(0.1); // Indicate start, slightly above 0
        readSlice(offset); // Start reading the first chunk
  };


  if (callState === "audio" && callingContact) {
    return <AudioCallScreen audioCallRef={audioCallRef} callStatus={callStatus} contact={callingContact} onEndCall={handleEndCall} onAccept={handleAcceptCall}
        onDecline={handleDeclineCall} handleRemoteStreamMute={handleRemoteStreamMute} isMuted={isMuted} setIsMuted={setIsMuted} isAudioAllowed={isAudioAllowed} />
  }

  if (callState === "video" && callingContact) {
    return <VideoCallScreen localVideoRef={localVideoRef} remoteVideoRef={remoteVideoRef} contact={callingContact} onEndCall={handleEndCall}  onAccept={handleAcceptCall}
        onDecline={handleDeclineCall} callStatus={callStatus} handleRemoteStreamMute={handleRemoteStreamMute} isMuted={isMuted} setIsMuted={setIsMuted} isAudioAllowed={isAudioAllowed}
        isLocalVideoOn={isLocalVideoOn} isRemoteVideoOn={isRemoteVideoOn} handleLocalVideoToggle={handleLocalVideoToggle} switchVideoStreams={switchVideoStreams} isSwitchedVideos={isSwitchedVideos}
        sendVideoChatMessage={sendVideoChatMessage} videoChatMessages={videoChatMessages} showVideoChat={showVideoChat} setShowVideoChat={setShowVideoChat} unreadVideoChatMessagesCount={unreadVideoChatMessagesCount} userInfo={userInfo} />
  }

  // if ((callState === "incoming-audio" || callState === "incoming-video") && callingContact) {
  //   return (
  //     <IncomingCallScreen
  //       contact={callingContact}
  //       callType={callState === "incoming-audio" ? "audio" : "video"}
  //     />
  //   )
  // }

  return (
    <div className="h-screen bg-[#E8CBC0]/10 flex">
      {/* Sidebar */}
      <ChatSidebar
        contacts={contacts}
        selectedContact={selectedContact}
        onSelectContact={handleUserSelection}
        onAddContact={() => setShowAddContact(true)}
        fetchContacts={fetchContacts}
        userId={userInfo._id}
        setIsSidebarOpen={setIsSidebarOpen}
        isSidebarOpen={isSidebarOpen}
        onLogout={onLogout}
      />
      {/* Main Chat Area */}
      <div className="flex-1">
        {selectedContact ? (
          <ChatView closeChat={closeChat} sendingFileId={sendingFileId} uploadingStatus={uploadingStatus} sendFile={sendFile} messages={messages} setMessages={setMessages} sendMessage={sendMessage} contact={selectedContact} onStartCall={handleStartCall} />
        ) : (
          waiting
          ? <div className="h-full flex items-center justify-center bg-white">
            
            <div className="text-center text-gray-500">
              <div className="w-24 h-24 bg-[#E8CBC0]/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">💬</span>
              </div>
              <h3 className="text-lg font-medium mb-2 text-[#636FA4]"> Waiting for user to accept connection request </h3>
              <p className="flex justify-center text-[#636FA4]"><Loader className="animate-spin" /></p>
            </div>
          </div>
          : <>
              <div className="h-[6%] p-3 flex items-center">
              <div onClick={() => setIsSidebarOpen(true)} className="w-10 h-10 bg-[#636FA4] rounded-full flex items-center justify-center shadow-md">
                  <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-[#636FA4] ml-2 text-lg font-semibold">Callify</span>
            </div>
            <div className="h-[94%] flex items-center justify-center bg-white">
            <div className="text-center text-gray-500">
              <div className="w-24 h-24 bg-[#E8CBC0]/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">💬</span>
              </div>
              <h3 className="text-lg font-medium mb-2 text-[#636FA4]">Select a chat to start messaging</h3>
              <p className="text-sm text-gray-600 mb-4">Choose from your existing conversations or start a new one</p>
            </div>
          </div>
            </>
        )}
      </div>

      {/* Add Contact Modal */}
      <AddContactModal
        isOpen={showAddContact}
        onClose={() => setShowAddContact(false)}
        onAddContact={handleAddContact}
      />
    </div>
  )
}
