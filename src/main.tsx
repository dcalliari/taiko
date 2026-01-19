import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./i18n";
import "./index.css";

// biome-ignore lint/style/noNonNullAssertion: Justified because we are sure that the element with id "root" exists.
createRoot(document.getElementById("root")!).render(<App />);
