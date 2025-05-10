import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { updateStudySet, createStudySet, getStudySets } from '../api';
import MatchingCard from "./matchingcard";
import Findterm from "./findterm";
import CrosswordPuzzle from "./crossword";

export default function FlashcardReview({ setShowNeedLogin, setStudySets, studySets, studySet, onExit, screenWidth, starredTerms, toggleStar, isEditing, setIsEditing, setIsEditingSet, setIsCreatingSet, setSelectedSet, t }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const [editTerm, setEditTerm] = useState("");
    const [editDefinition, setEditDefinition] = useState("");
    const [editingIndex, setEditingIndex] = useState(null); // Track the item being edited
    const [showMatchingTest, setShowMatchingTest] = useState(false);
    const [showFillTest, setShowFillTest] = useState(false);
    const [showCrosswordPuzzle, setShowCrosswordPuzzle] = useState(false);
    const scrollPauseTimerRef = useRef(null);
    const [copySuccess, setCopySuccess] = useState(false);
    const [copyError, setCopyError] = useState(false);
    const isOwner = studySet.username === localStorage.getItem("username");
    const resetScrollPauseTimer = () => {
        if (scrollPauseTimerRef.current) clearTimeout(scrollPauseTimerRef.current);
        scrollPauseTimerRef.current = setTimeout(() => {
            setFlipped(false); // stay flipped front
            // Add any visual reset if needed
        }, 500);
    };

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
    const handleSaveEdit = async () => {
        if (editingIndex !== null) {
            const updatedTerms = [...studySet.terms];
            updatedTerms[editingIndex] = { term: editTerm, definition: editDefinition };
            studySet.terms = updatedTerms; // Update locally too

            try {
                const updatedSet = {
                    ...studySet,
                    terms: updatedTerms,
                };
                await updateStudySet(studySet._id, updatedSet);  // 🔥 Send to backend
                console.log("✅ Term saved to MongoDB!");
            } catch (error) {
                console.error("❌ Failed to save term edit:", error);
            }
        }
        setIsEditing(false); // Close the modal
    };

    const handleCopySet = async () => {
        try {
            const username = localStorage.getItem("username");
            if (!username) {
                setShowNeedLogin(true);
                return;
            }

            const copiedSet = {
                username,
                title: studySet.title + " (Copy)",
                description: studySet.description,
                terms: studySet.terms.map(term => ({
                    term: term.term,
                    definition: term.definition
                })),
                isPrivate: "Copy"
            };

            const response = await createStudySet(copiedSet);
            console.log("✅ Copied set:", response);

            // 🛠️ After copying, refresh your library
            const updatedSets = await getStudySets(username);
            setStudySets(updatedSets); // 🔥 update instantly!

            setCopySuccess(true); // show popup
        } catch (error) {
            console.error("❌ Failed to copy set:", error);
            setCopyError(true);
        }
    };

    return (
        <div className="flex flex-1">
            {/* Main Flashcard Area */}
            <div className="flex-1 overflow-hidden" style={{ maxWidth: "100%", overflowX: "hidden" }}>
                {copySuccess && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
                        <div className="bg-black p-6  rounded-3xl text-white border border-[#00e0ff] shadow-[0_0_16px_#00e0ff] w-[350px]">
                            <h2 className="text-2xl font-bold mb-4 text-[#00e0ff] text-center drop-shadow-[0_0_8px_#00e0ff]">Set Copied!</h2>
                            <p className="text-center text-[#00e0ff] mb-6">
                                Your copy has been created. Go to your Library to review it!
                            </p>
                            <div className="flex justify-center">
                                <button
                                    className="px-6 py-2  rounded-3xl border border-[#00e0ff] text-[#00e0ff] hover:bg-[#00e0ff] hover:text-black transition duration-300 shadow-md hover:shadow-[0_0_12px_#00e0ff]"
                                    onClick={() => {
                                        setCopySuccess(false);
                                        onExit(); // Go back to library view
                                    }}
                                >
                                    Go to Library
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {copyError && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
                        <div className="bg-black p-6  rounded-3xl text-white border border-[#ff0000] shadow-[0_0_16px_red] w-[350px]">
                            <h2 className="text-2xl font-bold mb-4 text-[#ff0000] text-center drop-shadow-[0_0_8px_red]">Copy Failed!</h2>
                            <p className="text-center text-[#ff0000] mb-6">
                                Something went wrong. Please try again later.
                            </p>
                            <div className="flex justify-center">
                                <button
                                    className="px-6 py-2  rounded-3xl border border-[#ff0000] text-[#ff0000] hover:bg-[#ff0000] hover:text-black transition duration-300 shadow-md hover:shadow-[0_0_12px_red]"
                                    onClick={() => setCopyError(false)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className={`flex items-center justify-between mb-6 ${screenWidth > 1000 ? "w-[60%]" : "w-full"}`}>
                    <h2 className="text-3xl px-2 font-semibold text-left text-[#ff7700] drop-shadow-[0_0_8px_#ff7700]">
                        {studySet.title}
                    </h2>
                    {studySet.username !== localStorage.getItem("username") && (
                        <button
                            onClick={handleCopySet}
                            className="flex items-center gap-2 px-4 py-2 bg-black text-[#00e0ff] border-2 border-[#00e0ff]  rounded-3xl hover:bg-[#00e0ff] hover:text-black shadow-md hover:shadow-[0_0_12px_#00e0ff] transition duration-300 text-sm ml-4"
                        >
                            <i className="bi bi-files"></i>
                            Copy
                        </button>

                    )}
                </div>

                {showMatchingTest ? (
                    <MatchingCard
                        t={t}
                        setShowMatchingTest={setShowMatchingTest}
                        screenWidth={screenWidth}
                        setSelectedSet={setSelectedSet}
                        studySet={studySet} // ✅ Corrected to `studySet`
                    />
                ) : showFillTest ? (
                    <Findterm
                        t={t}
                        screenWidth={screenWidth}
                        setSelectedSet={setSelectedSet}
                        studySet={studySet} // ✅ Corrected to `studySet`
                        setShowFillTest={setShowFillTest}
                    />
                ) : showCrosswordPuzzle ? (
                    <CrosswordPuzzle
                        t={t}
                        screenWidth={screenWidth}
                        setSelectedSet={setSelectedSet}
                        studySet={studySet} // ✅ Corrected to `studySet`
                        // setShowCrosswordPuzzle={setShowCrosswordPuzzle}
                        onBack={() => setShowCrosswordPuzzle(false)}
                    />
                ) : (
                    <div className={`flex flex-col ${screenWidth > 1000 ? "items-start" : "items-center"} w-full`}>

                        {/* Mode Selection Buttons - Now Inside the Flashcard Layout */}
                        <div className={`flex gap-4 mb-4 ${screenWidth > 1000 ? "w-[60%]" : "w-full"} `}>
                            <button
                                onClick={() => setShowMatchingTest(true)}
                                className="flex-1 px-4 py-2 bg-[#1a2e30] text-[#00e0ff] border-2 border-[#00e0ff] shadow-[0_0_20px_#00e0ff]  rounded-3xl transition duration-300 hover:bg-[#00e0ff] hover:text-black shadow-md hover:shadow-[0_0_12px_#00e0ff]"
                            >
                                {t.matchingcard}
                            </button>
                            <button
                                onClick={() => setShowFillTest(true)}
                                className="flex-1 px-4 py-2 bg-[#1a2e30] text-[#00e0ff] border border-2 border-[#00e0ff] shadow-[0_0_20px_#00e0ff]  rounded-3xl transition duration-300 hover:bg-[#00e0ff] hover:text-black shadow-md hover:shadow-[0_0_12px_#00e0ff]"
                            >
                                {t.fillIn}
                            </button>
                            <button
                                onClick={() => setShowCrosswordPuzzle(true)}
                                className="flex-1 px-4 py-2 bg-[#1a2e30] text-[#00e0ff] border border-2 border-[#00e0ff] shadow-[0_0_20px_#00e0ff]  rounded-3xl transition duration-300 hover:bg-[#00e0ff] hover:text-black shadow-md hover:shadow-[0_0_12px_#00e0ff]"
                            >
                                {t.puzzle}
                            </button>
                        </div>


                        {/* Loop Test Button - Also Inside for Consistent Alignment */}
                        <div className={`mb-4 ${screenWidth > 1000 ? "w-[60%]" : "w-full"}`}>
                            <button className="w-full px-4 py-2 bg-[#1a2e30] text-[#00e0ff] border border-2 border-[#00e0ff] shadow-[0_0_20px_#00e0ff]  rounded-3xl hover:bg-[#00e0ff] hover:text-black shadow-md hover:shadow-[0_0_12px_#00e0ff] flex items-center justify-center gap-2 transition duration-300">
                                <i className="bi bi-arrow-repeat"></i> {t.loopTest}
                            </button>
                        </div>


                        {/* Flashcard scroll Animation */}
                        <AnimatePresence mode="wait" initial={false}>
                            <motion.div

                                key={currentIndex}
                                initial={{ opacity: 0, x: 100 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -100 }}
                                transition={{ duration: 0.1 }}
                                className={`relative ${screenWidth <= 1000 ? "w-full" : "w-full ml-0"}`}
                            >
                                {/* Flashcard with Flip Animation */}
                                <motion.div
                                    className={`h-[35vh] flex items-center justify-center p-6  rounded-3xl text-center text-3xl cursor-pointer select-none relative transition-all duration-300
                      ${starredTerms[studySet.terms[currentIndex].term]
                                            ? "bg-[#45311f] border-2 border-[#ff7700] "
                                            : "bg-[#474747] border-2 border-white "}
                      ${screenWidth <= 1000 ? "w-full mx-auto" : "w-[60%] ml-0"}`}

                                    onClick={() => setFlipped(!flipped)}
                                    initial={{ rotateX: 0 }}
                                    animate={{ rotateX: flipped ? 180 : 0 }}
                                    transition={{ duration: 0.002 }}
                                    style={{ transformStyle: "preserve-3d" }}
                                >
                                    {/* FRONT SIDE (Definition) */}
                                    {!flipped && (
                                        <div className="absolute w-full h-full flex items-center justify-center">
                                            <span className={`${starredTerms[studySet.terms[currentIndex].term]
                                                ? "text-[#ff7700] "
                                                : "text-white "}`}>
                                                {studySet.terms[currentIndex].definition} {/* or .term for back side */}
                                            </span>



                                            {/* ⭐ Star Button - Positioned in the top-right corner and clickable */}
                                            {isOwner && (
                                                <div className="absolute top-2 right-2 flex gap-2 z-10">
                                                    <button
                                                        className={`absolute top-0 right-7 text-xl z-10 transition duration-300 ${starredTerms[studySet.terms[currentIndex].term]
                                                            ? "text-[#ff7700] hover:text-[#ffaa33] drop-shadow-[0_0_8px_#ff7700]"
                                                            : "text-white hover:text-[#ffaa33] drop-shadow-[0_0_8px_white]"
                                                            }`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleStar(studySet.terms[currentIndex].term, studySet._id);
                                                        }}

                                                    >
                                                        {isOwner && starredTerms[studySet.terms[currentIndex].term] ? (
                                                            <i className="bi bi-star-fill text-yellow-400"></i>
                                                        ) : (
                                                            <i className="bi bi-star"></i>
                                                        )}
                                                    </button>

                                                    {/* Pencil Icons */}
                                                    <button className="absolute top-0 right-0 text-white text-xl z-10 transition duration-300 hover:text-[#ffaa33] hover:scale-110 drop-shadow-[0_0_8px_white]"
                                                        onClick={(e) => { e.stopPropagation(); handleEditClick(studySet.terms[currentIndex], currentIndex); }}>
                                                        <i className="bi bi-pencil-fill"></i>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* BACK SIDE (Term) */}
                                    {flipped && (
                                        <div className="absolute w-full h-full flex items-center justify-center rotate-x-180">
                                            <span className={`${starredTerms[studySet.terms[currentIndex].term]
                                                ? "text-[#ff7700]"
                                                : "text-white "}`}>
                                                {studySet.terms[currentIndex].term}
                                            </span>
                                            {/* ⭐ Star Button - Positioned in the top-right corner and clickable */}
                                            {isOwner && (
                                                <div className="absolute top-2 right-2 flex gap-2 z-10">
                                                    <button
                                                        className={`absolute top-0 right-7 text-xl z-10 transition duration-300 ${starredTerms[studySet.terms[currentIndex].term]
                                                            ? "text-[#ff7700] hover:text-[#ffaa33] "
                                                            : "text-white hover:text-[#ffaa33]"
                                                            }`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleStar(studySet.terms[currentIndex].term, studySet._id);
                                                        }}

                                                    >
                                                        {isOwner && starredTerms[studySet.terms[currentIndex].term] ? (
                                                            <i className="bi bi-star-fill text-yellow-400"></i>
                                                        ) : (
                                                            <i className="bi bi-star"></i>
                                                        )}
                                                    </button>

                                                    {/* Pencil Icons */}
                                                    <button className="absolute top-0 right-0 text-white text-xl z-10 transition duration-300 hover:text-[#ffaa33] hover:scale-110 "
                                                        onClick={(e) => { e.stopPropagation(); handleEditClick(studySet.terms[currentIndex], currentIndex); }}>
                                                        <i className="bi bi-pencil-fill"></i>
                                                    </button>
                                                </div>
                                            )}

                                        </div>
                                    )}
                                </motion.div>
                            </motion.div>
                        </AnimatePresence>

                        {/* Smooth Scroll Slider to Flip Cards Like Chapters */}
                        <div className="flex w-[60%]">
                            <div className={`flex items-center gap-4 mt-6 ${screenWidth > 1000 ? "w-[240px] mx-auto justify-center" : "w-[240px] mx-auto justify-center"}`}>
                                <input
                                    type="range"
                                    min="0"
                                    max={studySet.terms.length - 1}
                                    value={currentIndex}
                                    onChange={(e) => {
                                        const index = parseInt(e.target.value);
                                        setCurrentIndex(index);
                                        setFlipped(false);
                                        resetScrollPauseTimer();
                                    }}
                                    className="w-full transition-all duration-300 
                   accent-[#00e0ff] 
                   hover:accent-[#ffaa33] 
                   bg-black 
                    rounded-3xl 
                   h-2 
                   appearance-none 
                   shadow-[0_0_10px_#00e0ff]"
                                    style={{
                                        accentColor: "#00e0ff",
                                    }}
                                />
                            </div>
                        </div>

                        {/* Navigation Buttons - Centered Under Flashcard */}
                        <div className="flex w-full mt-4">
                            <div className={`flex items-center gap-4 ${screenWidth > 1000 ? "flex justify-center w-[60%]" : "w-full justify-center"}`}>
                                <button
                                    onClick={prevCard}
                                    className="w-[85px] h-[45px] bg-black text-white border-2 border-white rounded-[35px] text-4xl flex items-center justify-center transition duration-300 hover:bg-white hover:text-black shadow-[0_0_12px_white]"
                                >
                                    ←
                                </button>

                                <span className="text-xl text-white drop-shadow-[0_0_8px_white] flex items-center justify-center h-[45px]">
                                    {currentIndex + 1} / {studySet.terms.length}
                                </span>

                                <button
                                    onClick={nextCard}
                                    className="w-[85px] h-[45px] bg-black text-white border-2 border-white rounded-[35px] text-4xl flex items-center justify-center transition duration-300 hover:bg-white hover:text-black shadow-[0_0_12px_white]"
                                >
                                    →
                                </button>
                            </div>
                        </div>

                        {/* Neon Blue Line */}
                        <div className={`mt-6 h-[2px] bg-[#00e0ff] ${screenWidth <= 1000 ? "w-full" : "w-[60%] ml-0"}`}></div>

                        {/* Term List Below Flashcard */}
                        <div className={`mt-4 ${screenWidth > 1000 ? "w-[60%]" : "w-full"}`}>
                            <h3 className="text-lg text-[#00e0ff] drop-shadow-[0_0_8px_#00e0ff] font-semibold mb-2">{t.terminset} ({studySet.terms.length})</h3>

                            <div className="flex flex-col gap-2">
                                {studySet.terms.map((item, index) => (
                                    <div key={index}
                                        className={`bg-[#1a2e30] p-4  rounded-3xl flex items-center justify-between w-full transition-all duration-300
                    ${starredTerms[item.term] ? "border-2 border-[#ff7700] "
                                                : "border-2 border-[#00e0ff] "}`}
                                    >
                                        {/* Term */}
                                        <span
                                            className={`font-semibold w-1/3 transition duration-300
                                            ${starredTerms[item.term] ? "text-yellow-400" : "text-white"}`}
                                        >
                                            {item.term}
                                        </span>
                                        {/* Vertical Line */}
                                        <span
                                            className={`text-5xl px-1 font-light drop-shadow-[0_0_8px] 
                                              ${starredTerms[item.term] ? "text-[#ff7700] drop-shadow-[0_0_8px_#ff7700]" : "text-[#00e0ff] drop-shadow-[0_0_8px_#00e0ff]"}`}
                                        >
                                            |
                                        </span>

                                        {/* Definition */}
                                        <span
                                            className={`w-2/3 transition duration-300
                                              ${starredTerms[item.term] ? "text-[#ff7700]" : "text-[#00e0ff]"}`}
                                        >
                                            {item.definition}
                                        </span>
                                        {/* ⭐ Star & ✏️ Edit Buttons Container */}
                                        {isOwner && (
                                            <div className="relative flex items-center pl-8">
                                                {/* Star Button - Positioned at the top-right */}
                                                <button
                                                    onClick={() => toggleStar(item.term, studySet._id)}
                                                    className="absolute bottom-0 right-0 text-white text-xl"
                                                >
                                                    {isOwner && starredTerms[item.term] ? (
                                                        <i className="bi bi-star-fill text-[#ff7700] hover:text-[#ffaa33] drop-shadow-[0_0_8px_#ff7700]"></i>
                                                    ) : (
                                                        <i className="bi bi-star text-[#00e0ff] hover:text-[#ffaa33] drop-shadow-[0_0_8px_#00e0ff]"></i>
                                                    )}
                                                </button>

                                                {/* ✏️ Pencil Icon (Edit Button) - Positioned lower right */}
                                                <button
                                                    onClick={() => handleEditClick(item, index)}
                                                    className={`absolute top-0 right-0 text-xl transition duration-300 hover:text-[#ffaa33] hover:scale-110
                                                            ${starredTerms[item.term]
                                                            ? "text-[#ff7700] drop-shadow-[0_0_8px_#ff7700]"
                                                            : "text-[#00e0ff] drop-shadow-[0_0_8px_#00e0ff]"}`}
                                                >
                                                    <i className="bi bi-pencil-fill"></i>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Add or Remove Term Button */}

                            {isOwner && (
                                <div className="flex justify-center mt-4">
                                    <button
                                        onClick={() => {
                                            setIsEditingSet(studySet);
                                            setIsCreatingSet(false);
                                        }}
                                        className="px-6 py-2  rounded-3xl border border-[#ff7700] text-[#ff7700] transition duration-300 hover:bg-[#ff7700] hover:text-black shadow-md hover:shadow-[0_0_12px_#ff7700]"
                                    >
                                        {t.addorremove}
                                    </button>
                                </div>
                            )}


                        </div>
                    </div>
                )}
                {isEditing && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <div
                            className="bg-black p-6  rounded-3xl text-white relative border border-[#00e0ff] shadow-[0_0_16px_#00e0ff] z-50"
                            style={{ width: screenWidth > 450 ? "450px" : "100%" }}
                        >

                            <button
                                className="absolute top-2 right-2 text-[#ff7700] text-xl hover:scale-110 transition"
                                onClick={() => setIsEditing(false)}
                            >
                                ✖
                            </button>

                            <h2 className="text-2xl font-bold mb-4 text-[#ff7700]">{t.editterm}</h2>

                            <label className="block mb-2 text-[#00e0ff]">{t.term}</label>
                            <input
                                type="text"
                                className="bg-black text-[#ff7700] placeholder-[#00e0ff] px-4 py-2  rounded-3xl w-full mb-4 
                     border border-[#00e0ff] shadow-[0_0_12px_#00e0ff] focus:outline-none focus:ring-2 focus:ring-[#00e0ff]"
                                value={editTerm}
                                onChange={(e) => setEditTerm(e.target.value)}
                            />

                            <label className="block mb-2 text-[#00e0ff]">{t.definition}</label>
                            <textarea
                                className="bg-black text-[#ff7700] placeholder-[#00e0ff] px-4 py-2  rounded-3xl w-full mb-4 
                     border border-[#00e0ff] shadow-[0_0_12px_#00e0ff] focus:outline-none focus:ring-2 focus:ring-[#00e0ff]"
                                value={editDefinition}
                                onChange={(e) => setEditDefinition(e.target.value)}
                            />

                            <button
                                onClick={handleSaveEdit}
                                className="px-6 py-2  rounded-3xl border border-[#ff7700] text-[#ff7700] transition duration-300 
                     hover:bg-[#ff7700] hover:text-black shadow-md hover:shadow-[0_0_12px_#ff7700]"
                            >
                                {t.donebt}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
}