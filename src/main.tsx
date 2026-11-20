import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";
import { FontProvider } from "@/hooks/useFont";
import { SoundProvider } from "@/hooks/useSound";

// Set dark mode as default before React renders
const storedTheme = localStorage.getItem("theme");
if (!storedTheme) {
  document.documentElement.classList.add("dark");
  localStorage.setItem("theme", "dark");
} else {
  document.documentElement.classList.add(storedTheme);
}

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <FontProvider>
      <SoundProvider>
        <App />
      </SoundProvider>
    </FontProvider>
  </HelmetProvider>
);
