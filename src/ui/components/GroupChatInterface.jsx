import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../supabaseClient"; // Your configured Supabase client

// Props: groupId represents the chat group and user contains user info (e.g., id, name)
const ChatRoom = ({ groupId, user }) => {b
  // State to hold the list of messages and the new message being typed
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  // Ref to keep track of the bottom of the messages container for auto-scrolling
  const messageEndRef = useRef(null);

  // Helper function that scrolls the chat to the latest message
  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Effect to load the chat messages and subscribe to new ones
  useEffect(() => {
    // Function to load all past messages for the given group, ordered from oldest to newest
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("group_id", groupId)
        .order("created_at", { ascending: true });
      if (error) {
        console.error("Error fetching messages:", error);
      } else {
        setMessages(data);
        scrollToBottom();
      }
    };

    fetchMessages();

    // Set up a realtime subscription so that new messages are added automatically
    const messageSubscription = supabase
      .from(`messages:group_id=eq.${groupId}`)
      .on("INSERT", (payload) => {
        setMessages((prevMessages) => [...prevMessages, payload.new]);
        scrollToBottom();
      })
      .subscribe();

    // Clean up the subscription when the component unmounts or groupId changes
    return () => {
      supabase.removeSubscription(messageSubscription);
    };
  }, [groupId]);

  // Function to handle sending a new message
  const sendMessage = async () => {
    // Prevent sending if the message is empty
    if (!newMessage.trim()) return;

    const { data, error } = await supabase.from("messages").insert([
      {
        content: newMessage,
        group_id: groupId,
        user_id: user.id, // Ensure your user data has an 'id' property
      },
    ]);

    if (error) {
      console.error("Error sending message:", error);
    } else {
      // Clear the input. The realtime subscription will automatically add the new message to state.
      setNewMessage("");
    }
  };

  // Optionally send the message on Enter key press
  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div
      className="chat-container"
      style={{ display: "flex", flexDirection: "column", height: "100vh" }}
    >
      {/* Messages container */}
      <div
        className="messages"
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "10px",
          background: "#f8f8f8",
        }}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              marginBottom: "10px",
              background: message.user_id === user.id ? "#DCF8C6" : "#FFF",
              alignSelf: message.user_id === user.id ? "flex-end" : "flex-start",
              padding: "8px",
              borderRadius: "4px",
              maxWidth: "70%",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <p style={{ margin: 0 }}>{message.content}</p>
            <small style={{ fontSize: "0.75rem", color: "#555" }}>
              {new Date(message.created_at).toLocaleTimeString()}
            </small>
          </div>
        ))}
        {/* A dummy element for scrolling to the bottom */}
        <div ref={messageEndRef} />
      </div>

      {/* Input container */}
      <div
        className="input-container"
        style={{
          display: "flex",
          padding: "10px",
          borderTop: "1px solid #ccc",
          background: "#fff",
        }}
      >
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          style={{
            flex: 1,
            marginRight: "10px",
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
        />
        <button
          onClick={sendMessage}
          style={{
            padding: "8px 12px",
            borderRadius: "4px",
            background: "#007bff",
            color: "#fff",
            border: "none",
            cursor: "pointer",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatRoom;