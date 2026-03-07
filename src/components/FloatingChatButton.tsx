import React, { useState, useRef, useEffect } from "react";
import { useRive, useStateMachineInput } from "@rive-app/react-canvas";
import { useChat } from "../hooks/useChat";
import { useCharacter } from "../context/CharacterContext";
import { COLORS } from "../constants";

interface FloatingChatButtonProps {
  onClose?: () => void;
}

const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({ onClose }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, isLoading, sendMessage, clearMessages } = useChat();
  const { selected: character } = useCharacter();

  // Set up Rive for the character
  const riveParams = character.riveConfig
    ? { src: character.file, stateMachines: character.riveConfig.stateMachines, autoplay: true }
    : { src: character.file, autoplay: true };
  const { RiveComponent, rive } = useRive(riveParams);
  const smName = character.riveConfig?.stateMachines?.[0];
  const idleInputName = character.riveConfig?.idleInput?.name;
  const idleInputValue = character.riveConfig?.idleInput?.value;
  const idleInput = useStateMachineInput(rive, smName ?? undefined, idleInputName ?? undefined, idleInputValue);

  useEffect(() => {
    if (idleInput != null && idleInputValue !== undefined) {
      idleInput.value = idleInputValue;
    }
  }, [idleInput, idleInputValue]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      clearMessages();
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    clearMessages();
    onClose?.();
  };

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;
    const text = message.trim();
    setMessage("");
    await sendMessage(text);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Circle Button with Character - positioned at bottom left */}
      <div style={{ position: "fixed", bottom: "20px", left: "20px", zIndex: 999 }}>
        {/* Chat Window appears above the character */}
        {isOpen && (
          <div
            style={{
              position: "absolute",
              bottom: "95px",
              left: "0",
              width: "320px",
              height: "400px",
              backgroundColor: "white",
              borderRadius: "16px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              marginBottom: "10px",
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "10px 14px",
                backgroundColor: COLORS.primary,
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexShrink: 0,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "20px" }}>{character.emoji}</span>
                <span style={{ fontWeight: "600", fontSize: "14px" }}>{character.name}</span>
              </div>
              <button
                onClick={handleClose}
                style={{
                  background: "none",
                  border: "none",
                  color: "white",
                  fontSize: "18px",
                  cursor: "pointer",
                  padding: "2px",
                  lineHeight: 1,
                  opacity: 0.8,
                }}
                onMouseOver={(e) => e.currentTarget.style.opacity = "1"}
                onMouseOut={(e) => e.currentTarget.style.opacity = "0.8"}
              >
                ✕
              </button>
            </div>

            {/* Messages Area */}
            <div
              style={{
                flex: 1,
                padding: "10px",
                overflowY: "auto",
                backgroundColor: "#f8f9fa",
              }}
            >
              {messages.length === 0 && (
                <div
                  style={{
                    textAlign: "center",
                    color: "#666",
                    fontSize: "12px",
                    padding: "16px",
                  }}
                >
                  <p>Hi! I'm {character.name}.</p>
                  <p style={{ fontSize: "11px" }}>Ask me anything about the test!</p>
                </div>
              )}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    marginBottom: "8px",
                    padding: "6px 10px",
                    borderRadius: "10px",
                    maxWidth: "85%",
                    backgroundColor: msg.type === "user" ? "#e3f2fd" : "white",
                    border: msg.type === "ai" ? "1px solid #e0e0e0" : "none",
                    alignSelf: msg.type === "user" ? "flex-end" : "flex-start",
                    marginLeft: msg.type === "user" ? "auto" : "0",
                  }}
                >
                  <div style={{ fontSize: "11px", fontWeight: "bold", marginBottom: "2px", color: msg.type === "user" ? "#1976D2" : "#388E3C" }}>
                    {msg.type === "user" ? "You" : character.name}
                  </div>
                  <div style={{ fontSize: "12px", lineHeight: "1.4" }}>{msg.content}</div>
                </div>
              ))}
              {isLoading && (
                <div style={{ textAlign: "center", color: "#666", fontSize: "11px", padding: "6px" }}>
                  {character.name} is typing...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div
              style={{
                padding: "10px",
                borderTop: "1px solid #e0e0e0",
                backgroundColor: "white",
                display: "flex",
                gap: "6px",
                flexShrink: 0,
              }}
            >
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  border: "1px solid #ddd",
                  borderRadius: "16px",
                  outline: "none",
                  fontSize: "12px",
                }}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !message.trim()}
                style={{
                  padding: "8px 14px",
                  backgroundColor: isLoading || !message.trim() ? "#ccc" : COLORS.primary,
                  color: "white",
                  border: "none",
                  borderRadius: "16px",
                  cursor: isLoading || !message.trim() ? "not-allowed" : "pointer",
                  fontSize: "12px",
                }}
              >
                Send
              </button>
            </div>
          </div>
        )}

        {/* Character Button */}
        <button
          onClick={handleToggle}
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            backgroundColor: "transparent",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            transition: "transform 0.2s, box-shadow 0.2s",
            overflow: "hidden",
            padding: 0,
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = "scale(1.1)";
            e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.2)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
          }}
          title="Chat with AI"
        >
          <RiveComponent style={{ width: "100%", height: "100%" }} />
        </button>
      </div>
    </>
  );
};

export default FloatingChatButton;
