import React, { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { useRive } from "@rive-app/react-canvas";
import { apiService } from "../services/api";

interface ChatMessage {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
}

const Chat: React.FC = () => {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "connected" | "disconnected" | "checking"
  >("checking");

  const { RiveComponent } = useRive({
    src: "/bunny.riv",
    autoplay: true,
  });

  useEffect(() => {
    const checkConnection = async () => {
      try {
        await apiService.healthCheck();
        setConnectionStatus("connected");
      } catch {
        setConnectionStatus("disconnected");
      }
    };
    checkConnection();
  }, []);

  const addMessage = useCallback((type: "user" | "ai", content: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
    };
    setChatHistory((prev) => [...prev, newMessage]);
  }, []);

  const handleSendMessage = useCallback(async () => {
    if (!message.trim() || isLoading) return;

    const userMessage = message.trim();
    setMessage("");
    addMessage("user", userMessage);
    setIsLoading(true);

    try {
      const response = await apiService.sendChatMessage(userMessage);
      addMessage("ai", response.response);
      setConnectionStatus("connected");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      addMessage("ai", `Error: ${errorMessage}`);
      setConnectionStatus("disconnected");
    } finally {
      setIsLoading(false);
    }
  }, [message, isLoading, addMessage]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage],
  );

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
      {/* Header */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px 40px",
          backgroundColor: "white",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <Link to="/" style={{ textDecoration: "none" }}>
          <div
            style={{
              fontSize: "28px",
              fontWeight: "bold",
              color: "#2c3e50",
              fontFamily: "'Arial', sans-serif",
              cursor: "pointer",
            }}
          >
            BoDongGua
          </div>
        </Link>

        <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
          <div
            style={{
              padding: "4px 12px",
              borderRadius: "12px",
              fontSize: "12px",
              backgroundColor:
                connectionStatus === "connected"
                  ? "#4CAF50"
                  : connectionStatus === "disconnected"
                    ? "#f44336"
                    : "#ff9800",
              color: "white",
            }}
          >
            {connectionStatus === "connected"
              ? "● Connected"
              : connectionStatus === "disconnected"
                ? "● Disconnected"
                : "● Checking..."}
          </div>

          <Link to="/signin">
            <button
              style={{
                padding: "12px 24px",
                fontSize: "16px",
                backgroundColor: "transparent",
                color: "#2c3e50",
                border: "2px solid #2c3e50",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                fontWeight: "500",
              }}
            >
              Sign In
            </button>
          </Link>

          <Link to="/signup">
            <button
              style={{
                padding: "12px 24px",
                fontSize: "16px",
                backgroundColor: "#3498db",
                color: "white",
                border: "2px solid #3498db",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                fontWeight: "500",
              }}
            >
              Sign Up
            </button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div style={{ display: "flex", height: "calc(100vh - 100px)" }}>
        {/* Rive Character */}
        <div
          style={{
            width: "400px",
            height: "400px",
            padding: "20px",
            border: "2px solid #ddd",
            borderRadius: "10px",
            backgroundColor: "white",
            margin: "20px",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          }}
        >
          <RiveComponent style={{ width: "100%", height: "100%" }} />
        </div>

        {/* Chat Interface */}
        <div
          style={{
            flex: 1,
            padding: "20px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <h1 style={{ margin: 0, marginBottom: "20px", color: "#333" }}>
            AI Chat
          </h1>

          <div
            style={{
              flex: 1,
              overflowY: "auto",
              border: "1px solid #ddd",
              borderRadius: "10px",
              padding: "15px",
              marginBottom: "15px",
              backgroundColor: "white",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            {chatHistory.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  color: "#666",
                  fontStyle: "italic",
                  padding: "40px",
                }}
              >
                <p>Welcome! Start a conversation with the AI...</p>
                <p style={{ fontSize: "14px" }}>Ask me anything!</p>
              </div>
            )}
            {chatHistory.map((msg) => (
              <div
                key={msg.id}
                style={{
                  marginBottom: "15px",
                  padding: "10px",
                  borderRadius: "8px",
                  backgroundColor: msg.type === "user" ? "#e3f2fd" : "#f5f5f5",
                  borderLeft: `4px solid ${msg.type === "user" ? "#2196F3" : "#4CAF50"}`,
                }}
              >
                <div
                  style={{
                    fontWeight: "bold",
                    marginBottom: "5px",
                    color: msg.type === "user" ? "#1976D2" : "#388E3C",
                  }}
                >
                  {msg.type === "user" ? "You" : "AI Assistant"}
                </div>
                <div>{msg.content}</div>
                <div
                  style={{ fontSize: "11px", color: "#666", marginTop: "5px" }}
                >
                  {msg.timestamp.toLocaleTimeString()}
                </div>
              </div>
            ))}
            {isLoading && (
              <div
                style={{
                  textAlign: "center",
                  color: "#666",
                  fontStyle: "italic",
                  padding: "10px",
                }}
              >
                AI is typing... 🤔
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message... (Press Enter to send)"
              style={{
                flex: 1,
                padding: "12px 15px",
                border: "1px solid #ddd",
                borderRadius: "25px",
                outline: "none",
                fontSize: "16px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
              disabled={isLoading || connectionStatus === "disconnected"}
            />
            <button
              onClick={handleSendMessage}
              disabled={
                isLoading ||
                !message.trim() ||
                connectionStatus === "disconnected"
              }
              style={{
                padding: "12px 25px",
                backgroundColor:
                  isLoading ||
                  !message.trim() ||
                  connectionStatus === "disconnected"
                    ? "#ccc"
                    : "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "25px",
                cursor:
                  isLoading ||
                  !message.trim() ||
                  connectionStatus === "disconnected"
                    ? "not-allowed"
                    : "pointer",
                fontSize: "16px",
                minWidth: "80px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              {isLoading ? "..." : "Send"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
