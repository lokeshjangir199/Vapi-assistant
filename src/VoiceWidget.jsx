// import React, { useEffect, useState } from "react";
// import { usePorcupine } from "@picovoice/porcupine-react";


// const VoiceWidget = () => {
//   const {
//     keywordDetection,
//     isLoaded,
//     isListening,
//     error,
//     init,
//     start,
//     stop,
//     release,
//   } = usePorcupine();

//   const [childName, setChildName] = useState("");
//   const [additionalInstructions, setAdditionalInstructions] = useState("");
//   const [vapiInstance, setVapiInstance] = useState(null);
//   const [wakeWordDetected, setWakeWordDetected] = useState(false);
//   const [isFormSubmitted, setIsFormSubmitted] = useState(false);

//   const porcupineKeyword = {
//     publicPath: "assets/Hi-Eva.ppn",
//     label: "Hi Eva",
//   };

//   const porcupineModel = {
//     publicPath: "assets/porcupine_params.pv",
//   };

//   useEffect(() => {
//     if (isFormSubmitted) {
//       init("JrszSE+vOtwSWMaswF6roMnOImlxHD7jnLdmWqYsNLT2mKkthvRWUA==", porcupineKeyword, porcupineModel).then(() => {
//         start();
//       });
//     }
//     return () => release();
//   }, [init, start, release, isFormSubmitted]);

//   useEffect(() => {
//     if (keywordDetection && isFormSubmitted) {
//       console.log("Wake word detected:", keywordDetection.label);
//       setWakeWordDetected(true);
//       initializeVapi(); // Directly initialize Vapi when wake word is detected
//     }
//   }, [keywordDetection, isFormSubmitted]);

//   const initializeVapi = () => {
//     const script = document.createElement("script");
// script.src = "https://cdn.jsdelivr.net/gh/VapiAI/html-script-tag@latest/dist/assets/index.js";
// script.async = true;
// script.defer = true;

// script.onload = () => {
//   const instance = window.vapiSDK.run({
//     apiKey: "a5ebab87-088e-4426-8de2-a3ff4a684659",
//     assistant: {
//       model: {
//         provider: "openai",
//         model: "gpt-3.5-turbo",
//         systemPrompt: `You're a versatile AI assistant named Vapi who is fun to talk with. 
//                       Please detect any toxic word and inappropriate language in your input. On detection, please respond that you can't comply with the request. Also, make sure your responses don't include any toxic or inappropriate words from a child perspective.

//                       Important instructions from parents: ${additionalInstructions}`,
//       },
//       voice: {
//         provider: "cartesia",
//         voiceId: "2ee87190-8f84-4925-97da-e52547f9462c",
//       },
//       firstMessage: `Hi ${childName || "there"}! I am Eva! How can I assist you today?`,
//     },
//     config: {},
//   });

//   setVapiInstance(instance);

//   // Automatically click the vapi-support-btn button once the script is loaded and the instance is initialized
//   const supportButton = document.getElementById('vapi-support-btn');
//   if (supportButton) {
//     supportButton.click(); // Simulate the click
//   }
// };

// document.body.appendChild(script);

//   };

//   const handleFormSubmit = (e) => {
//     e.preventDefault();
//     const nameInput = document.getElementById("child-name");
//     const instructionsInput = document.getElementById("additional-instructions");
//     setChildName(nameInput.value.trim());
//     setAdditionalInstructions(instructionsInput.value.trim());
//     setIsFormSubmitted(true);
//   };

