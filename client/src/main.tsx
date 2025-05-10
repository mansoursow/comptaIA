import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

document.title = "CompFinance - Gestion financière";

const meta = document.createElement('meta');
meta.name = "description";
meta.content = "CompFinance - Solution de gestion financière pour les entreprises et leurs comptables";
document.head.appendChild(meta);

createRoot(document.getElementById("root")!).render(<App />);
