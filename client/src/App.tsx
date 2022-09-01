/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useRef, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import io from 'socket.io-client'
// import {Socket} from 'socket.io-client';
import Card, { Listing } from './components/card/card';
import ConnectedUsers from './components/connectedUsers/ConnectedUsers';
import EnterUsername from './components/EnterUsername';
import Messages from './components/messages/Messages';

const cardsInfo: Listing[] = [
  {
    title: "Listing 1",
    id:"a1",
    userId: "user1"
  },
  {
    title: "Listing 2",
    id:"a2",
    userId: "user2"
  },
  {
    title: "Listing 3",
    id:"a3",
    userId: "user1"
  },
]

const App = () => {
  const [connectedUsers, setConnectedUsers] = useState([] as {id: string, username: string}[]);
  const [username, setUsername] = useState("");
  const [listingId, setListingId] = useState("");
  const [userId, setUserId] = useState("");

  const [connected, setConnected] = useState(false) // set en false 
  const [messages, setMessages] = useState([] as {message: string, userId: string}[]);
  const [message, setMessage] = useState("");

  const socketClient = useRef<SocketIOClient.Socket>();
  // const socketClient = useRef<Socket>();

  useEffect(() => {
    socketClient.current = io.connect("http://localhost:5000");
    // socketClient.current = io("http://localhost:5000");

    if(socketClient.current){
      socketClient.current.on("room-created-successfully", () => {
        setConnected(true); 
      })
  
      socketClient.current.on("room-already-exist", () => {
        toast.error("ya tienes un chat activo por este listing")
      })
  
      socketClient.current.on("get-connected-users", (connectedUsers: {id: string, username: string}[]) => {
        setConnectedUsers(connectedUsers.filter(user => user.username !== username));
      })

      socketClient.current.on("receive-message", (message: {message: string; userId: string}) => {
        setMessages(prev => [...prev, message]);
      })
    }

    return () => {
      socketClient.current?.disconnect();
      socketClient.current = undefined;
    };
  }, [username])

  const handleConnection = (listingId:string, userId:string ) => {
    if(socketClient.current){
      socketClient.current.emit("handle-connection", listingId, userId); 
    }
  }

  const handleSendMenssage = () => {
    if(socketClient.current){
      setMessages(prev => [...prev, {message, userId}]);
      console.log("ENVIO:", {listingId, message, userId} );
      socketClient.current.emit("message", {listingId, message, userId});
      setMessage("")
    }
  }

  const handleOnGetInContact = (listingId:string, userId:string) => {
    alert("contactar el listing " + listingId );
    setListingId(listingId);
    setUserId(userId)
    handleConnection(listingId, userId);
  }

  const handleChangesOnMsg = (e: any) => {
    setMessage(e.target.value)
  }

  return (
    <div className="app">
      <div style={{display:'flex', justifyContent:'space-around', alignItems:'center', width:'100%', paddingTop:'50px'}}>
        {cardsInfo?.map((listing) => (
          <div key={listing.id} >
            <Card
              listing={listing}
              handleOnGetInContact={handleOnGetInContact}
            />
          </div>
        ))}
      </div>

      {
        connected && 
        <>
          <div style={{position:'absolute', bottom:'0', right:'15px', width:'220px', height:'300px', border:'1px solid grey'}}>
            <div style={{height:'80%', width:'100%'}}>
              {
                messages?.map((msg) => (
                  <div style={{width:'110px',backgroundColor:'blue', borderRadius:'7px', padding:'10px'}}>
                    <p style={{color:'white'}}>De: {msg.userId}</p>
                    <p style={{color:'white'}}>{msg.message}</p>
                  </div>
                ))
              }

            </div>
            <input type="text" placeholder='my messagge' onChange={(event)=>handleChangesOnMsg(event)} />
            <button style={{backgroundColor: "cyan", borderRadius:'5px', paddingInline:'10px'}} onClick={handleSendMenssage}>Send</button>
          </div>
        </>
      }

      <ToastContainer position="bottom-right"/>
    </div>
  );
}

export default App;
