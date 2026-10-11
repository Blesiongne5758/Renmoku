import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "./i18n/config";
import App from "./App.tsx";

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered:', registration);
      })
      .catch((error) => {
        console.log('SW registration failed:', error);
      });
  });
}

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
