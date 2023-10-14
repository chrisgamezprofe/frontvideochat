import {
  Container,
  Header,
  Button,
  Card,
  Input,
  Image,
  Icon,
  Divider,
  Message
} from "semantic-ui-react";
import "./App.css";
import "semantic-ui-css/semantic.min.css";
import foto from './assets/foto.jpg'
import { useEffect, useRef, useState } from "react";
import io from 'socket.io-client'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import Peer from 'simple-peer'

const socket = io.connect("https://backend-videochat.onrender.com");
//const socket = io.connect("https://localhost:5000")
function App() {

  const currentUserVideo = useRef()
  const otherUserVideo = useRef()
  const connectionRef = useRef()

  const [stream, setStream] = useState()
  const [name, setName] = useState("")
  const [user, setUser] = useState("")
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState();
  const [callAccepted, setCallAccepted] = useState(false);
  const [idToCall, setIdToCall] = useState("");
  const [callEnded, setCallEnded] = useState(false);
  
  useEffect(() => {
     
         navigator.mediaDevices
           .getUserMedia({ video: true, audio: true })
           .then((transmition) => {
             setStream(transmition);
             if (currentUserVideo.current) {
               currentUserVideo.current.srcObject = transmition;
              }
              console.log(transmition);
           });
      
    socket.on("user", (id) => {
      setUser(id)
    });

    socket.on("callUser", (data) => {
      setReceivingCall(true)
      setCaller(data.from);
      setName(data.name)
      setCallerSignal(data.signal);
    });


  },[])



  const callUser = (id) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream:stream
    })

    peer.on("signal", (data) => {
      socket.emit("callUser", {
        useToCall: id,
        signalData: data,
        from: user,
        name:name
      })
    })


    peer.on("stream", (stream) => {
      otherUserVideo.current.srcObject = stream
    })

    socket.on("callAccepted", (signal) => {
      setCallAccepted(true)
      peer.signal(signal)
    })

    connectionRef.current =peer

  }

  const answerCall = () => {
    setCallAccepted(true)
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream:stream
    })

    peer.on("signal", (data) => {
      socket.emit("answerCall", {
        signal: data,
        to:caller
      });
    })

    peer.on("stream", (stream) => {
      otherUserVideo.current.srcObject = stream
    });

    peer.signal(callerSignal)
    connectionRef.current = peer
  }

  const leaveCall = () => {
    setCallEnded(true)
    connectionRef.current.destroy()
  }


  return (
    <>
      <Container fluid className="containerVideo">
        <Header as="h2">VIDEOCHRISGAMEZPROFE</Header>

        <Card.Group centered>
          <Card>
            {!stream && <Image src={foto} wrapped ui={false} />}
            {stream && (
              <video
                playsInline
                ref={currentUserVideo}
                autoPlay
                muted
                width="100%"
                height="50%"
              />
            )}

            <Card.Content>
              <Card.Header>
                <Input
                  placeholder="Nombre"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                  }}
                />
              </Card.Header>
              <Card.Meta>Conectado como: {name || "Invitado"}</Card.Meta>
              <Card.Description>
                Mi Reunión: <strong>{user}</strong>
                <CopyToClipboard text={user}>
                  <Button positive fluid>
                    <Icon name="copy" />
                    Copiar ID de reunión
                  </Button>
                </CopyToClipboard>
                <Divider />
                Conectarme a Otra reunión
                <Input
                  fluid
                  placeholder="Ingrese el ID de Reunión"
                  value={idToCall}
                  onChange={(e) => {
                    setIdToCall(e.target.value);
                  }}
                />
              </Card.Description>
            </Card.Content>
            <Card.Content extra>
              {callAccepted && !callEnded ? (
                <Button fluid basic color="red" onClick={leaveCall}>
                  <Icon name="phone" />
                  Colgar
                </Button>
              ) : (
                <Button
                  disabled={idToCall ? false : true}
                  fluid
                  basic
                  color="green"
                  onClick={() => {
                    callUser(idToCall);
                  }}
                >
                  <Icon name="phone" /> Llamar
                </Button>
              )}
              {callAccepted && `ID Reunión: ${idToCall}`}
              <Divider />
              {receivingCall && !callAccepted ? (
                <>
                  <Message info header={`Llamada entrante de ${name} ...`} />
                  <Button basic color="green" onClick={answerCall}>
                    <Icon name="phone" /> Contestar
                  </Button>
                </>
              ) : (
                <></>
              )}
            </Card.Content>
          </Card>

          {callAccepted && !callEnded &&  (
            <Card>
              <video
                playsInline
                ref={otherUserVideo}
                autoPlay
                muted
                width="100%"
                height="50%"
              />

              <Card.Content>
                <Card.Header>
                  <Input
                    placeholder="Nombre"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                    }}
                  />
                </Card.Header>
                <Card.Meta>Conectado como: {name || "Invitado"}</Card.Meta>
                <Card.Description>
                  Mi Reunión: <strong>{user}</strong>
                  <CopyToClipboard text={user}>
                    <Button positive fluid>
                      <Icon name="copy" />
                      Copiar ID de reunión
                    </Button>
                  </CopyToClipboard>
                  <Divider />
                  Conectarme a Otra reunión
                  <Input
                    fluid
                    placeholder="Ingrese el ID de Reunión"
                    value={idToCall}
                    onChange={(e) => {
                      setIdToCall(e.target.value);
                    }}
                  />
                </Card.Description>
              </Card.Content>
              <Card.Content extra>
                {callAccepted && !callEnded ? (
                  <Button fluid basic color="red" onClick={leaveCall}>
                    <Icon name="phone" />
                    Colgar
                  </Button>
                ) : (
                  <Button
                    disabled={idToCall ? false : true}
                    fluid
                    basic
                    color="green"
                    onClick={() => {
                      callUser(idToCall);
                    }}
                  >
                    <Icon name="phone" /> Llamar
                  </Button>
                )}
                {callAccepted && `ID Reunión: ${idToCall}`}
                <Divider />
                {receivingCall && !callAccepted ? (
                  <>
                    <Message info header={`Llamada entrante de ${name} ...`} />
                    <Button basic color="green" onClick={answerCall}>
                      <Icon name="phone" /> Contestar
                    </Button>
                  </>
                ) : (
                  <></>
                )}
              </Card.Content>
            </Card>
          )}
        </Card.Group>
      </Container>
    </>
  );
}

export default App;
