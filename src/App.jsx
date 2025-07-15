import React, { useState, Suspense } from "react";
import './App.css';
const VoiceWidget = React.lazy(() => import("./VoiceWidget.jsx"));
const Synthflow = React.lazy(() => import("./synthflow.jsx"));
const Voiceflow = React.lazy(() => import("./voiceFlow.jsx"));

function App() {
  const [selectedOption, setSelectedOption] = useState("VAPI");

  return (
    <div className="App">
      <div className="dropdown-container">
        <label htmlFor="api-select" className="dropdown-label">Select API:</label>
        <select
          id="api-select"
          className="dropdown"
          value={selectedOption}
          onChange={(e) => setSelectedOption(e.target.value)}
        >
          <option value="VAPI">VAPI</option>
          <option value="Synthflow">Synthflow</option>
          <option value="Voiceflow">Voiceflow</option>
        </select>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        {selectedOption === "VAPI" && <VoiceWidget />}
        {selectedOption === "Synthflow" && <Synthflow />}
        {selectedOption === "Voiceflow" && <Voiceflow />}
      </Suspense>
    </div>
  );
}

export default App;
