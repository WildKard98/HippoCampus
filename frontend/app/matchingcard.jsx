import { useState, useEffect } from "react";

export default function MatchingCard({ studySet, setShowMatchingTest, screenWidth, setSelectedSet }) {
    const [selectedItem, setSelectedItem] = useState(null); // Stores first selection (term/definition)
    const [matchedPairs, setMatchedPairs] = useState([]); // Stores correct matches
    const [shuffledDefinitions, setShuffledDefinitions] = useState([]);
    const [isComplete, setIsComplete] = useState(false); // ✅ Track completion
    const [incorrectPair, setIncorrectPair] = useState(null);
    const [disableHover, setDisableHover] = useState(false);

    useEffect(() => {
        setShuffledDefinitions([...studySet.terms].sort(() => Math.random() - 0.5));
    }, [studySet]); // Shuffle definitions when studySet change

    const handleSelection = (type, item) => {
        if (!selectedItem || selectedItem.type === type) {
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
                    if (updatedMatchedPairs.length === studySet.terms.length) {
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
        setShuffledDefinitions([...studySet.terms].sort(() => Math.random() - 0.5));
        setIsComplete(false);
    };

    return (
        <div className="flex flex-col text-white">

            {/* Matching Test Title & Back Button */}
            <div className={`grid grid-cols-2 gap-30 py-5 ${screenWidth <= 770 ? "w-full" : "w-[60%] ml-0"}`}>
                <h3 className="text-xl text-[#00e0ff] drop-shadow-[0_0_6px_#00e0ff] font-bold">Nối Từ</h3>

                <button
                    className="px-4 py-2  text-sm rounded-lg border border-2 border-[#ff7700] shadow-[0_0_20px_#ff7700] text-[#ff7700] transition duration-300 
               hover:bg-[#ff7700] hover:text-black shadow-md hover:shadow-[0_0_12px_#ff7700]"
                    onClick={() => setShowMatchingTest(false)}
                >
                    ← Quay Lại
                </button>
            </div>


            {/* Section for displaying matched pairs below the title */}
            <div className={`flex flex-col gap-2 mb-2 ${screenWidth <= 770 ? "w-full px-4" : "w-[60%]"}`}>
                {matchedPairs.map((pair, index) => (
                    <div
                        key={index}
                        className="bg-black p-4 rounded-lg flex items-center justify-between w-full 
                 border border-[#00ff88] shadow-[0_0_12px_#00ff88]"
                    >
                        <span className="font-semibold w-1/3 text-[#00ff88] ">
                            {pair.term}
                        </span>
                        <span className="text-[#00ff88] text-5xl px-1 font-light drop-shadow-[0_0_6px_#00e0ff]">
                            |
                        </span>
                        <span className="w-2/3 text-[#00ff88] ">
                            {pair.definition}
                        </span>
                    </div>
                ))}

                {/* ✅ Show Try Again button only when all matches are done */}
                {matchedPairs.length === studySet.terms.length && (
                    <button
                        className="mt-4 px-6 py-2 rounded-lg text-sm bg-[#105422] text-[#00ff88] border border-[#00ff88] shadow-[0_0_12px_#00ff88] 
                 hover:bg-[#0D3B1E]"
                        onClick={handleRetry}
                    >
                        🎉 Chúc mừng! Bạn có muốn thử lại?
                    </button>
                    
                )}
            </div>



            {/* Matching Test Layout */}
            <div className={`grid ${screenWidth <= 770 ? "grid-cols-[30%_70%] w-full" : "grid-cols-[45%_55%] w-[60%]"}`}>
                {/* Left Column - Terms */}
                <div className={`flex flex-col ${screenWidth <= 770 ? "gap-2 w-full px-1" : "gap-4"}`}>
                    {studySet.terms
                        .filter(item => !matchedPairs.some(pair => pair.term === item.term))
                        .map((item, index) => (
                            <button
                                key={index}
                                className={`text-[#ff7700] px-3 py-5 rounded-lg text-left 
                        ${screenWidth <= 770 ? "w-full" : "w-[120px]"} 
                        ${selectedItem?.term === item.term && selectedItem?.type === "term" ? "bg-yellow-500 text-black" : ""}
                        ${matchedPairs.some(pair => pair.term === item.term) ? "bg-green-600 pointer-events-none" : ""}
                        ${incorrectPair?.term === item.term && incorrectPair?.definition ? "bg-red-600 border border-red-600 text-black shadow-[0_0_12px_red-600]" : ""}
                        ${!disableHover ? "rounded-lg bg-[#45311f] border border-[#ff7700] text-[#ff7700] hover:bg-[#ff7700] hover:text-black shadow-md hover:shadow-[0_0_12px_#ff7700] transition duration-200" : "border border-[#ff7700]"}
                    `}
                                onClick={() => handleSelection("term", item)}
                            >
                                {item.term}  {/* 🔹 Removed the numbering */}
                            </button>
                        ))}
                </div>

                {/* Right Column - Definitions */}
                <div className={`flex flex-col gap-3 ${screenWidth <= 770 ? "w-full px-1" : "w-full"}`}>
                    {shuffledDefinitions
                        .filter(item => !matchedPairs.some(pair => pair.definition === item.definition))
                        .map((item, index) => (
                            <button
                                key={index}
                                className={`text-[#00e0ff] px-4 py-3 rounded-lg text-left 
                        ${screenWidth <= 770 ? "w-full" : "w-auto"} 
                        ${selectedItem?.definition === item.definition && selectedItem?.type === "definition" ? "bg-[#38b8c9] text-black" : ""}
                        ${matchedPairs.some(pair => pair.definition === item.definition) ? "bg-green-600 pointer-events-none" : ""} 
                        ${incorrectPair?.definition === item.definition && incorrectPair?.term ? "bg-red-600 border border-red-600 text-black shadow-[0_0_12px_red-600]" : ""}
                        ${!disableHover ? "ounded-lg bg-[#1a2e30] border border-[#00e0ff] text-[#00e0ff] hover:bg-[#00e0ff] hover:text-black shadow-md hover:shadow-[0_0_12px_#00e0ff] transition duration-200" : "border border-[#00e0ff]"}
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
