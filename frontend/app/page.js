"use client";

import { useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    document.body.style.fontFamily = "Itim, sans-serif";
  }, []);
  const [isMenuCollapsed, setIsMenuCollapsed] = useState(false);
  const [isCreatingSet, setIsCreatingSet] = useState(false);
  const [studySets, setStudySets] = useState([]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-[#3B0B24] text-white flex flex-col">

        {/* Unified Header */}
        <header className="flex justify-between items-center p-4 bg-[#3B0B24] text-white">
          {/* Left: Hamburger & App Name */}
          <div className="flex items-center">
            <button
              className="text-white text-2xl  focus:outline-none w-9 h-9 flex items-center justify-center rounded-full transition duration-300 hover:bg-white hover:text-[#3B0B24]"
              onClick={() => setIsMenuCollapsed(!isMenuCollapsed)}
            >
              ☰
            </button>
            <span className="text-3xl font-bold ml-4" style={{ fontFamily: "'Inknut Antiqua', serif" }}>
              WordCraze
            </span>

          </div>

          {/* Middle: Search Bar */}
          <input
            type="text"
            placeholder="Hinted search text"
            className="bg-[#522136] text-white px-4 py-2 rounded-lg w-1/3"
          />

          {/* Right: Plus Button, Type/Draw Toggle, User Info */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsCreatingSet(true)}
              className="bg-yellow-500 px-4 py-2 rounded-lg"
            >
              +
            </button>
            <button className="bg-[#10B981] px-4 py-2 rounded-lg">Type</button>
            <button className="bg-[#5A2E44] px-4 py-2 rounded-lg">Draw</button>
            <div className="flex items-center gap-2">
              <div className="bg-gray-500 rounded-full w-10 h-10"></div>
              <span>Username</span>
            </div>
          </div>
        </header>

        {/* Main Container with Sidebar & Content */}
        <div className="flex flex-1 relative">
          <RightPanel />
          {/* Side Navigation */}
          <aside className={`bg-[#3B0B24] p-4 transition-all ${isMenuCollapsed ? "w-16" : "w-48"}`}>
            <nav className="flex flex-col gap-4">
              <button onClick={() => setIsCreatingSet(false)} className="flex items-center gap-2 px-2 py-1 rounded-lg transition duration-300 hover:bg-white hover:text-[#3B0B24]">
                🏠 {!isMenuCollapsed && "Home"}
              </button>
              <button onClick={() => setIsCreatingSet("library")} className="flex items-center gap-2 px-2 py-1 rounded-lg transition duration-300 hover:bg-white hover:text-[#3B0B24]">
                📂 {!isMenuCollapsed && "Your Library"}
              </button>
              <hr className="border-[#FFFFFF]" />
              <p className="text-sm">Your folders</p>
              <button className="flex items-center gap-2 px-2 py-1 rounded-lg transition duration-300 hover:bg-white hover:text-[#3B0B24]">
                ➕ {!isMenuCollapsed && "New Folder"}
              </button>
              <hr className="border-[#FFFFFF]" />
              <p className="text-sm">Explore</p>
              <button className="flex items-center gap-2 px-2 py-1 rounded-lg transition duration-300 hover:bg-white hover:text-[#3B0B24]">

                🧩 {!isMenuCollapsed && "CrossWord"}
              </button>
            </nav>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 p-6">
            {isCreatingSet === "library" ? (
              <LibraryContent studySets={studySets} />
            ) : isCreatingSet ? (
              <CreateSet onSave={(newSet) => {
                setStudySets([...studySets, newSet]);
                setIsCreatingSet(false);
              }} />
            ) : (
              <HomeContent studySets={studySets} />
            )}
          </main>
        </div>
      </div>
    </DndProvider>

  );
}

/* Component: Home Content */
function HomeContent({ studySets }) {
  return (
    <section>
      <h2 className="text-lg font-semibold mb-4">Recents</h2>
      {studySets.length > 0 ? (
        studySets.map((set, index) => (
          <div key={index} className="bg-[#522136] p-4 rounded-lg w-1/3 mb-2">
            📂 {set.title} ({set.terms.length} {set.terms.length === 1 ? "term" : "terms"})
          </div>
        ))
      ) : (
        <p>No recent study sets.</p>
      )}
    </section>
  );
}