//   if (error) {
//     return <div>Error initializing Porcupine: {error.message}</div>;
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 flex justify-center items-center">
//       <div className="max-w-lg w-full bg-white p-8 rounded-xl shadow-xl transition-all duration-500 hover:scale-105">
//         {!isFormSubmitted ? (
//           <section id="input-form" className="space-y-8">
//             <h2 className="text-3xl font-bold text-center text-gray-900">Input Details</h2>
//             <form id="child-input-form" onSubmit={handleFormSubmit} className="space-y-6">
//               <div className="space-y-2">
//                 <label htmlFor="child-name" className="text-lg font-medium text-gray-700">Child Name:</label>
//                 <input
//                   type="text"
//                   id="child-name"
//                   name="child-name"
//                   required
//                   className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition duration-300"
//                 />
//               </div>

//               <div className="space-y-2">
//                 <label htmlFor="age" className="text-lg font-medium text-gray-700">Age:</label>
//                 <input
//                   type="number"
//                   id="age"
//                   name="age"
//                   min="1"
//                   required
//                   className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition duration-300"
//                 />
//               </div>

//               <div className="space-y-2">
//                 <label htmlFor="gender" className="text-lg font-medium text-gray-700">Gender:</label>
//                 <select
//                   id="gender"
//                   name="gender"
//                   required
//                   className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition duration-300"
//                 >
//                   <option value="male">Male</option>
//                   <option value="female">Female</option>
//                   <option value="other">Other</option>
//                 </select>
//               </div>

//               <div className="space-y-2">
//                 <label htmlFor="additional-instructions" className="text-lg font-medium text-gray-700">
//                   Additional Instructions by Parents:
//                 </label>
//                 <textarea
//                   id="additional-instructions"
//                   name="additional-instructions"
//                   rows="4"
//                   placeholder="Enter any specific instructions..."
//                   className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition duration-300"
//                 ></textarea>
//               </div>

//               <button
//                 type="submit"
//                 className="w-full py-3 bg-indigo-600 text-white text-lg font-semibold rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 transition duration-300"
//               >
//                 Start Voice Assistant
//               </button>
//             </form>
//           </section>
//         ) : (
//           <div className="space-y-4">
//             <h1 className="text-2xl font-bold text-center text-gray-900">Voice Assistant Status</h1>
//             <div className="space-y-2 text-lg">
//               <p className="text-gray-700">Listening: <span className={`font-semibold ${isListening ? 'text-green-600' : 'text-red-600'}`}>{isListening ? "Active" : "Inactive"}</span></p>
//               <p className="text-gray-700">Wake Word Detection: <span className={`font-semibold ${wakeWordDetected ? 'text-green-600' : 'text-yellow-600'}`}>{wakeWordDetected ? "Detected! Vapi is ready." : "Waiting for 'Hi Eva'..."}</span></p>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default VoiceWidget;

import React, { useEffect, useState } from "react";
import { usePorcupine } from "@picovoice/porcupine-react";

