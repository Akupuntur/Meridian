import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import HomePage from "@/pages/HomePage";
import MeridianDetailPage from "@/pages/MeridianDetailPage";

// Only apply the GitHub Pages sub-path basename when the site is actually
// being served under it. On the Emergent preview and any root-served host
// (localhost, custom domain), keep basename at "/".
const configuredBase = process.env.PUBLIC_URL || "";
const routerBasename =
  configuredBase &&
  typeof window !== "undefined" &&
  window.location.pathname.startsWith(configuredBase)
    ? configuredBase
    : "/";

function App() {
  return (
    <div className="App">
      <BrowserRouter basename={routerBasename}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/meridian/:code" element={<MeridianDetailPage />} />
        </Routes>
      </BrowserRouter>
      <Toaster
        position="bottom-center"
        richColors
        closeButton
        theme="light"
        toastOptions={{
          style: {
            fontFamily: "Outfit, sans-serif",
          },
        }}
      />
    </div>
  );
}

export default App;
