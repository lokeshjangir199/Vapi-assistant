import React, { useEffect, useState, useRef, memo } from "react";

const VoiceWidget = () => {
  const [childName, setChildName] = useState("");
  const [additionalInstructions, setAdditionalInstructions] = useState("");
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [wakeWordDetected, setWakeWordDetected] = useState(false);
  const [isVapiActive, setIsVapiActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const stateRef = useRef({
    deepgramSocket: null,
    mediaRecorder: null,
    mediaStream: null,
    vapiInstance: null,
    deepgramInitialized: false,
    vapiTimeout: null,
    mounted: true,
  });

  const DEEPGRAM_API_KEY = "6a427939d1686e512b9105e036407c0efac62842"; // Replace with your Deepgram API key

  // Clean up resources
  const cleanupResources = (force = false) => {
    if (!force && !stateRef.current.mounted) {
      console.log("Skipping cleanup due to component unmount");
      return;
    }
    console.log("Cleaning up resources...");
    if (stateRef.current.deepgramSocket && stateRef.current.deepgramSocket.readyState === WebSocket.OPEN) {
      stateRef.current.deepgramSocket.close();
    }
    if (stateRef.current.mediaRecorder && stateRef.current.mediaRecorder.state !== "inactive") {
      stateRef.current.mediaRecorder.stop();
    }
    if (stateRef.current.mediaStream) {
      stateRef.current.mediaStream.getTracks().forEach((track) => track.stop());
    }
    if (stateRef.current.vapiInstance && typeof stateRef.current.vapiInstance.stop === "function" && isVapiActive) {
      console.log("Stopping Vapi instance...");
      stateRef.current.vapiInstance.stop();
    }
    stateRef.current.deepgramInitialized = false;
    if (stateRef.current.vapiTimeout) {
      clearTimeout(stateRef.current.vapiTimeout);
      stateRef.current.vapiTimeout = null;
    }
    stateRef.current.deepgramSocket = null;
    stateRef.current.mediaRecorder = null;
    stateRef.current.mediaStream = null;
    console.log("Resources cleaned up");
  };

  // Initialize Deepgram with retry
  const initializeDeepgram = async (retries = 3, delay = 30000) => {
    if (stateRef.current.deepgramInitialized || isVapiActive) {
      console.log("Deepgram already initialized or Vapi active, skipping");
      return;
    }
    console.log(`Attempting to initialize Deepgram (Retries left: ${retries})`);
    cleanupResources(true);

    try {
      stateRef.current.deepgramSocket = new WebSocket(
        `wss://api.deepgram.com/v1/listen?punctuate=true&language=en`,
        ["token", DEEPGRAM_API_KEY]
      );

      const keepAlive = setInterval(() => {
        if (stateRef.current.deepgramSocket?.readyState === WebSocket.OPEN) {
          stateRef.current.deepgramSocket.send(JSON.stringify({ type: "KeepAlive" }));
          console.log("Sent Deepgram keep-alive ping");
        }
      }, 2000);

      stateRef.current.deepgramSocket.onopen = async () => {
        console.log("Connected to Deepgram");
        try {
          stateRef.current.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stateRef.current.mediaRecorder = new MediaRecorder(stateRef.current.mediaStream, { mimeType: "audio/webm" });

          stateRef.current.mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0 && stateRef.current.deepgramSocket.readyState === WebSocket.OPEN) {
              stateRef.current.deepgramSocket.send(event.data);
            }
          };

          stateRef.current.mediaStream.getAudioTracks().forEach((track) => {
            track.onended = () => {
              console.warn("Microphone track ended unexpectedly");
              setErrorMessage("Microphone stream stopped. Retrying...");
              cleanupResources(true);
              if (isFormSubmitted && !isVapiActive && stateRef.current.mounted) {
                initializeDeepgram(retries - 1, delay);
              }
            };
          });

          stateRef.current.mediaRecorder.start(250);
          stateRef.current.deepgramInitialized = true;
          setErrorMessage(null);
          console.log("Deepgram fully initialized");
        } catch (err) {
          console.error("Mic error for Deepgram:", err);
          setErrorMessage("Microphone error for Deepgram: " + err.message);
          if (retries > 0 && stateRef.current.mounted) {
            console.log(`Retrying Deepgram initialization in ${delay}ms...`);
            setTimeout(() => initializeDeepgram(retries - 1, delay * 2), delay);
          }
        }
      };

      stateRef.current.deepgramSocket.onmessage = (message) => {
        if (isVapiActive) {
          console.log("Ignoring Deepgram message due to active Vapi call");
          return;
        }
        try {
          const data = JSON.parse(message.data);
          const transcript = data.channel?.alternatives?.[0]?.transcript?.toLowerCase();
          if (
            transcript &&
            (transcript.includes("help me") ||
              transcript.includes("hi eva") ||
              transcript.includes("eva") ||
              transcript.includes("hey eva") ||
              transcript.includes("hello eva") ||
              transcript.includes("hello"))
          ) {
            console.log("Wake word detected via Deepgram:", transcript);
            triggerVapi();
            cleanupResources(true);
          }
        } catch (error) {
          console.error("Error processing Deepgram message:", error);
          setErrorMessage("Failed to process Deepgram transcription.");
        }
      };

      stateRef.current.deepgramSocket.onerror = (err) => {
        console.error("Deepgram WebSocket error:", err);
        setErrorMessage("Deepgram WebSocket error. Verify API key or network connection.");
      };

      stateRef.current.deepgramSocket.onclose = (event) => {
        console.log(`Deepgram connection closed with code: ${event.code}, reason: ${event.reason}`);
        clearInterval(keepAlive);
        cleanupResources(true);
        if (isFormSubmitted && !isVapiActive && retries > 0 && stateRef.current.mounted) {
          console.log(`Retrying Deepgram initialization due to WebSocket close in ${delay}ms...`);
          setTimeout(() => initializeDeepgram(retries - 1, delay * 2), delay);
        } else if (!isVapiActive && retries === 0) {
          setErrorMessage("Deepgram failed after retries. Retrying periodically...");
          setTimeout(() => initializeDeepgram(3, 30000), 30000);
        }
      };
    } catch (err) {
      console.error("Deepgram initialization error:", err);
      setErrorMessage("Failed to initialize Deepgram: " + err.message);
      if (retries > 0 && stateRef.current.mounted) {
        console.log(`Retrying Deepgram initialization in ${delay}ms...`);
        setTimeout(() => initializeDeepgram(retries - 1, delay * 2), delay);
      } else {
        setErrorMessage("Failed to initialize Deepgram after retries. Retrying periodically...");
        setTimeout(() => initializeDeepgram(3, 30000), 30000);
      }
    }
  };

  // Deepgram useEffect
  useEffect(() => {
    console.log("Deepgram useEffect triggered");
    stateRef.current.mounted = true;
    if (isFormSubmitted && !isVapiActive) {
      console.log("Starting Deepgram due to form submission and Vapi inactive");
      initializeDeepgram();
    } else {
      console.log("Stopping Deepgram due to Vapi active or form not submitted");
      cleanupResources(true);
    }

    return () => {
      console.log("Cleaning up Deepgram on unmount");
      stateRef.current.mounted = false;
      cleanupResources();
    };
  }, [isFormSubmitted, isVapiActive]);

  // Initialize Vapi
  useEffect(() => {
    console.log("Vapi useEffect triggered");
    if (isFormSubmitted) {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/gh/VapiAI/html-script-tag@latest/dist/assets/index.js";
      script.async = true;
      script.defer = true;

      script.onload = () => {
        console.log("Vapi SDK loaded");
        try {
          stateRef.current.vapiInstance = window.vapiSDK.run({
            apiKey: "0bc888fa-52ba-4b4e-a386-6416fab00490",
            assistant: {
              model: {
                provider: "openai",
                model: "gpt-3.5-turbo",
                systemPrompt: `You're a versatile AI assistant named Eva with a personality of a cat who is fun to talk with. 
                Make sure to follow these instruction while replying: ${additionalInstructions}`,
              },
              voice: {
                provider: "cartesia",
                voiceId: "2ee87190-8f84-4925-97da-e52547f9462c",
              },
              firstMessage: `Hi ${childName || "there"}! I am Eva! How can I assist you today?`,
            },
            config: {},
            onCallEnd: () => {
              console.log("Vapi call ended via onCallEnd");
              cleanupResources(true);
              setIsVapiActive(false);
              setWakeWordDetected(false);
              if (stateRef.current.vapiTimeout) {
                clearTimeout(stateRef.current.vapiTimeout);
                stateRef.current.vapiTimeout = null;
              }
              if (isFormSubmitted) {
                console.log("Restarting Deepgram after Vapi call end with 15s delay");
                setTimeout(() => initializeDeepgram(), 15000);
              }
            },
          });

          stateRef.current.vapiInstance.on("error", (error) => {
            console.error("Vapi SDK error:", error);
            setErrorMessage(`Vapi error: ${error.message || "Unknown error"}`);
            setIsVapiActive(false);
            if (isFormSubmitted) {
              console.log("Restarting Deepgram due to Vapi error with 15s delay");
              setTimeout(() => initializeDeepgram(), 15000);
            }
          });
        } catch (err) {
          console.error("Vapi initialization error:", err);
          setErrorMessage("Failed to initialize Vapi: " + err.message);
          setIsVapiActive(false);
          if (isFormSubmitted) {
            console.log("Restarting Deepgram due to Vapi initialization failure with 15s delay");
            setTimeout(() => initializeDeepgram(), 15000);
          }
        }
      };

      script.onerror = () => {
        console.error("Failed to load Vapi SDK");
        setErrorMessage("Failed to load Vapi SDK. Check network or script URL.");
        setIsVapiActive(false);
        if (isFormSubmitted) {
          console.log("Restarting Deepgram due to Vapi SDK load failure with 15s delay");
          setTimeout(() => initializeDeepgram(), 15000);
        }
      };

      document.body.appendChild(script);
    }

    return () => {
      console.log("Cleaning up Vapi on unmount");
      stateRef.current.mounted = false;
      cleanupResources();
    };
  }, [isFormSubmitted, additionalInstructions, childName]);

  // Trigger Vapi
  const triggerVapi = () => {
    console.log("Triggering Vapi, stopping Deepgram...");
    cleanupResources(true);
    setIsVapiActive(true);
    setWakeWordDetected(true);
    const supportButton = document.getElementById("vapi-support-btn");
    if (supportButton && stateRef.current.vapiInstance) {
      console.log("Clicking Vapi support button");
      supportButton.click();
      stateRef.current.vapiTimeout = setTimeout(() => {
        console.log("Vapi call timeout, forcing cleanup...");
        cleanupResources(true);
        setIsVapiActive(false);
        setWakeWordDetected(false);
        if (isFormSubmitted) {
          console.log("Restarting Deepgram after Vapi timeout with 15s delay");
          setTimeout(() => initializeDeepgram(), 15000);
        }
      }, 30000);
    } else {
      console.warn("Vapi instance or support button not found");
      setErrorMessage("Vapi instance or support button not found. Ensure Vapi SDK is loaded correctly.");
      setIsVapiActive(false);
      if (isFormSubmitted) {
        console.log("Restarting Deepgram due to Vapi trigger failure with 15s delay");
        setTimeout(() => initializeDeepgram(), 15000);
      }
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted");
    const nameInput = document.getElementById("child-name");
    const instructionsInput = document.getElementById("additional-instructions");
    setChildName(nameInput.value.trim());
    setAdditionalInstructions(instructionsInput.value.trim());
    setIsFormSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 flex justify-center items-center">
      <div className="max-w-lg w-full bg-white p-8 rounded-xl shadow-xl transition-all duration-500 hover:scale-105">
        {errorMessage && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {errorMessage}
            <p className="mt-2">
              Note: The Vapi SDK may be outdated. Please check{" "}
              <a href="https://vapi.ai/docs" target="_blank" rel="noopener noreferrer" className="underline">
                Vapi documentation
              </a>{" "}
              for the latest version.
            </p>
          </div>
        )}
        {!isFormSubmitted ? (
          <section id="input-form" className="space-y-8">
            <h2 className="text-3xl font-bold text-center text-gray-900">Input Details</h2>
            <form id="child-input-form" onSubmit={handleFormSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="child-name" className="text-lg font-medium text-gray-700">Child Name:</label>
                <input
                  type="text"
                  id="child-name"
                  name="child-name"
                  required
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition duration-300"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="age" className="text-lg font-medium text-gray-700">Age:</label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  min="1"
                  required
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition duration-300"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="gender" className="text-lg font-medium text-gray-700">Gender:</label>
                <select
                  id="gender"
                  name="gender"
                  required
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition duration-300"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="additional-instructions" className="text-lg font-medium text-gray-700">
                  Additional Instructions by Parents:
                </label>
                <textarea
                  id="additional-instructions"
                  name="additional-instructions"
                  rows="4"
                  placeholder="Enter any specific instructions..."
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition duration-300"
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 text-white text-lg font-semibold rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 transition duration-300"
              >
                Start Voice Assistant
              </button>
            </form>
          </section>
        ) : (
          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-center text-gray-900">Voice Assistant Status</h1>
            <div className="space-y-2 text-lg">
              <p className="text-gray-700">Listening: <span className={`font-semibold ${!isVapiActive ? "text-green-600" : "text-red-600"}`}>{!isVapiActive ? "Active" : "Inactive (Vapi Active)"}</span></p>
              <p className="text-gray-700">Wake Word Detection: <span className={`font-semibold ${wakeWordDetected ? "text-green-600" : "text-yellow-600"}`}>{wakeWordDetected ? "Detected! Vapi is ready." : "Waiting for 'Hi Eva'..."}</span></p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Prevent unnecessary re-renders
const areEqual = (prevProps, nextProps) => {
  console.warn("VoiceWidget re-render check. If frequent, check parent component state or React Strict Mode.");
  return true;
};

export default memo(VoiceWidget, areEqual);