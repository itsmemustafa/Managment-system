export default function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }
  