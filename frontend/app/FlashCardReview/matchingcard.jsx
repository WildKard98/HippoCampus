import { useState, useEffect } from "react";
import React from "react";

export default function MatchingCard({ studySet, setShowMatchingTest, screenWidth, setSelectedSet, t }) {
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
            <div className={`flex justify-between items-center py-2 ${screenWidth <= 1000 ? "w-full" : "w-[60%] ml-0"}`}>
                <h3 className="text-xl text-[#00e0ff] drop-shadow-[0_0_6px_#00e0ff] font-bold">
                    {t.matchingcard}
                </h3>

                <button
                    className="w-[120px] px-4 py-2 text-sm rounded-3xl border border-2 border-white shadow-[0_0_20px_white] text-white transition duration-300 
                     hover:bg-white hover:text-black shadow-md hover:shadow-[0_0_12px_white]"
                    onClick={() => setShowMatchingTest(false)}
                >
                    {t.backbtn}
                </button>
            </div>

            {/* Section for displaying matched pairs below the title */}
            <div className={`flex flex-col gap-2 mb-3 ${screenWidth <= 1000 ? "w-full " : "w-[60%]"}`}>
                {matchedPairs.map((pair, index) => (
                    <div
                        key={index}
                        className="bg-black p-4  rounded-3xl flex items-center justify-between w-full 
                 border border-[#00ff88] "
                    >
                        <span className="font-semibold w-1/3 text-[#00ff88] ">
                            {pair.term}
                        </span>
                        <span className="text-[#00ff88] text-5xl px-1 font-light ">
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
                        className="mt-4 px-6 py-2  rounded-3xl text-sm bg-[#105422] text-[#00ff88] border border-[#00ff88] shadow-[0_0_12px_#00ff88] 
                 hover:bg-[#0D3B1E]"
                        onClick={handleRetry}
                    >
                        {t.congradbtn}
                    </button>

                )}
            </div>



            {/* Matching Test Layout */}
            <div className={`grid ${screenWidth <= 1000 ? "grid-cols-[30%_70%] w-full" : "grid-cols-[35%_65%] w-[60%]"} gap-3 pr-3`}>
                {studySet.terms
                    .filter(item => !matchedPairs.some(pair => pair.term === item.term))
                    .map((item, index) => {
                        const def = shuffledDefinitions.find(d => d.term === item.term);
                        return (
                            <React.Fragment key={`pair-${index}`}>
                                {/* Left: Term */}
                                <button
                                    className={`w-full text-[#ff7700] px-4 py-3 rounded-3xl text-left 
                                ${selectedItem?.term === item.term && selectedItem?.type === "term" ? "bg-yellow-500 text-black" : ""}
                                ${incorrectPair?.term === item.term ? "bg-red-600 border border-red-600 text-black shadow-[0_0_12px_red-600]" : ""}
                                ${!disableHover ? "bg-[#45311f] border border-[#ff7700] hover:bg-[#ff7700] hover:text-black shadow-md hover:shadow-[0_0_12px_#ff7700]" : "bg-[#45311f] border border-[#ff7700]"}
                                transition duration-200`}
                                    onClick={() => handleSelection("term", item)}
                                >
                                    {item.term}
                                </button>

                                {/* Right: Definition */}
                                {def ? (
                                    <button
                                        className={`w-full text-[#00e0ff] px-4 py-3 rounded-3xl text-left 
                                  ${selectedItem?.definition === def.definition && selectedItem?.type === "definition" ? "bg-[#38b8c9] text-black" : ""}
                                  ${incorrectPair?.definition === def.definition ? "bg-red-600 border border-red-600 text-black shadow-[0_0_12px_red-600]" : ""}
                                  ${!disableHover ? "bg-[#1a2e30] border border-[#00e0ff] hover:bg-[#00e0ff] hover:text-black shadow-md hover:shadow-[0_0_12px_#00e0ff]" : "bg-[#1a2e30] border border-[#00e0ff]"}
                                  transition duration-200`}
                                        onClick={() => handleSelection("definition", def)}
                                    >
                                        {def.definition}
                                    </button>
                                ) : (
                                    <div className="w-full" />
                                )}
                            </React.Fragment>
                        );
                    })}

            </div>

        </div>
    );
}
