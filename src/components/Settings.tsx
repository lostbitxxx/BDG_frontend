import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import { useAuth } from "../context/AuthContext";
import { COLORS, ROUTES } from "../constants";
import {
  useCharacter,
  CHARACTERS,
  type CharacterKey,
} from "../context/CharacterContext";
import { authService } from "../services/api";
import { useRive } from "@rive-app/react-canvas";
import type { Character } from "../context/CharacterContext";

// ── Character card (same as ChooseCharacter) ──────────────────
const CharacterCard: React.FC<{
  character: Character;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ character, isSelected, onSelect }) => {
  const { RiveComponent } = useRive({ src: character.file, autoplay: true });
  return (
    <div
      onClick={onSelect}
      style={{
        flex: "1 1 180px",
        maxWidth: "220px",
        border: `3px solid ${isSelected ? COLORS.secondary : COLORS.border}`,
        borderRadius: "16px",
        padding: "16px",
        backgroundColor: isSelected ? "#eaf4fd" : "white",
        cursor: "pointer",
        boxShadow: isSelected
          ? "0 6px 20px rgba(52,152,219,0.25)"
          : "0 2px 8px rgba(0,0,0,0.07)",
        transition: "all 0.2s",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "10px",
      }}
    >
      <div
        style={{
          width: "150px",
          height: "150px",
          borderRadius: "12px",
          overflow: "hidden",
          backgroundColor: COLORS.light,
        }}
      >
        <RiveComponent style={{ width: "100%", height: "100%" }} />
      </div>
      <div style={{ textAlign: "center" }}>
        <div
          style={{ fontSize: "18px", fontWeight: "700", color: COLORS.primary }}
        >
          {character.emoji} {character.name}
        </div>
        <div
          style={{ fontSize: "12px", color: COLORS.muted, marginTop: "4px" }}
        >
          {character.description}
        </div>
      </div>
      {isSelected && (
        <div
          style={{
            backgroundColor: COLORS.secondary,
            color: "white",
            fontSize: "12px",
            fontWeight: "600",
            padding: "4px 14px",
            borderRadius: "20px",
          }}
        >
          ✓ Selected
        </div>
      )}
    </div>
  );
};

// ── Settings page ─────────────────────────────────────────────
const Settings: React.FC = () => {
  const { isAuthenticated, user, login, logout } = useAuth();
  const { selected, setCharacter } = useCharacter();
  const navigate = useNavigate();

  // Username section
  const [newUsername, setNewUsername] = useState(user?.username ?? "");
  const [usernameMsg, setUsernameMsg] = useState<{
    text: string;
    ok: boolean;
  } | null>(null);
  const [savingUsername, setSavingUsername] = useState(false);

  // Character section
  const [pendingChar, setPendingChar] = useState<CharacterKey>(selected.key);
  const [charMsg, setCharMsg] = useState<{ text: string; ok: boolean } | null>(
    null,
  );
  const [savingChar, setSavingChar] = useState(false);

  const handleSignOut = () => {
    logout();
    navigate(ROUTES.HOME);
  };

  const handleSaveUsername = async () => {
    if (!newUsername.trim() || newUsername.trim() === user?.username) return;
    setSavingUsername(true);
    setUsernameMsg(null);
    const result = await authService.updateUsername(newUsername.trim());
    if (result.success && result.username && user) {
      login(
        { ...user, username: result.username },
        localStorage.getItem("token")!,
      );
      setUsernameMsg({ text: "Username updated!", ok: true });
    } else {
      setUsernameMsg({ text: result.error ?? "Failed to update.", ok: false });
    }
    setSavingUsername(false);
  };

  const handleSaveCharacter = async () => {
    setSavingChar(true);
    setCharMsg(null);
    await setCharacter(pendingChar);
    setCharMsg({ text: "Character saved!", ok: true });
    setSavingChar(false);
  };

  const sectionStyle: React.CSSProperties = {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "28px 32px",
    marginBottom: "24px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: COLORS.light }}>
      <Header />
      <main
        style={{ maxWidth: "800px", margin: "0 auto", padding: "36px 24px" }}
      >
        <h2
          style={{
            color: COLORS.primary,
            marginBottom: "24px",
            fontSize: "26px",
          }}
        >
          ⚙️ Settings
        </h2>

        {/* ── Username ── */}
        <section style={sectionStyle}>
          <h3
            style={{
              color: COLORS.primary,
              marginBottom: "16px",
              fontSize: "18px",
            }}
          >
            👤 Change Username
          </h3>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <input
              value={newUsername}
              onChange={(e) => {
                setNewUsername(e.target.value);
                setUsernameMsg(null);
              }}
              placeholder="New username"
              style={{
                flex: 1,
                padding: "10px 14px",
                fontSize: "15px",
                border: `2px solid ${COLORS.border}`,
                borderRadius: "8px",
                outline: "none",
              }}
            />
            <button
              onClick={handleSaveUsername}
              disabled={
                savingUsername ||
                !newUsername.trim() ||
                newUsername.trim() === user?.username
              }
              style={{
                padding: "10px 22px",
                fontSize: "15px",
                fontWeight: "600",
                backgroundColor: COLORS.secondary,
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: savingUsername ? "not-allowed" : "pointer",
                opacity: savingUsername ? 0.7 : 1,
              }}
            >
              {savingUsername ? "Saving..." : "Save"}
            </button>
          </div>
          {usernameMsg && (
            <p
              style={{
                marginTop: "8px",
                fontSize: "13px",
                color: usernameMsg.ok ? COLORS.success : COLORS.danger,
              }}
            >
              {usernameMsg.text}
            </p>
          )}
        </section>

        {/* ── Character ── */}
        <section style={sectionStyle}>
          <h3
            style={{
              color: COLORS.primary,
              marginBottom: "6px",
              fontSize: "18px",
            }}
          >
            🎭 Choose Your Character
          </h3>
          <p
            style={{
              color: COLORS.muted,
              marginBottom: "20px",
              fontSize: "14px",
            }}
          >
            Pick a companion — they'll appear in Chat and other activities.
          </p>
          <div
            style={{
              display: "flex",
              gap: "20px",
              flexWrap: "wrap",
              marginBottom: "20px",
            }}
          >
            {CHARACTERS.map((c) => (
              <CharacterCard
                key={c.key}
                character={c}
                isSelected={pendingChar === c.key}
                onSelect={() => setPendingChar(c.key)}
              />
            ))}
          </div>
          <button
            onClick={handleSaveCharacter}
            disabled={savingChar || pendingChar === selected.key}
            style={{
              padding: "10px 24px",
              fontSize: "15px",
              fontWeight: "600",
              backgroundColor: COLORS.success,
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: savingChar ? "not-allowed" : "pointer",
              opacity: savingChar ? 0.7 : 1,
            }}
          >
            {savingChar ? "Saving..." : "Save Character"}
          </button>
          {charMsg && (
            <p
              style={{
                marginTop: "8px",
                fontSize: "13px",
                color: charMsg.ok ? COLORS.success : COLORS.danger,
              }}
            >
              {charMsg.text}
            </p>
          )}
        </section>
      </main>
    </div>
  );
};

export default Settings;
