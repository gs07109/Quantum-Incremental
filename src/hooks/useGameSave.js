export default function useGameSave(game, setGame) {
  const KEY = "quantum_save_v1";

  function saveGame() {
    try {
      const payload = JSON.stringify(game);
      localStorage.setItem(KEY, btoa(unescape(encodeURIComponent(payload))));
      return true;
    } catch (e) {
      console.error("save failed", e);
      return false;
    }
  }

  function loadGame() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return false;
      const parsed = JSON.parse(decodeURIComponent(escape(atob(raw))));
      setGame((prev) => ({ ...prev, ...parsed }));
      return true;
    } catch (e) {
      console.error("load failed", e);
      return false;
    }
  }

  function exportString() {
    try {
      return btoa(unescape(encodeURIComponent(JSON.stringify(game))));
    } catch (e) {
      console.error(e);
      return "";
    }
  }

  function importString(str) {
    try {
      const parsed = JSON.parse(decodeURIComponent(escape(atob(str))));
      setGame((prev) => ({ ...prev, ...parsed }));
      return true;
    } catch (e) {
      console.error("import failed", e);
      return false;
    }
  }

  return { saveGame, loadGame, exportString, importString };
}
