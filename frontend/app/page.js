// Shift + Option + F to Format code
"use client";
import { useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useEffect } from "react";
import { motion } from "framer-motion"; // 🔹 Import motion at the top of your file
import 'bootstrap-icons/font/bootstrap-icons.css';
import MatchingCard from "./matchingcard";
import Findterm from "./findterm";



export default function Home() {
  useEffect(() => {
    document.body.style.fontFamily = "Itim, sans-serif";
  }, []);
  const [isMenuCollapsed, setIsMenuCollapsed] = useState(false);
  const [isCreatingSet, setIsCreatingSet] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isWingPanelOpen, setIsWingPanelOpen] = useState(false);
  const [isEditingSet, setIsEditingSet] = useState(null); // Holds the set being edited
  const [screenWidth, setScreenWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1024); // Default to 1024px to prevent small width issues
  const [studySets, setStudySets] = useState([
    {
      title: "Fruits",
      description: "A study set about different kinds of fruits",
      terms: [
        { term: "Apple", definition: "A small, round fruit that is usually red or black with a hard pit inside." },
        { term: "Grape", definition: "A small, round fruit that grows in bunches and is often used to make wine." },
        { term: "Lemon", definition: "A sour, yellow citrus fruit used for juice and flavoring." },
        { term: "Cherry", definition: "A small, juicy fruit that grows in bunches and has a single hard pit." },
        { term: "Banana", definition: "A long, curved fruit with yellow skin and soft, sweet flesh." }
      ]
    }
  ]);

  // Main Feature variable 
  const [shuffledDefinitions, setShuffledDefinitions] = useState([]);
  const [selectedSet, setSelectedSet] = useState(null);

  useEffect(() => {
    setShuffledDefinitions([...studySets[0].terms].sort(() => Math.random() - 0.5));
  }, [studySets]); // Shuffle definitions only once when studySets change

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
      if (window.innerWidth > 770) {
        setIsWingPanelOpen(false); // Auto-hide WingPanel when screen gets bigger
      }
    };

    handleResize(); // Set initial width on mount
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-[#3B0B24] text-white flex flex-col">

        {/* Unified Header */}
        <header className="flex justify-between items-center p-4 bg-[#3B0B24] text-white">

          {/* Left: Hamburger & App Name */}
          <div className="flex items-center">
            <button
              className="text-white text-2xl focus:outline-none w-9 h-9 flex items-center justify-center rounded-full transition duration-300 hover:bg-white hover:text-[#3B0B24]"
              onClick={() => {
                if (window.innerWidth <= 770) {
                  setIsWingPanelOpen(true);  // Open WingPanel if screen width ≤ 770px
                } else {
                  setIsMenuCollapsed(!isMenuCollapsed); // Otherwise, toggle side panel
                }
              }}
            >
              ☰
            </button>

            {/* Web Title (Changes based on screen size) */}
            <span className={`text-3xl font-bold ml-4 ${screenWidth <= 770 ? "block" : "hidden"}`} style={{ fontFamily: "'Inknut Antiqua', serif" }}>
              WN
            </span>
            <span className={`text-3xl font-bold ml-4 ${screenWidth > 770 ? "block" : "hidden"}`} style={{ fontFamily: "'Inknut Antiqua', serif" }}>
              WordNest
            </span>
          </div>


          {/* Middle: Search Bar */}
          {screenWidth >= 620 && (
            <div className="w-2/3 flex justify-center">
              <div className="relative w-full max-w-lg">
                <i className="bi bi-search absolute left-3 top-1/2 transform -translate-y-1/2 text-white"></i>
                <input
                  type="text"
                  placeholder="Study set, puzzle, news"
                  className="bg-[#522136] text-white px-10 py-2 rounded-lg w-full"
                />
              </div>
            </div>
          )}

          {/* Right: Plus Button, Type/Draw Toggle, User Info */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setIsCreatingSet(true);   // ✅ Open Create Set
                setIsEditingSet(null);    // ✅ Reset Edit mode
              }}
              className="bg-yellow-500 px-4 py-2 rounded-lg transition duration-300 hover:bg-yellow-400 hover:scale-105"
            >
              +
            </button>

            {/* <button className="bg-[#10B981] px-4 py-2 rounded-lg">Type</button>
            <button className="bg-[#5A2E44] px-4 py-2 rounded-lg">Draw</button> */}

            <div className="flex items-center gap-2">
              <div className="bg-gray-500 rounded-full w-10 h-10"></div>
              <span>Username</span>
            </div>
          </div>
        </header>

        {/* Search bar adjusts when screen width < 620px */}
        {screenWidth < 620 && (
          <div className="w-full px-4 mt-2 flex justify-center">
            <div className="relative w-full max-w-none">
              <i className="bi bi-search absolute left-3 top-1/2 transform -translate-y-1/2 text-white"></i>
              <input
                type="text"
                placeholder="Study set, puzzle, news"
                className="bg-[#522136] text-white px-10 py-2 rounded-lg w-full"
              />
            </div>
          </div>
        )}

        {/* WingPanel (Hidden by default, appears when clicking the hamburger) */}
        {isWingPanelOpen && <WingPanel isOpen={isWingPanelOpen} setIsOpen={setIsWingPanelOpen} />}

        {/* Main Container with Sidebar & Content */}
        <div className="flex flex-1 relative">

          {/* Side Navigation */}
          <aside className={`bg-[#3B0B24] p-4 transition-all ${screenWidth <= 770 ? "hidden" : isMenuCollapsed ? "w-16" : "w-48"}`}>
            <nav className="flex flex-col gap-4">
              <button onClick={() => setIsCreatingSet(false)} className="flex items-center gap-2 px-2 py-1 rounded-lg transition duration-300 hover:bg-white hover:text-[#3B0B24]">
                <i className="bi bi-house-door"></i> {!isMenuCollapsed && "Home"}
              </button>
              <button
                onClick={() => {
                  console.log("Resetting to Library View"); // Debugging log
                  setSelectedSet(null);  // ✅ Reset selected study set
                  setIsCreatingSet("library");
                }}
                className="flex items-center gap-2 px-2 py-1 rounded-lg transition duration-300 hover:bg-white hover:text-[#3B0B24]"
              >
                <i className="bi bi-folder2"></i> {!isMenuCollapsed && "Your Library"}
              </button>

              <hr className="border-[#FFFFFF]" />
              <p className={`text-sm ${isMenuCollapsed ? "hidden" : "block"}`}>Your folders</p>
              <button className="flex items-center gap-2 px-2 py-1 rounded-lg transition duration-300 hover:bg-white hover:text-[#3B0B24]">
                <i className="bi bi-plus"></i> {!isMenuCollapsed && "New Folder"}
              </button>
              <hr className="border-[#FFFFFF]" />
              <p className={`text-sm ${isMenuCollapsed ? "hidden" : "block"}`}>Explore</p>
              <button className="flex items-center gap-2 px-2 py-1 rounded-lg transition duration-300 hover:bg-white hover:text-[#3B0B24]">
                <i className="bi bi-puzzle"></i> {!isMenuCollapsed && "CrossWord"}
              </button>
            </nav>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 p-6">
            {isCreatingSet === "library" ? (
              <LibraryContent
                studySets={studySets}
                screenWidth={screenWidth}
                isEditing={isEditing}
                setIsEditing={setIsEditing} // 🔹 Pass this down
                setIsEditingSet={setIsEditingSet} // 🔹 Pass the function as a prop
                setIsCreatingSet={setIsCreatingSet}
              />
            ) : isEditingSet ? (
              <EditSet
                studySet={isEditingSet}
                onSave={(updatedSet) => {
                  setStudySets(
                    studySets.map((set) =>
                      set.title === isEditingSet.title ? updatedSet : set
                    )
                  );
                  setIsEditingSet(null); // Exit edit mode
                }}
                onCancel={() => setIsEditingSet(null)}
              />
            ) : isCreatingSet ? (
              <CreateSet
                onSave={(newSet) => {
                  setStudySets([...studySets, newSet]);
                  setIsCreatingSet(false);
                }}
              />
            ) : (
              <HomeContent studySets={studySets} />
            )}
          </main>

          {/* Right Panel (Hidden on small screens OR when creating a set) */}
          {screenWidth > 770 && !isCreatingSet && !isEditing && (
            <div className="hidden md:block">
              <aside className="w-55 bg-[#260516] p-4 absolute right-0 top-0 h-full">
                <h3 className="text-lg font-semibold">Right Panel</h3>
                <p className="text-sm text-gray-300">Future content goes here...</p>
              </aside>
            </div>
          )}
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
  const [alwaysAddOne, setAlwaysAddOne] = useState(false); // Checkbox state
  const [showCardDropdown, setShowCardDropdown] = useState(false); // Toggle dropdown
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
        <button
          onClick={handleSave}
          className="bg-yellow-500 px-6 py-2 rounded-lg transition duration-300 hover:bg-yellow-400 hover:scale-105"
        >
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

      <div className="flex flex-col items-center gap-2">
        <div className="relative w-full flex flex-col items-center">
          {/* Add More Card Button */}
          <button
            onClick={() => {
              if (alwaysAddOne) {
                addCard(1); // Automatically add 1 card when the checkbox is checked
              } else {
                setShowCardDropdown(!showCardDropdown); // Show the dropdown only if not always adding 1 card
              }
            }}
            className="bg-[#5A2E44] px-6 py-2 rounded-lg w-full hover:bg-[#6A2A3B] transition duration-300 flex items-center justify-center relative"
          >
            <span>+ Add More Card</span>
            {!alwaysAddOne && (
              <span className="absolute right-4">▼</span>
            )}
          </button>

          {/* Dropdown Appears Inside Button */}
          {!alwaysAddOne && showCardDropdown && (
            <div className="absolute top-full mt-1 w-full bg-[#522136] text-white rounded-lg shadow-lg z-10">
              {[1, 2, 3, 4, 5].map((num) => (
                <div
                  key={num}
                  className="px-4 py-2 hover:bg-[#6A2A3B] cursor-pointer text-center"
                  onClick={() => {
                    setNumCards(num);
                    setShowCardDropdown(false);
                    addCard(num);
                  }}
                >
                  {num} {num === 1 ? "Card" : "Cards"}
                </div>
              ))}
            </div>
          )}

          {/* Checkbox for "Always add 1 card" */}
          <label className="flex items-center text-sm mt-2 cursor-pointer">
            <input
              type="checkbox"
              checked={alwaysAddOne}
              onChange={() => setAlwaysAddOne(!alwaysAddOne)}
              className="mr-2"
            />
            Always add 1 card
          </label>
        </div>
      </div>
    </div>
  );
}




function EditSet({ studySet, onSave, onCancel }) {
  const [title, setTitle] = useState(studySet.title);
  const [description, setDescription] = useState(studySet.description);
  const [terms, setTerms] = useState([...studySet.terms]);
  const [errorMessage, setErrorMessage] = useState("");
  const [alwaysAddOne, setAlwaysAddOne] = useState(false); // Checkbox state
  const [showCardDropdown, setShowCardDropdown] = useState(false); // Toggle dropdown
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

  const handleSave = () => {
    const usedTerms = terms.filter((t) => t.term.trim() !== "");
    if (usedTerms.length === 0) {
      setErrorMessage("You need at least one term to update this set.");
      return;
    }
    setErrorMessage("");
    onSave({ title, description, terms: usedTerms });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Edit Your Learning Set</h1>
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

      <div className="flex flex-col items-center gap-2">
        <div className="relative w-full flex flex-col items-center">
          {/* Add More Card Button */}
          <button
            onClick={() => {
              if (alwaysAddOne) {
                addCard(1); // Automatically add 1 card when the checkbox is checked
              } else {
                setShowCardDropdown(!showCardDropdown); // Show the dropdown only if not always adding 1 card
              }
            }}
            className="bg-[#5A2E44] px-6 py-2 rounded-lg w-full hover:bg-[#6A2A3B] transition duration-300 flex items-center justify-center relative"
          >
            <span>+ Add More Card</span>
            {!alwaysAddOne && (
              <span className="absolute right-4">▼</span>
            )}
          </button>

          {/* Dropdown Appears Inside Button */}
          {!alwaysAddOne && showCardDropdown && (
            <div className="absolute top-full mt-1 w-full bg-[#522136] text-white rounded-lg shadow-lg z-10">
              {[1, 2, 3, 4, 5].map((num) => (
                <div
                  key={num}
                  className="px-4 py-2 hover:bg-[#6A2A3B] cursor-pointer text-center"
                  onClick={() => {
                    setNumCards(num);
                    setShowCardDropdown(false);
                    addCard(num);
                  }}
                >
                  {num} {num === 1 ? "Card" : "Cards"}
                </div>
              ))}
            </div>
          )}

          {/* Checkbox for "Always add 1 card" */}
          <label className="flex items-center text-sm mt-2 cursor-pointer">
            <input
              type="checkbox"
              checked={alwaysAddOne}
              onChange={() => setAlwaysAddOne(!alwaysAddOne)}
              className="mr-2"
            />
            Always add 1 card
          </label>
        </div>
      </div>

      {/* Done Button */}
      <div className="flex justify-center mt-6">
        <button
          onClick={handleSave}
          className="bg-yellow-500 px-6 py-2 rounded-lg transition duration-300 hover:bg-yellow-400 hover:scale-105"
        >
          Done
        </button>
      </div>
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
          <span className="cursor-move mr-2 transition duration-300 hover:text-yellow-500 hover:scale-110">═</span>
          <button
            onClick={onDelete}
            className="text-white transition duration-300 hover:text-red-500 hover:scale-110"
          >
            <i className="bi bi-trash"></i>
          </button>
        </div>
      </div>
      <div className="flex items-center">
        <input
          type="text"
          placeholder="Enter term"
          className="w-1/2 px-4 py-2 rounded-lg text-white bg-[#522136]"
          value={term}
          onChange={(e) => onTermChange(e.target.value)}
        />

        <span className="text-white text-5xl px-1 font-light">|</span> {/* This is the real vertical line */}

        <input
          type="text"
          placeholder="Enter definition"
          className="w-1/2 px-4 py-2 rounded-lg text-white bg-[#522136]"
          value={definition}
          onChange={(e) => onDefinitionChange(e.target.value)}
        />

        <button
          className="bg-[#5A2E44] px-4 py-2 rounded-lg transition duration-300 hover:bg-[#7A3E54] hover:scale-105 ml-4"
        >
          <i className="bi bi-image"></i> Add Image
        </button>
      </div>
    </div>
  );
}





