import { useState, useEffect, useRef } from "react"
import * as signalR from "@microsoft/signalr"
import DOMPurify from "dompurify"
import type { ChatMessage } from "./types/ChatMessage"

function App() {
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [user, setUser] = useState("")
  const [message, setMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // connect to backend
    const conn = new signalR.HubConnectionBuilder()
      .withUrl("https://localhost:7176/chathub")
      .withAutomaticReconnect()
      .build();

    const startConnection = async () => {
      try {
        await conn.start();
        console.log("Connected to hub");
      } catch (err) {
        console.error("SignalR error:", err);
      }
    };

    // sanitize the messages
    conn.on("ReceiveMessage", (u: string, msg: string) => {
      const safeUser = DOMPurify.sanitize(u);
      const safeMsg = DOMPurify.sanitize(msg);
      setMessages(prev => [...prev, { user: safeUser, message: safeMsg }]);
    });

    startConnection();

    setConnection(conn);

    // stop connection when unmounting
    return () => {
      conn.stop().catch(err => console.error("Error stopping connection:", err));
    };
  }, []);


  // scroll to end of chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])


  async function sendMessage() {
    if (connection && message && user) {
      try {
        await connection.invoke("SendMessage", user, message)
        setMessage("")
      } catch (err) {
        console.error("Send error:", err)
      }
    }
  }


  return (
    <main>
      <div className="messages">
        {messages && messages.length <= 0 &&
          <small className="no-messages">No messages yet</small>
        }

        {messages.length > 0 && messages.map((m, i) => (
          <div key={i} className={`bubble ${m.user === user && "bubble-sent"}`}>
            <small className="bubble-name">{m.user}</small>
            <div className="bubble-message">{m.message}</div>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      <div className="inputs">
        <input
          type="text"
          placeholder="Name"
          value={user}
          onChange={e => setUser(e.target.value)}
          name="Name"
        />

        <input
          type="text"
          placeholder="Message"
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") sendMessage() }}
          name="message"
        />

        <button
          onClick={sendMessage}
          disabled={user == "" || message == "" ? true : false}
        >
          Send
        </button>
      </div>
    </main>
  )
}

export default App
