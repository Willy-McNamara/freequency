import "./index.css";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import App from "./App";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element not found");
}

ReactDOM.createRoot(root).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={<div>Feed</div>} />
        <Route path="/practice" element={<div>Practice</div>} />
        <Route path="/taskLibrary" element={<div>Task Library</div>} />
        <Route path="/growth" element={<div>Growth / Stats</div>} />
        <Route path="/profile" element={<div>Profile</div>} />
      </Route>
    </Routes>
  </BrowserRouter>
);