/* Component: Create a New Learning Set */
function CreateSet({ onSave }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
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

  const addCard = () => {
    setTerms([...terms, { id: terms.length + 1, term: "", definition: "" }]);
  };

  const removeCard = (index) => {
    setTerms(terms.filter((_, i) => i !== index).map((t, i) => ({ ...t, id: i + 1 })));
  };

  const handleSave = () => {
    const usedTerms = terms.filter((t) => t.term.trim() !== "");

    if (usedTerms.length === 0) {
      setErrorMessage("You need at least one term to create a study set.");
      return;
    }

    setErrorMessage(""); // Clear error message if valid
    if (title.trim() !== "") {
      onSave({ title, description, terms: usedTerms });
    }


    if (title.trim() !== "") {
      onSave({ title, description, terms: usedTerms });
    }


  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Create a New Learning Set</h1>

      <input
        type="text"
        placeholder="Enter a title"
        className="bg-[#522136] text-white px-4 py-2 rounded-lg w-full mb-4"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        placeholder="Add a description"
        className="bg-[#522136] text-white px-4 py-2 rounded-lg w-full mb-4"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      {errorMessage && (
        <p className="text-red-500 text-lg font-semibold text-center mb-4">
          {errorMessage}
        </p>
      )}


      {/* Create Button below Add Description */}
      <div className="flex justify-center mb-6">
        <button onClick={handleSave} className="bg-yellow-500 px-6 py-2 rounded-lg">
          Create
        </button>
      </div>

      {terms.map((item, index) => (
        <DraggableCard
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

      <button onClick={addCard} className="bg-[#5A2E44] px-6 py-2 rounded-lg w-full">
        + Add More Card
      </button>
    </div>
  );
}

/* Draggable Card Component */
function DraggableCard({ id, index, term, definition, moveCard, onDelete, onTermChange, onDefinitionChange }) {
  const [{ isDragging }, ref] = useDrag({
    type: "CARD",
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: "CARD",
    hover: (draggedItem) => {
      if (draggedItem.index !== index) {
        moveCard(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  return (
    <div ref={(node) => ref(drop(node))} className={`bg-[#522136] p-6 rounded-lg mb-4 ${isDragging ? "opacity-50" : ""}`}>
      <div className="flex justify-between border-b border-white pb-2 mb-2">
        <span className="text-lg font-bold">{id}</span>
        <div>
          <span className="cursor-move mr-2">═</span>
          <button onClick={onDelete} className="text-white">🗑</button>
        </div>
      </div>
      <div className="flex items-center">
        <input type="text" placeholder="Enter term" className="w-1/2 px-4 py-2 rounded-lg mr-2 border-r-2 border-white" value={term} onChange={(e) => onTermChange(e.target.value)} />
        <input type="text" placeholder="Enter definition" className="w-1/2 px-4 py-2 rounded-lg mr-2" value={definition} onChange={(e) => onDefinitionChange(e.target.value)} />
        <button className="bg-[#5A2E44] px-4 py-2 rounded-lg">📷 Add Image</button>
      </div>
    </div>
  );
}
function LibraryContent({ studySets }) {
  const [selectedSet, setSelectedSet] = useState(null);

  if (selectedSet) {
    return <FlashcardReview studySet={selectedSet} onExit={() => setSelectedSet(null)} />;
  }

  return (
    <section>
      <h2 className="text-lg font-semibold mb-4">Your Library</h2>
      {studySets.length > 0 ? (
        studySets.map((set, index) => (
          <div
            key={index}
            className="bg-[#522136] p-4 rounded-lg w-1/3 mb-2 cursor-pointer hover:bg-[#6A2A3B]"
            onClick={() => setSelectedSet(set)}
          >
            📂 {set.title} ({set.terms.length} terms)
          </div>
        ))
      ) : (
        <p>No study sets available.</p>
      )}
    </section>
  );
}

function RightPanel() {
  return (
    <aside className="w-48 bg-[#3B0B24] p-4 absolute right-0 top-0 h-full">
      <h3 className="text-lg font-semibold">Right Panel</h3>
      <p className="text-sm text-gray-300">Future content goes here...</p>
    </aside>
  );
}


function FlashcardReview({ studySet, onExit }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const nextCard = () => {
    setCurrentIndex((prev) => (prev + 1) % studySet.terms.length);
    setFlipped(false);
  };

  const prevCard = () => {
    setCurrentIndex((prev) => (prev - 1 + studySet.terms.length) % studySet.terms.length);
    setFlipped(false);
  };

  return (
    <div className="flex flex-1">
      {/* Main Flashcard Area */}
      <div className="flex-1 p-6">
        <h2 className="text-3xl font-semibold mb-6 text-left">{studySet.title}</h2>

        {/* Flashcard Wrapper */}
        <div className="flex flex-col items-start w-full">
          {/* Flashcard (Longer & Centered) */}
          <div className="w-[60%] h-[35vh] flex items-center justify-center p-6 bg-[#522136] rounded-lg text-center text-3xl cursor-pointer select-none">
            {flipped ? studySet.terms[currentIndex].term : studySet.terms[currentIndex].definition}
          </div>

          {/* Navigation Buttons - Now Centered Under the Flashcard */}
          <div className="flex justify-center w-[60%] mt-4">
            <button onClick={prevCard} className="w-16 h-10 bg-gray-300 rounded-lg flex items-center justify-center text-xl">←</button>
            <span className="text-xl mx-4">{currentIndex + 1} / {studySet.terms.length}</span>
            <button onClick={nextCard} className="w-16 h-10 bg-gray-300 rounded-lg flex items-center justify-center text-xl">→</button>
          </div>

          {/* White Line Below the Flashcard */}
          <div className="mt-6 w-[60%] h-[2px] bg-white"></div>
        </div>

      </div>

      {/* Right Panel Placeholder */}
      <aside className="w-48 bg-[#3B0B24] p-4">
        <h3 className="text-lg font-semibold">Right Panel</h3>
      </aside>
    </div>
  );
}

