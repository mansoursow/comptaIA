import React from "react";
import ReactDOM from "react-dom/client";

const App = () => {
  return <h1>Hello AccounTech 👋</h1>;
};

const root = document.getElementById("root");

if (root) {
  ReactDOM.createRoot(root).render(<App />);
}
