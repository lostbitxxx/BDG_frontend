import React, { useState, useCallback, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useRive, useStateMachineInput } from "@rive-app/react-canvas";
import { useChat } from "../hooks/useChat";
import { useCharacter } from "../context/CharacterContext";
import Header from "./Header";
import { COLORS } from "../constants";

const EMERALD = {
  50: "#ecfdf5",
  100: "#d1fae5",
  200: "#a7f3d0",
  500: "#10b981",
  600: "#059669",
};

const Chat: React.FC = () => {
  const [message, setMessage] = useState("");
  const chatMessagesRef = useRef<HTMLDivElement>(null);
  const { messages: chatHistory, isLoading, sendMessage } = useChat();
  const { selected: character, affinityLevelInfo } = useCharacter();
  const { level, label, totalXp, xpInLevel, xpNeededForNextLevel, xpPerLevel } = affinityLevelInfo;
  const location = useLocation();
  const welcomeMessage = (location.state as { welcome?: string } | null)?.welcome;

  const riveParams = character.riveConfig
    ? { src: character.file, stateMachines: character.riveConfig.stateMachines, autoplay: true }
    : { src: character.file, autoplay: true };
  const { RiveComponent, rive } = useRive(riveParams);
  const smName = character.riveConfig?.stateMachines?.[0];
  const idleInputName = character.riveConfig?.idleInput?.name;
  const idleInputValue = character.riveConfig?.idleInput?.value;
  const idleInput = useStateMachineInput(rive, smName ?? undefined, idleInputName ?? undefined, idleInputValue);
  useEffect(() => {
    if (idleInput != null && idleInputValue !== undefined) idleInput.value = idleInputValue;
  }, [idleInput, idleInputValue]);

  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [chatHistory, isLoading]);

  const handleSendMessage = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!message.trim() || isLoading) return;
      const text = message.trim();
      setMessage("");
      await sendMessage(text);
    },
    [message, isLoading, sendMessage]
  );

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
      <Header />

      <div style={{ display: "flex", justifyContent: "center", height: "calc(100vh - 120px)", padding: "0 24px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 0 }}>
          {/* Character panel - larger, overlaps into chat */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "20px 0",
              gap: "12px",
              flexShrink: 0,
              marginRight: -80,
              zIndex: 2,
            }}
          >
            <div
              style={{
                width: "480px",
                height: "480px",
                borderRadius: "16px",
                backgroundColor: character.transparentBackground ? "transparent" : "white",
                overflow: "hidden",
              }}
            >
              <RiveComponent style={{ width: "100%", height: "100%" }} />
            </div>
            <div style={{ fontSize: "15px", fontWeight: "600", color: COLORS.primary }}>
              {character.emoji} {character.name}
            </div>
            <div
              style={{
                width: "100%",
                maxWidth: 220,
                fontSize: "13px",
                color: COLORS.muted,
                backgroundColor: "#f3f4f6",
                padding: "12px 14px",
                borderRadius: "12px",
              }}
            >
              <strong>{label}</strong> (Level {level})
              <div style={{ marginTop: "4px" }}>
                <div><strong>{totalXp}</strong> XP</div>
                <div style={{ marginTop: "2px" }}>
                  {level >= 5 ? <>Max level</> : <><strong>{xpNeededForNextLevel}</strong> XP to next level</>}
                </div>
              </div>
              <div
                style={{
                  marginTop: "8px",
                  width: "100%",
                  height: "6px",
                  borderRadius: 999,
                  backgroundColor: "#e5e7eb",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${(xpInLevel / xpPerLevel) * 100}%`,
                    height: "100%",
                    borderRadius: 999,
                    backgroundColor: COLORS.secondary,
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Chat area - Memory Garden style */}
        <div
          style={{
            width: 640,
            minWidth: 480,
            padding: "20px 0 20px 24px",
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
            zIndex: 1,
          }}
        >
          {welcomeMessage && (
            <div
              style={{
                backgroundColor: EMERALD[50],
                color: EMERALD[600],
                padding: "10px 16px",
                borderRadius: "16px",
                marginBottom: "12px",
                fontSize: "14px",
                fontWeight: 500,
              }}
            >
              {welcomeMessage}
            </div>
          )}

          <div
            style={{
              flex: 1,
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
              backgroundColor: "white",
              borderRadius: "32px",
              overflow: "hidden",
            }}
          >
            {/* Chat header - Memory Garden style */}
            <div style={{ padding: "24px", flexShrink: 0, backgroundColor: "white" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    backgroundColor: EMERALD[200],
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "18px",
                  }}
                >
                  {character.emoji}
                </div>
                <div>
                  <div style={{ fontSize: "16px", fontWeight: 600, color: "#1f2937" }}>
                    {character.name}
                  </div>
                  <div style={{ fontSize: "12px", color: EMERALD[600], fontWeight: 500 }}>
                    Your learning companion
                  </div>
                </div>
              </div>
            </div>

            {/* Messages - Memory Garden bubbles */}
            <div
              ref={chatMessagesRef}
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                minHeight: 0,
              }}
            >
              {chatHistory.length === 0 && !isLoading && (
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <p style={{ color: "#9ca3af", textAlign: "center", marginBottom: "24px" }}>
                    Your conversation will appear here.
                    <br />
                    Start by sending a message to {character.name}.
                  </p>
                  <div
                  style={{
                    backgroundColor: "white",
                    borderRadius: "32px",
                    padding: "24px",
                    maxWidth: 320,
                  }}
                  >
                    <div style={{ marginBottom: "8px", color: "#9ca3af", fontWeight: 600, fontSize: "13px" }}>
                      Example
                    </div>
                    <p style={{ color: "#6b7280", lineHeight: 1.6, fontStyle: "italic", margin: 0 }}>
                      Ask me anything about Mandarin practice, or say hello!
                    </p>
                  </div>
                </div>
              )}

              {chatHistory.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    display: "flex",
                    justifyContent: msg.type === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  <div
                    style={{
                      maxWidth: "85%",
                      padding: "12px 16px",
                      borderRadius: "16px",
                      backgroundColor: msg.type === "user" ? EMERALD[600] : EMERALD[50],
                      color: msg.type === "user" ? "white" : "#1f2937",
                      fontSize: "14px",
                      lineHeight: 1.5,
                    }}
                  >
                    <p style={{ margin: 0 }}>{msg.content}</p>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div style={{ display: "flex", justifyContent: "flex-start" }}>
                  <div
                    style={{
                      maxWidth: "85%",
                      padding: "12px 16px",
                      borderRadius: "16px",
                      backgroundColor: EMERALD[50],
                      color: "#1f2937",
                      fontSize: "14px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        border: `2px solid ${EMERALD[500]}`,
                        borderTopColor: "transparent",
                        animation: "spin 0.8s linear infinite",
                      }}
                    />
                    <span>{character.name} is thinking...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Chat input - Memory Garden style */}
            <div style={{ padding: "24px", flexShrink: 0 }}>
              <form
                onSubmit={(e) => handleSendMessage(e)}
                style={{ display: "flex", gap: "12px", alignItems: "center" }}
              >
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder={`Message ${character.name}...`}
                  disabled={isLoading}
                  style={{
                    flex: 1,
                    padding: "12px 20px",
                    border: "2px solid #d1d5db",
                    borderRadius: "9999px",
                    fontSize: "15px",
                    color: "#1f2937",
                    outline: "none",
                    backgroundColor: "white",
                  }}
                />
                <button
                  type="submit"
                  disabled={isLoading || !message.trim()}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    border: "none",
                    backgroundColor: isLoading || !message.trim() ? "#d1d5db" : EMERALD[600],
                    color: "white",
                    cursor: isLoading || !message.trim() ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Chat;
