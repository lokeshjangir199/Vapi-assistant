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
    error,
    init,
    start,
    stop,
    release,
  } = usePorcupine();

  const [childName, setChildName] = useState("");
  const [additionalInstructions, setAdditionalInstructions] = useState("");
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [wakeWordDetected, setWakeWordDetected] = useState(false);

  const porcupineKeyword = {
    publicPath: "assets/Hi-Eva.ppn",
    label: "Hi Eva",
  };

  const porcupineModel = {
    publicPath: "assets/porcupine_params.pv",
  };

  useEffect(() => {
    if (isFormSubmitted) {
      init("eGdFvgWbfEjISTLCKKHQza1K4Kf++vp+hHnu3PlC3ZMb+hktuvwO/g==", porcupineKeyword, porcupineModel).then(() => {
        start();
      });
    }
    return () => release();
  }, [init, start, release, isFormSubmitted]);

  useEffect(() => {
    if (isFormSubmitted) {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/gh/VapiAI/html-script-tag@latest/dist/assets/index.js";
      script.async = true;
      script.defer = true;

      script.onload = () => {
        window.vapiSDK.run({
          apiKey: "e463809f-6553-401c-a53d-ffcad427aaa1",
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
        });
      };

      document.body.appendChild(script);
    }
  }, [isFormSubmitted, additionalInstructions, childName]);

  useEffect(() => {
    if (keywordDetection && isFormSubmitted) {
      console.log("Wake word detected:", keywordDetection.label);
      setWakeWordDetected(true);
      
      // Programmatically click the Vapi support button when wake word is detected
      const supportButton = document.getElementById('vapi-support-btn');
      if (supportButton) {
        supportButton.click();
      }
    }
  }, [keywordDetection, isFormSubmitted]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const nameInput = document.getElementById("child-name");
    const instructionsInput = document.getElementById("additional-instructions");
    setChildName(nameInput.value.trim());
    setAdditionalInstructions(instructionsInput.value.trim());
    setIsFormSubmitted(true);
  };

  if (error) {
    return <div>Error initializing Porcupine: {error.message}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 flex justify-center items-center">
      <div className="max-w-lg w-full bg-white p-8 rounded-xl shadow-xl transition-all duration-500 hover:scale-105">
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
              <p className="text-gray-700">Listening: <span className={`font-semibold ${isListening ? 'text-green-600' : 'text-red-600'}`}>{isListening ? "Active" : "Inactive"}</span></p>
              <p className="text-gray-700">Wake Word Detection: <span className={`font-semibold ${wakeWordDetected ? 'text-green-600' : 'text-yellow-600'}`}>{wakeWordDetected ? "Detected! Vapi is ready." : "Waiting for 'Hi Eva'..."}</span></p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceWidget;