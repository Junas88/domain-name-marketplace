import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Import the admin fix script that handles path issues
import "./admin-fix";

createRoot(document.getElementById("root")!).render(<App />);