function LibraryContent({ studySets, screenWidth, isEditing, setIsEditing, setIsEditingSet, setIsCreatingSet }) {
  const [selectedSet, setSelectedSet] = useState(null);
  const [starredTerms, setStarredTerms] = useState({});

  // Toggle star for terms, syncing with flashcard & list
  const toggleStar = (term) => {
    setStarredTerms((prev) => ({
      ...prev,
      [term]: !prev[term], // Toggle star state for the term
    }));
  };

  // If a set is selected, show flashcard review instead of library
  if (selectedSet) {
    return (
      <FlashcardReview
        studySets={studySets}
        studySet={selectedSet}
        onExit={() => setSelectedSet(null)}
        screenWidth={screenWidth}
        starredTerms={starredTerms}
        toggleStar={toggleStar}
        isEditing={isEditing}
        setIsEditing={setIsEditing} // 🔹 Pass this down
        setIsEditingSet={setIsEditingSet} // 🔹 Pass the function as a prop
        setIsCreatingSet={setIsCreatingSet}
      />
    );
  }

  return (
    <section>
      <h2 className="text-lg font-semibold mb-4">Your Library</h2>
      {studySets.length > 0 ? (
        studySets.map((studySet, index) => (
          <div
            key={index}
            className="bg-[#522136] p-4 rounded-lg w-1/3 mb-2 cursor-pointer hover:bg-[#6A2A3B]"
            onClick={() => setSelectedSet(studySet)} // ✅ Clicking opens Flashcard Review
          >
            📂 {studySet.title} ({studySet.terms.length} terms)
          </div>
        ))

      ) : (
        <p>No study sets available.</p>
      )}
    </section>
  );
}





