import React, { useState } from "react";
import DraggableCard from "./draggablecard";
import { createStudySet } from '../api';

/* Component: Create a New Learning Set */
export default function CreateSet({ onSave, t }) {
  const [numCards, setNumCards] = useState(1);  // Default to 1 card
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [alwaysAddOne, setAlwaysAddOne] = useState(false); // Checkbox state
  const [showCardDropdown, setShowCardDropdown] = useState(false); // Toggle dropdown
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState(""); // user input
  const [aiNumTerms, setAiNumTerms] = useState(10);  // default 10 terms
  const [isGenerating, setIsGenerating] = useState(false);
  const [termLanguage, setTermLanguage] = useState("English");
  const [definitionLanguage, setDefinitionLanguage] = useState("English");

  const [terms, setTerms] = useState([
    { id: 1, term: "", definition: "" },
    { id: 2, term: "", definition: "" },
    { id: 3, term: "", definition: "" },
  ]);
  const [errorMessage, setErrorMessage] = useState(""); // New state for error message

  const moveCard = (dragIndex, hoverIndex) => {
    const updatedTerms = [...terms];
    const [removed] = updatedTerms.splice(dragIndex, 1);
    updatedTerms.splice(hoverIndex, 0, removed);
    setTerms(updatedTerms.map((t, i) => ({ ...t, id: i + 1 }))); // Renumber blocks
  };

  const addCard = (count = 1) => {
    if (alwaysAddOne) count = 1;
    const newCards = Array.from({ length: count }, (_, i) => ({
      id: terms.length + i + 1,
      term: "",
      definition: ""
    }));
    setTerms([...terms, ...newCards]);
  };

  const removeCard = (index) => {
    setTerms(terms.filter((_, i) => i !== index).map((t, i) => ({ ...t, id: i + 1 })));
  };

  const handleSave = async () => {
    const usedTerms = terms.filter((t) => t.term.trim() !== "");
    if (usedTerms.length === 0) {
      setErrorMessage(t.need1term);
      return;
    }
    setErrorMessage(""); // Clear error message if valid

    if (title.trim() !== "") {
      const newStudySet = {
        username: localStorage.getItem('username'),  // ✅ correct field name
        title,
        description,
        terms: usedTerms,
        isPrivate: "Private",
      };

      try {
        const savedSet = await createStudySet(newStudySet);
        onSave(savedSet);
      } catch (error) {
        console.error("Failed to save study set:", error);
      }
    }
  };

  return (
    <div className="w-full max-w-[750px] ">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-[#00e0ff] drop-shadow-[0_0_8px_#00e0ff]">
          {t.createnewset}
        </h1>
        <div className="p-[2px] rounded-full bg-gradient-to-r from-pink-500 via-yellow-500 to-blue-500 shadow-[0_0_16px_#ff00ff]">
          <button
            onClick={() => setShowAiModal(true)}
            className="w-full px-6 py-2 rounded-full font-bold bg-black text-yellow-500 transition duration-500
            hover:bg-gradient-to-r hover:from-pink-500 hover:via-yellow-500 hover:to-blue-500 hover:text-white hover:scale-110"
          >
            {t.askai} ✨
          </button>
        </div>
      </div>

      <input
        type="text"
        placeholder={t.entertitle}
        className="bg-black text-[#ff7700] placeholder-white px-4 py-2 rounded-lg w-full mb-4 border border-[#00e0ff] shadow-[0_0_12px_#00e0ff] focus:outline-none focus:ring-2 focus:ring-[#00e0ff]"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        placeholder={t.enterdescription}
        className="bg-black text-[#00e0ff] placeholder-white px-4 py-2 rounded-lg w-full mb-4 border border-[#00e0ff] shadow-[0_0_12px_#00e0ff] focus:outline-none focus:ring-2 focus:ring-[#00e0ff]"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      {errorMessage && (
        <p className="text-[#ff7700] text-lg font-semibold text-center mb-4 animate-pulse-glow">
          {errorMessage}
        </p>
      )}

      {/* Neon Orange Create Button */}
      <div className="flex justify-center mb-6">
        <button
          onClick={handleSave}
          className="bg-black text-[#ff7700] border border-[#ff7700] px-6 py-2 rounded-lg transition duration-300 hover:bg-[#ff7700] hover:text-black hover:scale-105 shadow-[0_0_12px_#ff7700]"
        >
          {t.createbtn}
        </button>
      </div>

      {terms.map((item, index) => (
        <DraggableCard
          t={t}
          key={index}
          index={index}
          id={item.id}
          term={item.term}
          definition={item.definition}
          moveCard={moveCard}
          onDelete={() => removeCard(index)}
          onTermChange={(value) =>
            setTerms(terms.map((t, i) => (i === index ? { ...t, term: value } : t)))
          }
          onDefinitionChange={(value) =>
            setTerms(terms.map((t, i) => (i === index ? { ...t, definition: value } : t)))
          }
        />
      ))}

      <div className="flex flex-col items-center gap-2">
        <div className="relative w-full flex flex-col items-center">
          {/* Add More Card Button */}
          <button
            onClick={() => {
              if (alwaysAddOne) {
                addCard(1);
              } else {
                setShowCardDropdown(!showCardDropdown);
              }
            }}
            className="bg-black text-[#00e0ff] border border-[#00e0ff] px-6 py-2 rounded-lg w-full shadow-[0_0_12px_#00e0ff] hover:bg-[#00e0ff] hover:text-black transition duration-300 flex items-center justify-center relative"
          >
            <span className="font-semibold">{t.addcard}</span>
            {!alwaysAddOne && (
              <span className="absolute right-4 text-xl font-bold">▼</span>
            )}
          </button>

          {/* Dropdown Appears Inside Button */}
          {!alwaysAddOne && showCardDropdown && (
            <div className="absolute bottom-full mb-1 w-full bg-black text-[#00e0ff] border border-[#00e0ff] rounded-lg shadow-[0_0_12px_#00e0ff] z-10">
              {[1, 2, 3, 4, 5].map((num) => (
                <div
                  key={num}
                  className="px-4 py-2 hover:bg-[#00e0ff] hover:text-black cursor-pointer text-center transition duration-200"
                  onClick={() => {
                    setNumCards(num);
                    setShowCardDropdown(false);
                    addCard(num);
                  }}
                >
                  {num} {num === 1 ? t.card : t.cards}
                </div>
              ))}
            </div>
          )}

          {/* Checkbox for "Always add 1 card" */}
          <label className="flex items-center text-sm mt-2 cursor-pointer text-[#ff7700]">
            <input
              type="checkbox"
              checked={alwaysAddOne}
              onChange={() => setAlwaysAddOne(!alwaysAddOne)}
              className="mr-2 w-5 h-5 rounded border-2 border-[#ff7700] bg-black appearance-none checked:bg-[#ff7700] checked:shadow-[0_0_10px_#ff7700] focus:ring-0 focus:outline-none transition duration-300"
            />
            {t.alway1card}
          </label>

        </div>
      </div>
      {showAiModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          {/* Rainbow Border around the Modal */}
          <div className="relative p-[3px] rounded-lg bg-gradient-to-r from-pink-500 via-yellow-500 to-blue-500 shadow-[0_0_20px_#ff00ff] w-[450px]">
            <div className="bg-black p-6 rounded-lg text-white w-full h-full">

              {/* Close Button */}
              <button
                className="absolute top-2 right-2 text-[#ff7700] text-xl hover:scale-110 transition"
                onClick={() => setShowAiModal(false)}
              >
                ✖
              </button>

              {/* Title */}
              <h2 className="text-2xl font-bold mb-4 text-white drop-shadow-[0_0_8px_white]">{t.aicreate}</h2>

              {/* Topic Input */}
              <label className="block mb-2 text-[#00e0ff]">{t.topic}</label>
              <input
                type="text"
                placeholder={t.topiceg}
                className="bg-black text-[#ff7700] placeholder-white px-4 py-2 rounded-lg w-full mb-4 border border-[#00e0ff] shadow-[0_0_12px_#00e0ff] focus:outline-none focus:ring-2 focus:ring-[#00e0ff]"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
              />

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex flex-col">
                  <label className="mb-2 text-[#00e0ff]">{t.termlanguage}</label>
                  <select
                    value={termLanguage}
                    onChange={(e) => setTermLanguage(e.target.value)}
                    className="bg-black text-[#ff7700] px-4 py-2 rounded-lg border border-[#00e0ff] shadow-[0_0_8px_#00e0ff] focus:outline-none focus:ring-2 focus:ring-[#00e0ff] hover:bg-[#00e0ff] hover:text-black transition duration-300 text-center w-full"
                  >
                    <option value="English" className="bg-black text-[#00e0ff]">English</option>
                    <option value="Vietnamese" className="bg-black text-[#00e0ff]">Tiếng Việt</option>
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="mb-2 text-[#00e0ff]">{t.deflanguage}</label>
                  <select
                    value={definitionLanguage}
                    onChange={(e) => setDefinitionLanguage(e.target.value)}
                    className="bg-black text-[#ff7700] px-4 py-2 rounded-lg border border-[#00e0ff] shadow-[0_0_8px_#00e0ff] focus:outline-none focus:ring-2 focus:ring-[#00e0ff] hover:bg-[#00e0ff] hover:text-black transition duration-300 text-center w-full"
                  >
                    <option value="English" className="bg-black text-[#00e0ff]">English</option>
                    <option value="Vietnamese" className="bg-black text-[#00e0ff]">Tiếng Việt</option>
                  </select>
                </div>
              </div>
              {/* Generate Button */}
              <div className="flex flex-col gap-4 items-center mt-2">
                <div className="flex flex-col">
                  <label className="mb-2 text-[#00e0ff]">{t.numterm}</label>
                  <select
                    value={aiNumTerms}
                    onChange={(e) => setAiNumTerms(e.target.value)}
                    className="bg-black text-[#ff7700] px-4 py-2 rounded-lg border border-[#00e0ff] 
                                           shadow-[0_0_8px_#00e0ff] focus:outline-none focus:ring-2 focus:ring-[#00e0ff] 
                                           hover:bg-[#00e0ff] hover:text-black transition duration-300 text-center w-full"
                  >
                    {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
                      <option key={num} value={num} className="bg-black text-[#00e0ff]">
                        {num}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="p-[2px] rounded-full bg-gradient-to-r from-pink-500 via-yellow-500 to-blue-500 shadow-[0_0_16px_#ff00ff] w-full max-w-[200px]">
                  <button
                    onClick={async () => {
                      setIsGenerating(true);
                      try {
                        const response = await fetch('http://localhost:5001/api/ai', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            topic: aiPrompt,
                            numTerms: aiNumTerms,
                            termLanguage,
                            definitionLanguage,
                          }),
                        });

                        const data = await response.json();

                        if (response.ok) {
                          console.log("Generated terms:", data.terms || data.studySet);
                          setTerms((data.terms || data.studySet).map((item, index) => ({
                            id: index + 1,
                            term: item.term,
                            definition: item.definition,
                          })));
                          setTitle(aiPrompt);
                          setShowAiModal(false);
                        } else {
                          console.error("Error generating set:", data.error);
                        }
                      } catch (err) {
                        console.error("Failed to call AI API:", err);
                      } finally {
                        setIsGenerating(false);
                      }
                    }}
                    disabled={isGenerating}
                    className={`w-full px-6 py-2 rounded-full font-bold bg-black text-yellow-500 transition duration-500
                                          ${isGenerating ? "" : "hover:bg-gradient-to-r hover:from-pink-500 hover:via-yellow-500 hover:to-blue-500 hover:text-white hover:scale-110"}`}
                  >
                    {isGenerating ? (
                      <div className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-[#ff7700]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"></path>
                        </svg>
                        <span>{t.genwait}</span>
                      </div>
                    ) : (
                      t.generatebtn
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}