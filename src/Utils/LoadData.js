export default function loadData(key) {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : null;
  }
  