import React, { useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useRive } from "@rive-app/react-canvas";
import { useChat } from "../hooks/useChat";
import { useCharacter } from "../context/CharacterContext";
import Header from "./Header";
import { COLORS } from "../constants";

const Chat: React.FC = () => {
  const [message, setMessage] = useState("");
  const { messages: chatHistory, isLoading, sendMessage } = useChat();
  const { selected: character } = useCharacter();
  const location = useLocation();
  const welcomeMessage = (location.state as { welcome?: string } | null)
    ?.welcome;

  const { RiveComponent } = useRive({
    src: character.file,
    autoplay: true,
  });

  const handleSendMessage = useCallback(async () => {
    if (!message.trim() || isLoading) return;
    const text = message.trim();
    setMessage("");
    await sendMessage(text);
  }, [message, isLoading, sendMessage]);

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
      <Header />

      <div style={{ display: "flex", height: "calc(100vh - 120px)" }}>
        {/* Character panel */}
        <div
          style={{
            width: "280px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "20px",
            gap: "12px",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: "240px",
              height: "240px",
              border: `2px solid ${COLORS.border}`,
              borderRadius: "16px",
              backgroundColor: "white",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              overflow: "hidden",
            }}
          >
            <RiveComponent style={{ width: "100%", height: "100%" }} />
          </div>
          <div
            style={{
              fontSize: "15px",
              fontWeight: "600",
              color: COLORS.primary,
            }}
          >
            {character.emoji} {character.name}
          </div>
        </div>

        {/* Chat Interface */}
        <div
          style={{
            flex: 1,
            padding: "20px 20px 20px 0",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <h1 style={{ margin: 0, marginBottom: "12px", color: "#333" }}>
            AI Chat
          </h1>

          {welcomeMessage && (
            <div
              style={{
                backgroundColor: "#eafaf1",
                border: `1px solid ${COLORS.success}`,
                color: COLORS.success,
                padding: "10px 16px",
                borderRadius: "8px",
                marginBottom: "12px",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              {welcomeMessage}
            </div>
          )}

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
                <p>Welcome! Start a conversation with {character.name}...</p>
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
                  {msg.type === "user"
                    ? "You"
                    : `${character.emoji} ${character.name}`}
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
                {character.emoji} {character.name} is typing... 🤔
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Message ${character.name}... (Press Enter to send)`}
              style={{
                flex: 1,
                padding: "12px 15px",
                border: "1px solid #ddd",
                borderRadius: "25px",
                outline: "none",
                fontSize: "16px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !message.trim()}
              style={{
                padding: "12px 25px",
                backgroundColor:
                  isLoading || !message.trim() ? "#ccc" : "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "25px",
                cursor:
                  isLoading || !message.trim() ? "not-allowed" : "pointer",
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
