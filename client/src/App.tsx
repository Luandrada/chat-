/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useRef, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import io from 'socket.io-client'
import {Socket} from 'socket.io-client';
import Card, { Listing } from './components/card/card';
import ConnectedUsers from './components/connectedUsers/ConnectedUsers';
import EnterUsername from './components/EnterUsername';
import Messages from './components/messages/Messages';

const chatsInfo = [
  {
    userIdFrom: 'UserFrom1',
    userIdTo:'UserTo1',
    listingId:'a1',
    mensaje: {
      mensaje:'hola como estas',
      seen: true,
    }

  },
  {
    userIdFrom: 'UserFrom1',
    userIdTo:'UserTo2',
    listingId:'a2',
    mensaje: {
      mensaje:'hola USer 2 como estas',
      seen: false,
    }
  },
  {
    userIdFrom: 'UserFrom1',
    userIdTo:'UserTo3',
    listingId:'a3',
    mensaje: {
      mensaje:'hola',
      seen: true,
    }
  },
]

const cardsInfo: Listing[] = [
  {
    title: "Listing 1",
    id:2,
    userId: "4cf729f8-724a-475e-8206-0930aa6168d2"
  },
  {
    title: "Listing 2",
    id:5,
    userId: "9387a7d1-4bcb-4041-91c1-b9619190d344"
  },
  {
    title: "Listing 3",
    id:7,
    userId: "99d76b56-fcf7-42a1-a103-bebcda803ce5"
  },
]

const App = () => {
  const [connectedUsers, setConnectedUsers] = useState([] as {id: string, username: string}[]);
  const [username, setUsername] = useState("");
  const [listingId, setListingId] = useState("");
  const [userId, setUserId] = useState("");

  const [connected, setConnected] = useState(false) 
  const [showChat, setShowChat] = useState(true) 
  const [messages, setMessages] = useState([] as {message: string, userId: string}[]);
  const [message, setMessage] = useState("");

  //const socketClient = useRef<SocketIOClient.Socket>();
  const socketClient = useRef<Socket>();

  useEffect(() => {
    //socketClient.current = io.connect("http://localhost:5000"); // cuando inici sesion 
    socketClient.current = io("http://localhost:5001");

    if(socketClient.current){
      socketClient.current.on("room-created-successfully", () => {
        setConnected(true); 
      })
  
      socketClient.current.on("room-already-exist", () => {
        toast.error("ya tienes un chat activo por este listing")
      })
  
      socketClient.current.on("get-connected-users", (connectedUsers: {id: string, username: string}[]) => {
        console.log(connectedUsers);
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

  const handleOnGetInContact = (listingId:string) => {
    alert("contactar el listing " + listingId );
    setListingId(listingId);
    handleConnection(listingId, userId);
  }

  const handleChangesOnMsg = (e: any) => {
    setMessage(e.target.value)
  }

  const handleInicioDeSesion = (e:any) => {
    setUserId(e.target.value)
  }

  return (
    <div className="app">
      <input type="text" placeholder='my user ID' onChange={(event)=>handleInicioDeSesion(event)}/>


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
          {
        showChat && 
            <div style={{height:'100%', width:'100%'}}>
                  <div style={{height:'80%', width:'100%'}}>
                    <p onClick={() => setShowChat(false)}>back</p>
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
                </div>}

          {chatsInfo?.map((chat) => (
            <div key={chat.listingId}  style={{height:'50px', width:'100%', border:'1px solid black', padding:'5px', marginBottom:'3px', backgroundColor:'#f3f3f3'}} onClick={()=> setShowChat(true)} >
              <p>{chat.userIdTo}</p>
              <p>{chat.mensaje.mensaje}</p>
            </div>
            ))}
            
            
          </div>
        </>
      }

      <ToastContainer position="bottom-right"/>
    </div>
  );
}

export default App;
