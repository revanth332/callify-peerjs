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

export function MainInterface({userInfo}) {
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
  const [isAudioAllowed,setIsAudioAllowed] = useState(true);
  const [isMuted, setIsMuted] = useState(false)
  // const [facingMode,setFacingMode]

  const peerInstance = useRef(null);
  const connectionRef = useRef(null);
  const audioCallRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerCallRef = useRef(null);

  useEffect(() => {
    const peer = new Peer(userInfo.peerId);
    
    peer.on("open",(id) => {
      console.log("peer id ",id);
    })

    peer.on("call",async (call) => {
      console.log("incoming call",call.metadata.name);
      const contact = contacts.find(item => item.name === call.metadata.name);
      if(contact){
        setCallState(call.metadata.type);
        call.on("close",() => {
          console.log("reciever call close")
          handleEndCall();
        })
        console.log(audioCallRef);
        call.on("stream",(remoteAudioStream) => {
          console.log("answer recieved",remoteVideoRef);
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
      console.log(conn)
      // const proceed = window.confirm(`Do you want to connect with ${conn.metadata.name}`);
      toast("New connection request", {
          description: conn.metadata.name + " wants to connect with you",
          action: {
            label: "Accept",
            onClick: () => {
              const contact = contacts.find(item => item.name === conn.metadata.name);
              setIsSidebarOpen(false);
              setSelectedContact(contact);

              conn.on("open", (data) => {
                console.log("connection created",data);
              });

                conn.on("data", (data) => {
                  const dataObj = JSON.parse(data);
                  if(dataObj.type === "text"){
                      const message = {
                      id: Date.now().toString(),
                      content: data,
                      sender: "contact",
                      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                      status: "read",
                    }
                    setMessages(prev => [...prev,message]);
                  }
                  else if(dataObj.type === "mute"){
                      setIsAudioAllowed(!dataObj.value);
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
      //   if(proceed){
      //                 const contact = contacts.find(item => item.name === conn.metadata.name);
      //       setIsSidebarOpen(false);
      //       setSelectedContact(contact);

      //       conn.on("open", (data) => {
      //         console.log("connection created",data);
      //       });

      //         conn.on("data", (data) => {
      //           const message = {
      //             id: Date.now().toString(),
      //             content: data,
      //             sender: "contact",
      //             timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      //             status: "read",
      //           }
      //         setMessages(prev => [...prev,message]);
      //       });

      //       conn.on("close",()=> {
      //         console.log("closed")
      //       })

      //       connectionRef.current = conn;
      // }
    })
    
    peerInstance.current = peer;

    return () => {
      console.log("Cleaning up PeerJS instance...");
      if (peerInstance.current) {
        peerInstance.current.destroy(); // Important for cleanup
        peerInstance.current = null;
      }
    };
  },[userInfo,contacts]);

  useEffect(() => {
    fetchContacts(userInfo._id);
  },[userInfo._id]);

  useEffect(() => {
    console.log(isAudioAllowed,"kl")
  },[isAudioAllowed])

  const fetchContacts = async (userId) => {
    try{
      const result = await API.get.getContacts(userId);
      setContacts(result.contacts);
    }
    catch(err){
      console.log(err);
    }
    }

  const handlePeerConnection = (peerId,contact) => {
    try{
      console.log("connection started",peerId)
      const connection = peerInstance.current.connect(peerId,{metadata : {name:userInfo.name}});
      setWaiting(true); 
      connection.on("open",() => {
        setWaiting(false);
        setSelectedContact(contact);
      })
      connection.on("data",(data) => {
        const dataObj = JSON.parse(data);
        if(dataObj.type === "text"){
          const message = {
              id: Date.now().toString(),
              content: dataObj.value,
              sender: "contact",
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              status: "read",
            }
          setMessages(prev => [...prev,message])
        }

        else if(dataObj.type === "mute"){
          setIsAudioAllowed(!dataObj.value);
        }
      })
    connectionRef.current = connection;
    }
    catch(err){
      console.log(err);
    }
  }

  const sendMessage = (text) => {
    connectionRef.current.send(JSON.stringify({type:"text",value : text}));
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
    console.log(audioCallRef);
    call.on("stream",(remoteStream) => {
      console.log("answer recieved",audioCallRef);
      setCallStatus("connected");
      if(type === "audio") audioCallRef.current.srcObject = remoteStream;
      else if(type === "video") setRemoteVideoStream(remoteStream);
    })
    call.on("close",() => {
      console.log("sender call close")
      handleEndCall();
    })
    setCallingContact(contact);
    setCallState(type);
    console.log("local",localVideoRef);
  }
  
  useEffect(() => {
    const streamLocalVideo = async () => {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: {facingMode : "user"}, audio: {
          noiseSuppression: true,
          echoCancellation: true,
          autoGainControl: true,
        } });
      localVideoRef.current.srcObject = mediaStream;
    }
    if(callState === "video" && callStatus === "connected"){
      streamLocalVideo();
    }
  },[callState,callStatus])

  useEffect(() => {
    console.log("remote",remoteVideoRef)
    if(remoteVideoStream){
      remoteVideoRef.current.srcObject = remoteVideoStream;
    }
  },[remoteVideoStream,remoteVideoRef.current])

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
      console.log(muteValue);
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
    setCallState("none")
    setCallingContact(null);
    setCallStatus("connecting");
    peerCallRef.current.close();
    peerCallRef.current = null;
  }

  const handleUserSelection = async (contact) => {
    setIsSidebarOpen(false);
    if(contact.status === "online"){
      const result = await API.get.getPeerId(contact._id)
      handlePeerConnection(result.peerId,contact);
    }
  }

  useEffect(() => {
    console.log("call state : ",callState)
  },[callState])

  // Simulate incoming call for demo
  // const simulateIncomingCall = () => {
  //   handleIncomingCall(contacts[1], "audio")
  // }

  if (callState === "audio" && callingContact) {
    return <AudioCallScreen audioCallRef={audioCallRef} callStatus={callStatus} contact={callingContact} onEndCall={handleEndCall} onAccept={handleAcceptCall}
        onDecline={handleDeclineCall} handleRemoteStreamMute={handleRemoteStreamMute} isMuted={isMuted} setIsMuted={setIsMuted} isAudioAllowed={isAudioAllowed} />
  }

  if (callState === "video" && callingContact) {
    return <VideoCallScreen localVideoRef={localVideoRef} remoteVideoRef={remoteVideoRef} contact={callingContact} onEndCall={handleEndCall}  onAccept={handleAcceptCall}
        onDecline={handleDeclineCall} callStatus={callStatus} handleRemoteStreamMute={handleRemoteStreamMute} isMuted={isMuted} setIsMuted={setIsMuted} isAudioAllowed={isAudioAllowed} />
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
      />
      {/* Main Chat Area */}
      <div className="flex-1">
        {selectedContact ? (
          <ChatView setIsSidebarOpen={setIsSidebarOpen} messages={messages} setMessages={setMessages} sendMessage={sendMessage} contact={selectedContact} onStartCall={handleStartCall} />
        ) : (
          waiting
          ? <div className="h-full flex items-center justify-center bg-white">
            
            <div className="text-center text-gray-500">
              <div className="w-24 h-24 bg-[#E8CBC0]/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">💬</span>
              </div>
              <h3 className="text-lg font-medium mb-2 text-[#636FA4]"> Waiting for Dharma to accept connection request </h3>
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
