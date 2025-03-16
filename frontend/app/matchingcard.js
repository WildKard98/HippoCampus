import { useState, useEffect } from "react";

export default function MatchingCard({ studySets, setShowMatchingTest }) {
    const [selectedItem, setSelectedItem] = useState(null); // Stores first selection (term/definition)
    const [matchedPairs, setMatchedPairs] = useState([]); // Stores correct matches
    const [shuffledDefinitions, setShuffledDefinitions] = useState([]);
    const [isComplete, setIsComplete] = useState(false); // ✅ Track completion
    const [incorrectPair, setIncorrectPair] = useState(null);
    const [disableHover, setDisableHover] = useState(false);

    const [screenWidth, setScreenWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1024); // Default to 1024px to prevent small width issues
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

                    const newMatchedPairs = [...matchedPairs, { term: item.term, definition: item.definition }];
                    setMatchedPairs(newMatchedPairs);

                    // ✅ Check if all pairs are matched
                    if (newMatchedPairs.length === studySets[0].terms.length) {
                        setTimeout(() => setIsComplete(true), 500); // Delay for better UX
                    }
                } else {
                    // ❌ Incorrect Pair: Temporarily highlight them in red
                    setIncorrectPair({ term: selectedItem.term, definition: item.definition });

                    // Remove red highlight after 1 second
                    setTimeout(() => setIncorrectPair(null), 1000);
                }
                setDisableHover(true);
                setTimeout(() => setDisableHover(false), 1000);
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
            <div className={`grid grid-cols-2 gap-60 py-5 ${screenWidth <= 770 ? "w-full" : "w-[60%] ml-0"}`}>
                <h3 className="text-xl">Matching Test</h3>
                <button
                    className="bg-yellow-500 px-4 py-2 text-sm rounded-lg hover:bg-yellow-400 transition duration-300"
                    onClick={() => setShowMatchingTest(false)}
                >
                    ← Back
                </button>
            </div>

            {/* Matching Test Layout */}
            <div className={`grid grid-cols-2 gap-4 ${screenWidth <= 770 ? "w-full" : "w-[60%] ml-0"}`}>
                {/* Left Column - Terms */}
                <div className="flex flex-col gap-4">
                    {studySets[0].terms.map((item, index) => (
                        <button
                            key={index}
                            className={`bg-[#6A2A3B] px-1 py-4 rounded-lg text-left w-[120px] 
                ${selectedItem?.term === item.term && selectedItem?.type === "term" ? "bg-yellow-500" : ""}
                ${matchedPairs.some(pair => pair.term === item.term) ? "bg-green-600 pointer-events-none" : ""}
                ${incorrectPair?.term === item.term && incorrectPair?.definition ? "bg-red-600" : ""}
                ${!disableHover ? "hover:bg-yellow-500 transition duration-200" : ""}
               `}
                            onClick={() => handleSelection("term", item)}
                        >
                            {index + 1}. {item.term}
                        </button>
                    ))}
                </div>

                {/* Right Column - Definitions */}
                <div className="flex flex-col gap-4">
                    {shuffledDefinitions.map((item, index) => (
                        <button
                            key={index}
                            className={`bg-[#6A2A3B] px-6 py-3 rounded-lg text-left 
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
                {/* ✅ Completion Pop-up */}
                {isComplete && (
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#2D0E20] p-6 rounded-lg text-center shadow-lg">
                        <h3 className="text-2xl font-bold mb-4">You did it!</h3>
                        <div className="flex flex-col gap-3">
                            <button
                                className="bg-yellow-500 px-6 py-2 rounded-lg text-sm hover:bg-yellow-400 transition duration-300"
                                onClick={handleRetry}
                            >
                                Try again!
                            </button>
                            <button
                                className="bg-[#6A2A3B] px-6 py-2 rounded-lg text-sm hover:bg-[#8A3E4B] transition duration-300"
                                onClick={() => setShowMatchingTest(false)}
                            >
                                Back
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
