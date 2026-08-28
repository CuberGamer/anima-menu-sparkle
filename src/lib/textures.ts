import texParchment from "@/assets/tex-parchment.png";
import texPanel from "@/assets/tex-panel.jpg";
import texGold from "@/assets/tex-gold.jpg";
import btnFrame from "@/assets/btn-frame.png.asset.json";
import btnFrameGold from "@/assets/btn-frame-gold.png.asset.json";
import panelWood from "@/assets/panel-wood.png.asset.json";
import cardParchment from "@/assets/card-parchment.png.asset.json";
import keycap from "@/assets/keycap.png.asset.json";
import playerWalk from "@/assets/player-walk.png";

export const GAME_TEXTURE_VARS = {
  "--tex-parchment": `url(${texParchment})`,
  "--tex-panel": `url(${texPanel})`,
  "--tex-gold": `url(${texGold})`,
  "--tex-btn": `url(${btnFrame.url})`,
  "--tex-btn-gold": `url(${btnFrameGold.url})`,
  "--tex-panel-wood": `url(${panelWood.url})`,
  "--tex-card": `url(${cardParchment.url})`,
  "--tex-key": `url(${keycap.url})`,
  "--tex-player": `url(${playerWalk})`,
} as React.CSSProperties;