const VoiceWidget = () => {
  const {
    keywordDetection,
    isLoaded,
    isListening,
    error: porcupineError,
    init,
    start,
    stop,
    release,
  } = usePorcupine();

  const [childName, setChildName] = useState("");
  const [additionalInstructions, setAdditionalInstructions] = useState("");
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [wakeWordDetected, setWakeWordDetected] = useState(false);
  const [vapiInstance, setVapiInstance] = useState(null);
  const [isVapiLoaded, setIsVapiLoaded] = useState(false);
  const [vapiError, setVapiError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [micPermission, setMicPermission] = useState(null);
  const maxRetries = 3;

  const porcupineKeyword = {
    publicPath: "assets/Hi-Eva.ppn",
    label: "Hi Eva",
  };

  const porcupineModel = {
    publicPath: "assets/porcupine_params.pv",
  };

  // Request microphone permission
  useEffect(() => {
    if (isFormSubmitted) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          setMicPermission("granted");
          stream.getTracks().forEach((track) => track.stop()); // Stop stream after permission check
          console.log("Microphone permission granted");
        })
        .catch((err) => {
          setMicPermission("denied");
          setVapiError("Microphone permission denied: " + err.message);
          console.error("Microphone permission error:", err);
        });
    }
  }, [isFormSubmitted]);

  // Initialize Porcupine
  useEffect(() => {
    if (isFormSubmitted && micPermission === "granted") {
      init(
        "eGdFvgWbfEjISTLCKKHQza1K4Kf++vp+hHnu3PlC3ZMb+hktuvwO/g==",
        porcupineKeyword,
        porcupineModel
      )
        .then(() => {
          start();
          console.log("Porcupine initialized and started");
        })
        .catch((err) => {
          console.error("Porcupine init failed:", err);
          setVapiError("Failed to initialize Porcupine: " + err.message);
        });
    }
    return () => {
      release();
      console.log("Porcupine released");
    };
  }, [init, start, release, isFormSubmitted, micPermission]);

  // Initialize Vapi SDK with retry logic
  useEffect(() => {
    if (isFormSubmitted && micPermission === "granted" && retryCount <= maxRetries) {
      const script = document.createElement("script");
      script.src =
        "https://cdn.jsdelivr.net/gh/VapiAI/html-script-tag@latest/dist/assets/index.js";
      script.async = true;
      script.defer = true;

      script.onload = () => {
        console.log("Vapi SDK script loaded");
        try {
          const vapi = window.vapiSDK.run({
            apiKey: "e463809f-6553-401c-a53d-ffcad427aaa1",
            assistant: {
              model: {
                provider: "openai",
                model: "gpt-3.5-turbo",
                systemPrompt: `You're a versatile AI assistant named Eva with a personality of a cat who is fun to talk with. 
                Make sure to follow these instructions while replying: ${additionalInstructions}`,
              },
              voice: {
                provider: "cartesia",
                voiceId: "2ee87190-8f84-4925-97da-e52547f9462c",
              },
              firstMessage: `Hi ${childName || "there"}! I am Eva! How can I assist you today?`,
            },
            config: {},
          });
          vapi.on("error", (error) => {
            console.error("Vapi SDK error:", error);
            setVapiError(`Vapi error: ${error.errorMsg || error.message || "Unknown error"}`);
            if (error.errorMsg === "Meeting has ended" && retryCount < maxRetries) {
              setRetryCount((prev) => prev + 1);
              console.log(`Retrying Vapi initialization (attempt ${retryCount + 1})`);
            }
          });
          setVapiInstance(vapi);
          setIsVapiLoaded(true);
          setVapiError(null);
          console.log("Vapi SDK initialized successfully");
        } catch (err) {
          console.error("Vapi SDK initialization failed:", err);
          setVapiError("Failed to initialize Vapi: " + err.message);
          if (retryCount < maxRetries) {
            setRetryCount((prev) => prev + 1);
            console.log(`Retrying Vapi initialization (attempt ${retryCount + 1})`);
          }
        }
      };

      script.onerror = () => {
        console.error("Failed to load Vapi SDK script");
        setVapiError("Failed to load Vapi SDK script");
        if (retryCount < maxRetries) {
          setRetryCount((prev) => prev + 1);
          console.log(`Retrying Vapi script load (attempt ${retryCount + 1})`);
        }
      };

      document.body.appendChild(script);
    }
  }, [isFormSubmitted, additionalInstructions, childName, retryCount, micPermission]);

  // Handle wake word detection
  useEffect(() => {
    if (keywordDetection && isFormSubmitted && vapiInstance && isVapiLoaded) {
      console.log("Wake word detected:", keywordDetection.label);
      setWakeWordDetected(true);
      try {
        vapiInstance.start();
        console.log("Vapi assistant started via wake word");
      } catch (err) {
        console.error("Failed to start Vapi assistant:", err);
        setVapiError("Failed to start Vapi: " + err.message);
      }
    }
  }, [keywordDetection, isFormSubmitted, vapiInstance, isVapiLoaded]);

  // Expose function to Android WebView
  useEffect(() => {
    if (isFormSubmitted && vapiInstance && isVapiLoaded) {
      window.startVapiAssistant = () => {
        try {
          vapiInstance.start();
          setWakeWordDetected(true);
          console.log("Vapi assistant started via window.startVapiAssistant");
          return "Assistant started";
        } catch (err) {
          console.error("Failed to start Vapi assistant from Android:", err);
          setVapiError("Failed to start Vapi from Android: " + err.message);
          return "Failed to start assistant";
        }
      };
    }
    return () => {
      delete window.startVapiAssistant;
      console.log("Cleaned up window.startVapiAssistant");
    };
  }, [vapiInstance, isFormSubmitted, isVapiLoaded]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const nameInput = document.getElementById("child-name");
    const instructionsInput = document.getElementById("additional-instructions");
    setChildName(nameInput.value.trim());
    setAdditionalInstructions(instructionsInput.value.trim());
    setIsFormSubmitted(true);
    console.log("Form submitted with name:", nameInput.value.trim());
  };

  if (porcupineError) {
    return <div>Error initializing Porcupine: {porcupineError.message}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 flex justify-center items-center">
      <div className="max-w-lg w-full bg-white p-8 rounded-xl shadow-xl transition-all duration-500 hover:scale-105">
        {!isFormSubmitted ? (
          <section id="input-form" className="space-y-8">
            <h2 className="text-3xl font-bold text-center text-gray-900">
              Input Details
            </h2>
            <form id="child-input-form" onSubmit={handleFormSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="child-name" className="text-lg font-medium text-gray-700">
                  Child Name:
                </label>
                <input
                  type="text"
                  id="child-name"
                  name="child-name"
                  required
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition duration-300"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="age" className="text-lg font-medium text-gray-700">
                  Age:
                </label>
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
                <label htmlFor="gender" className="text-lg font-medium text-gray-700">
                  Gender:
                </label>
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
                <label
                  htmlFor="additional-instructions"
                  className="text-lg font-medium text-gray-700"
                >
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
            <h1 className="text-2xl font-bold text-center text-gray-900">
              Voice Assistant Status
            </h1>
            <div className="space-y-2 text-lg">
              <p className="text-gray-700">
                Microphone Permission:{" "}
                <span
                  className={`font-semibold ${
                    micPermission === "granted" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {micPermission === "granted"
                    ? "Granted"
                    : micPermission === "denied"
                    ? "Denied"
                    : "Pending"}
                </span>
              </p>
              <p className="text-gray-700">
                Listening:{" "}
                <span
                  className={`font-semibold ${
                    isListening ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {isListening ? "Active" : "Inactive"}
                </span>
              </p>
              <p className="text-gray-700">
                Wake Word Detection:{" "}
                <span
                  className={`font-semibold ${
                    wakeWordDetected ? "text-green-600" : "text-yellow-600"
                  }`}
                >
                  {wakeWordDetected
                    ? "Detected! Vapi is ready."
                    : "Waiting for 'Hi Eva'..."}
                </span>
              </p>
              <p className="text-gray-700">
                Vapi SDK Status:{" "}
                <span
                  className={`font-semibold ${
                    isVapiLoaded ? "text-green-600" : "text-yellow-600"
                  }`}
                >
                  {isVapiLoaded ? "Loaded" : "Loading..."}
                </span>
              </p>
              {vapiError && (
                <p className="text-red-600 font-semibold">
                  Error: {vapiError}
                </p>
              )}
              <button
                onClick={() => {
                  try {
                    vapiInstance?.start();
                    console.log("Vapi assistant started manually");
                  } catch (err) {
                    console.error("Manual start failed:", err);
                    setVapiError("Manual start failed: " + err.message);
                  }
                }}
                disabled={!isVapiLoaded || micPermission !== "granted"}
                className={`mt-4 py-2 px-4 rounded-lg text-white ${
                  isVapiLoaded && micPermission === "granted"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                Start Vapi Assistant
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceWidget;