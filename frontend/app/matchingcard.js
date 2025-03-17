import { useState, useEffect } from "react";

export default function MatchingCard({ studySets, setShowMatchingTest, screenWidth }) {
    const [selectedItem, setSelectedItem] = useState(null); // Stores first selection (term/definition)
    const [matchedPairs, setMatchedPairs] = useState([]); // Stores correct matches
    const [shuffledDefinitions, setShuffledDefinitions] = useState([]);
    const [isComplete, setIsComplete] = useState(false); // ✅ Track completion
    const [incorrectPair, setIncorrectPair] = useState(null);
    const [disableHover, setDisableHover] = useState(false);
    useEffect(() => {
        setShuffledDefinitions([...studySets[0].terms].sort(() => Math.random() - 0.5));
    }, [studySets]); // Shuffle definitions when studySets change

    const handleSelection = (type, item) => {
        if (!selectedItem) {
            setSelectedItem({ ...item, type });
        } else {
            if (selectedItem.type !== type) {
                if (
                    (selectedItem.type === "term" && selectedItem.term === item.term) ||
                    (selectedItem.type === "definition" && selectedItem.definition === item.definition)
                ) {
                    // ✅ Correct Match: Move it to the matchedPairs list
                    const updatedMatchedPairs = [...matchedPairs, { term: selectedItem.term || item.term, definition: selectedItem.definition || item.definition }];
                    setMatchedPairs(updatedMatchedPairs);

                    // ✅ Remove the matched term and definition from the available selections
                    setShuffledDefinitions(shuffledDefinitions.filter(def => def.definition !== item.definition));
                    setTimeout(() => {
                        setMatchedPairs([...matchedPairs, { term: item.term, definition: item.definition }]);
                    }, 500);

                    // ✅ Check if all pairs are matched
                    if (updatedMatchedPairs.length === studySets[0].terms.length) {
                        setTimeout(() => setIsComplete(true), 500); // Delay for better UX
                    }
                } else {
                    // ❌ Incorrect Pair: Temporarily highlight them in red
                    setIncorrectPair({
                        term: selectedItem.type === "term" ? selectedItem.term : item.term,
                        definition: selectedItem.type === "definition" ? selectedItem.definition : item.definition
                    });

                    // Remove red highlight after 1 second
                    setTimeout(() => setIncorrectPair(null), 500);
                }
                setDisableHover(true);
                setTimeout(() => setDisableHover(false), 500);
                setSelectedItem(null);
            }
        }
    };

    const handleRetry = () => {
        setMatchedPairs([]);
        setSelectedItem(null);
        setShuffledDefinitions([...studySets[0].terms].sort(() => Math.random() - 0.5));
        setIsComplete(false);
    };

    return (
        <div className="flex flex-col p-6 text-white">
            <h2 className="text-3xl font-semibold mb-6">Fruits</h2>

            {/* Matching Test Title & Back Button */}
            <div className={`grid grid-cols-2 gap-40 py-5 ${screenWidth <= 770 ? "w-full" : "w-[60%] ml-0"}`}>
                <h3 className="text-xl">Matching Test</h3>
                <button
                    className="bg-yellow-500 px-4 py-2 text-sm rounded-lg hover:bg-yellow-400 transition duration-300"
                    onClick={() => setShowMatchingTest(false)}
                >
                    ← Back
                </button>
            </div>

            {/* Section for displaying matched pairs below the title */}
            <div className={`flex flex-col gap-2 mb-2 ${screenWidth <= 770 ? "w-full px-4" : "w-[60%]"}`}>
                {matchedPairs.map((pair, index) => (
                    <div key={index} className="bg-[#522136] p-4 rounded-lg flex items-center justify-between w-full">
                        <span className="font-semibold w-1/3">{pair.term}</span>
                        <span className="text-white text-5xl px-1 font-light">|</span> {/* Vertical Line */}
                        <span className="text-gray-300 w-2/3">{pair.definition}</span>
                    </div>
                ))}

                {/* ✅ Show Try Again button only when all matches are done */}
                {matchedPairs.length === studySets[0].terms.length && (
                    <button
                        className="mt-4 bg-yellow-500 px-6 py-2 rounded-lg text-sm hover:bg-yellow-400 transition duration-300"
                        onClick={handleRetry}
                    >
                        Try again!
                    </button>
                )}
            </div>


            {/* Matching Test Layout */}
            <div className={`grid ${screenWidth <= 770 ? "grid-cols-[30%_70%] w-full gap-1 px-2" : "grid-cols-[43%_57%] w-[60%] gap-0 ml-0"}`}>
                {/* Left Column - Terms */}
                <div className={`flex flex-col ${screenWidth <= 770 ? "gap-2 w-full" : "gap-4"}`}>
                    {studySets[0].terms
                        .filter(item => !matchedPairs.some(pair => pair.term === item.term))
                        .map((item, index) => (
                            <button
                                key={index}
                                className={`bg-[#6A2A3B] px-3 py-5 rounded-lg text-left 
                        ${screenWidth <= 770 ? "w-full" : "w-[120px]"} 
                        ${selectedItem?.term === item.term && selectedItem?.type === "term" ? "bg-yellow-500" : ""}
                        ${matchedPairs.some(pair => pair.term === item.term) ? "bg-green-600 pointer-events-none" : ""}
                        ${incorrectPair?.term === item.term && incorrectPair?.definition ? "bg-red-600" : ""}
                        ${!disableHover ? "hover:bg-yellow-500 transition duration-200" : ""}
                    `}
                                onClick={() => handleSelection("term", item)}
                            >
                                {item.term}  {/* 🔹 Removed the numbering */}
                            </button>
                        ))}
                </div>

                {/* Right Column - Definitions */}
                <div className={`flex flex-col gap-3 ${screenWidth <= 770 ? "w-full" : "w-full"}`}>
                    {shuffledDefinitions
                        .filter(item => !matchedPairs.some(pair => pair.definition === item.definition))
                        .map((item, index) => (
                            <button
                                key={index}
                                className={`bg-[#6A2A3B] px-4 py-3 rounded-lg text-left 
                        ${screenWidth <= 770 ? "w-full" : "w-auto"} 
                        ${selectedItem?.definition === item.definition && selectedItem?.type === "definition" ? "bg-yellow-500" : ""}
                        ${matchedPairs.some(pair => pair.definition === item.definition) ? "bg-green-600 pointer-events-none" : ""} 
                        ${incorrectPair?.definition === item.definition && incorrectPair?.term ? "bg-red-600" : ""}
                        ${!disableHover ? "hover:bg-yellow-500 transition duration-200" : ""}
                    `}
                                onClick={() => handleSelection("definition", item)}
                            >
                                {item.definition}
                            </button>
                        ))}
                </div>
            </div>
        </div>
    );
}
