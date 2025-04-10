import { useState } from "react";

export default function Findterm({ studySet, setShowFillTest, screenWidth }) {
    const [answers, setAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const allCorrect = studySet.terms.every((_, index) => answers[`correct-${index}`]); // ✅ Check if all answers are correct

    const handleChange = (index, value) => {
        const correctTerm = studySet.terms[index].term.toLowerCase(); // ✅ Correct answer
        const termList = studySet.terms.map(t => t.term.toLowerCase()); // ✅ List of valid terms
        const isCorrect = value.toLowerCase() === correctTerm; // ✅ Check correctness
        const isInTermList = termList.includes(value.toLowerCase()); // ✅ Check if in term list

        setAnswers(prev => ({
            ...prev,
            [index]: value,
            [`correct-${index}`]: isCorrect, // ✅ Correct term status
            [`wrong-${index}`]: isInTermList && !isCorrect // ✅ Wrong but in term list
        }));
    };

    const handleSubmit = () => {
        setSubmitted(true);
    };

    return (
        <div className="flex flex-col text-white">
            {/* Title & Back Button */}
            <div className={`grid grid-cols-2 gap-50 py-5 ${screenWidth <= 770 ? "w-full" : "w-[60%] ml-0"}`}>
                <h3 className="text-xl">Tìm Từ Khoá</h3>
                <button
                    className="bg-yellow-500 px-4 py-2 text-sm rounded-lg hover:bg-yellow-400 transition duration-300"
                    onClick={() => setShowFillTest(false)}
                >
                    ← Quay Lại
                </button>
            </div>


            {/* Merged Definition & Input Field */}
            <div className={`flex flex-col gap-2 mb-2 ${screenWidth <= 770 ? "w-full px-4" : "w-[60%]"}`}>
                {studySet.terms.map((item, index) => (
                    <div key={index} className="bg-[#522136] p-4 rounded-lg flex items-center justify-between">
                        <span className="text-white">{item.definition}</span>

                        {/* Input Field with Hint Button */}
                        <div className="relative flex items-center w-1/3 min-w-[120px]" style={{ flexShrink: "0" }}>
                            <input
                                type="text"
                                className={`bg-[#3B0B24] text-white px-4 py-2 rounded-lg border-2 transition duration-300 w-full
                                ${answers[`correct-${index}`] ? "border-green-500" : (answers[`wrong-${index}`] ? "border-red-500" : "border-transparent")}
                                focus:outline-none focus:ring-0`
                                }
                                placeholder="Nhập thuật ngữ ..."
                                value={answers[index] || ""}
                                onChange={(e) => handleChange(index, e.target.value)}
                                disabled={answers[`correct-${index}`]}
                            />

                            {/* Hint Button (Lightbulb Icon) */}
                            <button
                                className={`absolute right-2 top-1/2 transform -translate-y-1/2 
                                    ${answers[`showHints-${index}`] ? "text-yellow-400" : "text-white"} 
                                    hover:text-yellow-400 active:text-yellow-500`}

                                onClick={() => setAnswers(prev => ({ ...prev, [`showHints-${index}`]: !prev[`showHints-${index}`] }))}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-lightbulb" viewBox="0 0 16 16">
                                    <path d="M2 6a6 6 0 1 1 10.174 4.31c-.203.196-.359.4-.453.619l-.762 1.769A.5.5 0 0 1 10.5 13a.5.5 0 0 1 0 1 .5.5 0 0 1 0 1l-.224.447a1 1 0 0 1-.894.553H6.618a1 1 0 0 1-.894-.553L5.5 15a.5.5 0 0 1 0-1 .5.5 0 0 1 0-1 .5.5 0 0 1-.46-.302l-.761-1.77a2 2 0 0 0-.453-.618A5.98 5.98 0 0 1 2 6m6-5a5 5 0 0 0-3.479 8.592c.263.254.514.564.676.941L5.83 12h4.342l.632-1.467c.162-.377.413-.687.676-.941A5 5 0 0 0 8 1" />
                                </svg>
                            </button>

                            {/* Hint Box */}
                            {answers[`showHints-${index}`] && (
                                <div className="absolute top-full left-0 mt-1 bg-[#3B0B24] text-white p-2 rounded-lg shadow-lg w-full z-10 border-2 border-yellow-500">
                                    {studySet.terms
                                        .filter(hint => !Object.values(answers).some(ans => typeof ans === "string" && ans.toLowerCase() === hint.term.toLowerCase()))
                                        .map((hint, hintIndex) => (
                                            <div
                                                key={hintIndex}
                                                className="px-4 py-2 hover:bg-[#6A2A3B] cursor-pointer"
                                                onClick={() => {
                                                    handleChange(index, hint.term);
                                                    setAnswers(prev => ({ ...prev, [`showHints-${index}`]: false })); // Hide hints after selection
                                                }}
                                            >
                                                {hint.term}
                                            </div>
                                        ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {/* Try Again Button */}
                <button
                    className={`mt-6 px-6 py-2 rounded-lg transition duration-300 
        ${allCorrect ? "bg-[#105422] hover:bg-[#0D3B1E]" : "bg-yellow-500 hover:bg-yellow-400"}
    `}
                    onClick={() => setAnswers({})} // ✅ Reset all inputs
                >
                    {allCorrect ? "Chúc mừng! Bạn muốn thử lại?" : "Thử Lại"}
                </button>
            </div>
        </div>
    );
}
