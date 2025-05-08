import React, { useState } from "react";
import DraggableCard from "./draggablecard";
import { updateStudySet,getStudySets } from '../api';
export default function EditSet({ studySet, setStudySets, setSelectedSet, onSave, onCancel, t }) {
  const [title, setTitle] = useState(studySet.title);
  const [description, setDescription] = useState(studySet.description);
  const [terms, setTerms] = useState(() =>
    studySet.terms.map((term, i) => ({
      ...term,
      id: i + 1, // 💡 add id here
    }))
  );

  const [errorMessage, setErrorMessage] = useState("");
  const [alwaysAddOne, setAlwaysAddOne] = useState(false); // Checkbox state
  const [showCardDropdown, setShowCardDropdown] = useState(false); // Toggle dropdown
  const [numCards, setNumCards] = useState(1);  // Default to 1 card

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
    const usedTerms = terms.filter((t) => t.term.trim() !== "").map((t, i) => ({
      ...(t._id ? { _id: t._id } : {}), // Keep _id if it exists
      term: t.term,
      definition: t.definition,
    }));

    if (usedTerms.length === 0) {
      setErrorMessage(t.need1term); // You already handle this with errorMessage state
      return;
    }
    setErrorMessage(""); // Clear error message if valid

    const updatedSet = {
      username: studySet.username,
      title,
      description,
      terms: usedTerms,
      isPrivate: studySet.isPrivate,
    };

    try {
      const savedSet = await updateStudySet(studySet._id, updatedSet); // Use the ID for updating
      const username = localStorage.getItem("username");
      const sets = await getStudySets(username); // Reload updated sets
      setStudySets(sets); // Update state with fresh data

      onSave(savedSet); // Call the onSave prop to update the parent component
      setSelectedSet(null); // 🔥 clear selected set so it reloads
    } catch (error) {
      console.error("Failed to update study set:", error);
    }
  };

  return (
    <div className="w-full max-w-[750px] pb-6 ">
      <h1 className="text-2xl font-bold mb-4 text-[#ff7700] drop-shadow-[0_0_8px_#ff7700]">{t.editset}</h1>

      <input
        type="text"
        placeholder={t.entertitle}
        className="bg-black text-[#ff7700] placeholder-[#ff7700] px-4 py-2 rounded-3xl w-full mb-4 border border-[#00e0ff] focus:outline-none focus:ring-2 focus:ring-[#00e0ff]"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        placeholder={t.enterdescription}
        className="bg-black text-white placeholder-white px-4 py-2 rounded-3xl w-full mb-4 border border-[#00e0ff] focus:outline-none focus:ring-2 focus:ring-[#00e0ff]"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      {errorMessage && (
        <p className="text-red drop-shadow-[0_0_8px_red] text-lg font-semibold text-center mb-4 animate-pulse-glow">
          {errorMessage}
        </p>
      )}

      {/* Done Button */}
      <div className="flex justify-center mb-5 ">
        <button
          onClick={handleSave}
          className="bg-black text-[#ff7700] border border-[#ff7700] px-6 py-2 rounded-3xl transition duration-300 hover:bg-[#ff7700] hover:text-black hover:scale-105 shadow-[0_0_12px_#ff7700]"
        >
          {t.donebt}
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
            className="bg-black text-[#00e0ff] border border-[#00e0ff] px-6 py-2 rounded-3xl w-full shadow-[0_0_12px_#00e0ff] hover:bg-[#00e0ff] hover:text-black transition duration-300 flex items-center justify-center relative"
          >
            <span className="font-semibold">{t.addcard}</span>
            {!alwaysAddOne && (
              <span className="absolute right-4 text-xl font-bold">▼</span>
            )}
          </button>

          {/* Dropdown Appears Inside Button */}
          {!alwaysAddOne && showCardDropdown && (
            <div className="absolute top-full mt-1 w-full bg-black text-[#00e0ff] border border-[#00e0ff] rounded-3xl shadow-[0_0_12px_#00e0ff] z-10">
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
    </div>
  );
}
