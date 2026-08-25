import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import HomePage from "@/pages/HomePage";
import MeridianDetailPage from "@/pages/MeridianDetailPage";

function App() {
  return (
    <div className="App">
      <BrowserRouter basename={process.env.PUBLIC_URL || "/"}>
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
