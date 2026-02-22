import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRive } from "@rive-app/react-canvas";
import Header from "./Header";
import { COLORS, ROUTES } from "../constants";
import {
  useCharacter,
  CHARACTERS,
  type Character,
  type CharacterKey,
} from "../context/CharacterContext";

// Preview card with live Rive animation
const CharacterCard: React.FC<{
  character: Character;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ character, isSelected, onSelect }) => {
  const { RiveComponent } = useRive({
    src: character.file,
    autoplay: true,
  });

  return (
    <div
      onClick={onSelect}
      style={{
        flex: "1 1 220px",
        maxWidth: "260px",
        border: `3px solid ${isSelected ? COLORS.secondary : COLORS.border}`,
        borderRadius: "16px",
        padding: "20px",
        backgroundColor: isSelected ? "#eaf4fd" : "white",
        cursor: "pointer",
        boxShadow: isSelected
          ? `0 6px 20px rgba(52,152,219,0.25)`
          : "0 2px 8px rgba(0,0,0,0.07)",
        transition: "all 0.2s",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "12px",
      }}
    >
      {/* Rive animation */}
      <div
        style={{
          width: "180px",
          height: "180px",
          borderRadius: "12px",
          overflow: "hidden",
          backgroundColor: COLORS.light,
        }}
      >
        <RiveComponent style={{ width: "100%", height: "100%" }} />
      </div>

      <div style={{ textAlign: "center" }}>
        <div
          style={{ fontSize: "22px", fontWeight: "700", color: COLORS.primary }}
        >
          {character.emoji} {character.name}
        </div>
        <div
          style={{ fontSize: "13px", color: COLORS.muted, marginTop: "6px" }}
        >
          {character.description}
        </div>
      </div>

      {/* Selected badge */}
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

const ChooseCharacter: React.FC = () => {
  const { selected, setCharacter } = useCharacter();
  const [pending, setPending] = useState<CharacterKey>(selected.key);
  const navigate = useNavigate();

  const handleConfirm = async () => {
    await setCharacter(pending);
    navigate(ROUTES.CHAT);
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: COLORS.light }}>
      <Header />
      <main style={{ padding: "40px" }}>
        <h2
          style={{
            color: COLORS.primary,
            marginBottom: "8px",
            fontSize: "26px",
          }}
        >
          🎭 Choose Your Character
        </h2>
        <p
          style={{
            color: COLORS.muted,
            marginBottom: "36px",
            fontSize: "15px",
          }}
        >
          Pick a companion — they'll appear in your Chat and other activities.
        </p>

        {/* Character cards */}
        <div
          style={{
            display: "flex",
            gap: "24px",
            flexWrap: "wrap",
            marginBottom: "40px",
          }}
        >
          {CHARACTERS.map((character) => (
            <CharacterCard
              key={character.key}
              character={character}
              isSelected={pending === character.key}
              onSelect={() => setPending(character.key)}
            />
          ))}
        </div>

        {/* Confirm button */}
        <button
          onClick={handleConfirm}
          style={{
            padding: "14px 36px",
            fontSize: "16px",
            fontWeight: "600",
            backgroundColor: COLORS.success,
            color: "white",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            transition: "background-color 0.2s",
          }}
        >
          Confirm & Go to Chat →
        </button>
      </main>
    </div>
  );
};

export default ChooseCharacter;