function WingPanel({ isOpen, setIsOpen }) {
  return (
    <motion.aside
      className="fixed top-0 left-0 h-full w-48 bg-[#3B0B24] p-4 shadow-lg z-50"
      initial={{ x: -200 }}
      animate={{ x: isOpen ? 0 : -200 }}
      transition={{ duration: 0.3 }}
    >
      {/* BigMac Button & Web Title "W" */}
      <div className="flex items-center gap-1">
        <button
          className="text-white text-2xl focus:outline-none w-9 h-9 flex items-center justify-center rounded-full transition duration-300 hover:bg-white hover:text-[#3B0B24]"
          onClick={() => setIsOpen(false)}
        >
          ☰
        </button>

        <span className="text-3xl font-bold ml-2" style={{ fontFamily: "'Inknut Antiqua', serif" }}>W</span>
      </div>

      {/* Navigation Items */}
      <nav className="flex flex-col gap-4 mt-9">
        <button className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white hover:text-[#3B0B24]">
          <i className="bi bi-house-door"></i> Home
        </button>
        <button className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white hover:text-[#3B0B24]">
          <i className="bi bi-folder2"></i> Your Library
        </button>
        <hr className="border-[#FFFFFF]" />
        <p className="text-sm">Your folders</p>
        <button className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white hover:text-[#3B0B24]">
          <i className="bi bi-plus"></i> New Folder
        </button>
        <hr className="border-[#FFFFFF]" />
        <p className="text-sm">Explore</p>
        <button className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white hover:text-[#3B0B24]">
          <i className="bi bi-puzzle"></i> CrossWord
        </button>
      </nav>
    </motion.aside>
  );
}





function FlashcardReview({ studySets, studySet, onExit, screenWidth, starredTerms, toggleStar, isEditing, setIsEditing, setIsEditingSet, setIsCreatingSet, setSelectedSet }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [editTerm, setEditTerm] = useState("");
  const [editDefinition, setEditDefinition] = useState("");
  const [editingIndex, setEditingIndex] = useState(null); // Track the item being edited
  const [showMatchingTest, setShowMatchingTest] = useState(false);
  const [showFillTest, setShowFillTest] = useState(false);

  // Get the current term
  const currentTerm = studySet.terms[currentIndex].term;

  const nextCard = () => {
    setCurrentIndex((prev) => (prev + 1) % studySet.terms.length);
    setFlipped(false);
  };

  const prevCard = () => {
    setCurrentIndex((prev) => (prev - 1 + studySet.terms.length) % studySet.terms.length);
    setFlipped(false);
  };

  // Open the edit modal
  const handleEditClick = (termObj, index) => {
    setEditTerm(termObj.term);  // Pre-fill term
    setEditDefinition(termObj.definition);  // Pre-fill definition
    setEditingIndex(index); // Store the index of the editing item
    setIsEditing(true);  // Show the modal
  };

  // Save changes
  const handleSaveEdit = () => {
    if (editingIndex !== null) {
      const updatedTerms = [...studySet.terms]; // Copy the terms array
      updatedTerms[editingIndex] = { term: editTerm, definition: editDefinition }; // Update the specific term
      studySet.terms = updatedTerms; // Save changes
    }
    setIsEditing(false); // Close modal
  };

  return (
    <div className="flex flex-1">
      {/* Main Flashcard Area */}
      <div className="flex-1">
        <h2 className="text-3xl font-semibold mb-6 text-left">{studySet.title}</h2>
        {showMatchingTest ? (
          <MatchingCard
            setShowMatchingTest={setShowMatchingTest}
            screenWidth={screenWidth}
            setSelectedSet={setSelectedSet}
            studySet={studySet} // ✅ Corrected to `studySet`
          />
        ) : showFillTest ? (
          <Findterm
            screenWidth={screenWidth}
            setSelectedSet={setSelectedSet}
            studySet={studySet} // ✅ Corrected to `studySet`
            setShowFillTest={setShowFillTest}
          />
        ) : (
          <div className={`flex flex-col ${screenWidth > 770 ? "items-start" : "items-center"} w-full`}>

            {/* Mode Selection Buttons - Now Inside the Flashcard Layout */}
            <div className={`flex gap-4 mb-4 ${screenWidth > 770 ? "w-[60%]" : "w-full"} `}>
              <button
                onClick={() => setShowMatchingTest(true)}
                className="flex-1 px-4 py-2 bg-[#522136] text-white rounded-lg hover:bg-[#6A2A3B]">
                Matching Card
              </button>
              <button
                className="flex-1 px-4 py-2 bg-[#522136] text-white rounded-lg hover:bg-[#6A2A3B]"
                onClick={() => setShowFillTest(true)} // ✅ Change state
              >
                Find the Term
              </button>
              <button className="flex-1 px-4 py-2 bg-[#522136] text-white rounded-lg hover:bg-[#6A2A3B]">
                Puzzle
              </button>
            </div>

            {/* Loop Test Button - Also Inside for Consistent Alignment */}
            <div className={`mb-4 ${screenWidth > 770 ? "w-[60%]" : "w-full"}`}>
              <button className="w-full px-4 py-2 bg-[#522136] text-white rounded-lg hover:bg-[#6A2A3B] flex items-center justify-center gap-2">
                <i className="bi bi-arrow-repeat"></i> Loop Test
              </button>
            </div>

            {/* Flashcard with Flip Animation */}
            <motion.div
              className={`h-[35vh] flex items-center justify-center p-6 bg-[#522136] rounded-lg text-center text-3xl cursor-pointer select-none relative transition-all duration-300 
            ${screenWidth <= 770 ? "w-full mx-auto" : "w-[60%] ml-0"}`}
              onClick={() => setFlipped(!flipped)}
              initial={{ rotateX: 0 }}
              animate={{ rotateX: flipped ? 180 : 0 }}
              transition={{ duration: 0.5 }}
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* FRONT SIDE (Definition) */}
              {!flipped && (
                <div className="absolute w-full h-full flex items-center justify-center">
                  {studySet.terms[currentIndex].definition}

                  {/* ⭐ Star Button - Positioned in the top-right corner and clickable */}
                  <div className="absolute top-2 right-2 flex gap-2 z-10">
                    <button
                      className="absolute top-0 right-7 text-white text-xl z-10"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent flip when clicking the star
                        toggleStar(studySet.terms[currentIndex].term);
                      }}
                    >
                      {starredTerms[studySet.terms[currentIndex].term] ? (
                        <i className="bi bi-star-fill text-yellow-400"></i>
                      ) : (
                        <i className="bi bi-star"></i>
                      )}
                    </button>

                    {/* Pencil Icons */}
                    <button className="absolute top-0 right-0 text-white text-xl z-10 transition duration-300 hover:text-yellow-400 hover:scale-110"
                      onClick={(e) => { e.stopPropagation(); handleEditClick(studySet.terms[currentIndex], currentIndex); }}>
                      <i className="bi bi-pencil-fill"></i>
                    </button>
                  </div>
                </div>
              )}

              {/* BACK SIDE (Term) */}
              {flipped && (
                <div className="absolute w-full h-full flex items-center justify-center rotate-x-180">
                  {studySet.terms[currentIndex].term}

                  {/* ⭐ Star Button - Positioned in the top-right corner and clickable */}
                  <div className="absolute top-2 right-2 flex gap-2 z-10">
                    <button
                      className="absolute top-0 right-7 text-white text-xl z-10"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent flip when clicking the star
                        toggleStar(studySet.terms[currentIndex].term);
                      }}
                    >
                      {starredTerms[studySet.terms[currentIndex].term] ? (
                        <i className="bi bi-star-fill text-yellow-400"></i>
                      ) : (
                        <i className="bi bi-star"></i>
                      )}
                    </button>

                    {/* Pencil Icons */}
                    <button className="absolute top-0 right-0 text-white text-xl z-10 transition duration-300 hover:text-yellow-400 hover:scale-110"
                      onClick={(e) => { e.stopPropagation(); handleEditClick(studySet.terms[currentIndex], currentIndex); }}>
                      <i className="bi bi-pencil-fill"></i>
                    </button>
                  </div>

                </div>
              )}
            </motion.div>

            {/* Navigation Buttons - Centered Under Flashcard */}
            <div className="flex w-full mt-4">
              <div className={`flex items-center gap-4 ${screenWidth > 770 ? "flex justify-center w-[60%]" : "w-full justify-center"}`}>
                <button
                  onClick={prevCard}
                  className="w-[85px] h-[45px] bg-white rounded-[35px] flex items-center justify-center text-4xl text-black"
                >
                  ←
                </button>
                <span className="text-xl flex items-center justify-center h-[45px]">
                  {currentIndex + 1} / {studySet.terms.length}
                </span>
                <button
                  onClick={nextCard}
                  className="w-[85px] h-[45px] bg-white rounded-[35px] flex items-center justify-center text-4xl text-black"
                >
                  →
                </button>
              </div>
            </div>

            {/* White Line Below the Flashcard */}
            <div className={`mt-6 h-[2px] bg-white ${screenWidth <= 770 ? "w-full" : "w-[60%] ml-0"}`}></div>

            {/* Term List Below Flashcard */}
            <div className={`mt-4 ${screenWidth > 770 ? "w-[60%]" : "w-full"}`}>
              <h3 className="text-lg font-semibold mb-2">Term in this set ({studySet.terms.length})</h3>

              <div className="flex flex-col gap-2">
                {studySet.terms.map((item, index) => (
                  <div key={index} className="bg-[#522136] p-4 rounded-lg flex items-center justify-between w-full">
                    <span className="font-semibold w-1/3">{item.term}</span>
                    <span className="text-white text-5xl px-1 font-light">|</span> {/* Vertical Line */}
                    <span className="text-gray-300 w-2/3">{item.definition}</span>

                    {/* ⭐ Star & ✏️ Edit Buttons Container */}
                    <div className="relative flex items-center pl-8">
                      {/* Star Button - Positioned at the top-right */}
                      <button
                        onClick={() => toggleStar(item.term)}
                        className="absolute bottom-0 right-0 text-white text-xl"
                      >
                        {starredTerms[item.term] ? (
                          <i className="bi bi-star-fill text-yellow-400"></i>
                        ) : (
                          <i className="bi bi-star"></i>
                        )}
                      </button>

                      {/* ✏️ Pencil Icon (Edit Button) - Positioned lower right */}
                      <button
                        onClick={() => handleEditClick(item, index)}
                        className="absolute top-0 right-0 text-white text-lg transition duration-300 hover:text-yellow-400 hover:scale-110"
                      >
                        <i className="bi bi-pencil-fill"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add or Remove Term Button */}
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => {
                    setIsEditingSet(studySet);  // ✅ Set the correct study set
                    setIsCreatingSet(false);    // ✅ Prevent conflict with Create Set mode
                  }}
                  className="bg-[#6A2E3B] text-white px-6 py-2 rounded-lg transition duration-300 hover:bg-[#8A3E4B] hover:scale-105"
                >
                  Add or remove term
                </button>
              </div>


            </div>
          </div>
        )}
        {isEditing && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div
              className="bg-[#3B0B24] p-6 rounded-lg text-white relative"
              style={{ width: screenWidth > 450 ? "450px" : "100%" }} // ✅ Set width logic
            >
              <button className="absolute top-2 right-2 text-xl" onClick={() => setIsEditing(false)}>✖</button>
              <h2 className="text-2xl font-bold mb-4">Edit</h2>

              <label className="block mb-2">Term:</label>
              <input
                type="text"
                className="bg-[#522136] text-white px-4 py-2 rounded-lg w-full mb-4"
                value={editTerm}
                onChange={(e) => setEditTerm(e.target.value)}
              />

              <label className="block mb-2">Definition:</label>
              <textarea
                className="bg-[#522136] text-white px-4 py-2 rounded-lg w-full mb-4"
                value={editDefinition}
                onChange={(e) => setEditDefinition(e.target.value)}
              />

              <button onClick={handleSaveEdit} className="bg-yellow-500 px-6 py-2 rounded-lg transition duration-300 hover:bg-yellow-400 hover:scale-105">
                Done
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

