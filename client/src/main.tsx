import "./lib/demoApi"; // MUST be first: patches window.fetch before any /api call
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
