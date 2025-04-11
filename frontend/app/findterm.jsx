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
                <h3 className="text-xl text-[#00e0ff] drop-shadow-[0_0_6px_#00e0ff]">Tìm Từ Khoá</h3>
                <button
                    className="px-4 py-2 text-sm rounded-lg border border-[#ff7700] text-[#ff7700] hover:bg-[#ff7700] hover:text-black transition duration-300 shadow-md hover:shadow-[0_0_12px_#ff7700]"
                    onClick={() => setShowFillTest(false)}
                >
                    ← Quay Lại
                </button>
            </div>


            <div className={`flex flex-col gap-2 mb-2 ${screenWidth <= 770 ? "w-full px-4" : "w-[60%]"}`}>
                {studySet.terms.map((item, index) => (
                    <div
                        key={index}
                        className="bg-black p-4 rounded-lg flex items-center justify-between border border-[#00e0ff] shadow-[0_0_12px_#00e0ff] mb-2"
                    >
                        <span className="text-[#00e0ff] drop-shadow-[0_0_8px_#00e0ff]">{item.definition}</span>

                        {/* Input Field with Hint Button */}
                        <div className="relative flex items-center w-1/3 min-w-[120px]" style={{ flexShrink: "0" }}>
                            <input
                                type="text"
                                className={`bg-black text-[#00e0ff] placeholder-[#ff7700] px-4 py-2 rounded-lg w-full transition duration-300
          border-2 shadow-[0_0_8px_#00e0ff] focus:outline-[#00e0ff] focus:ring-2 focus:ring-[#00e0ff] 
          ${answers[`correct-${index}`] ? "border-[#00ff88] text-[#00ff88] shadow-[0_0_12px_#00ff88]" : ""}
          ${answers[`wrong-${index}`] ? "border-[#ff0033] text-[#ff0033] shadow-[0_0_12px_#ff0033]" : ""}
        `}
                                placeholder="Nhập thuật ngữ ..."
                                value={answers[index] || ""}
                                onChange={(e) => handleChange(index, e.target.value)}
                                disabled={answers[`correct-${index}`]}
                            />

                            {/* Hint Button */}
                            <button
                                className={`absolute right-2 top-1/2 transform -translate-y-1/2 transition duration-300
          ${answers[`showHints-${index}`]
                                        ? "text-[#ff7700] drop-shadow-[0_0_8px_#ff7700]"
                                        : "text-[#00e0ff] hover:text-[#ffaa33] drop-shadow-[0_0_8px_#00e0ff]"
                                    }`}
                                onClick={() =>
                                    setAnswers((prev) => ({
                                        ...prev,
                                        [`showHints-${index}`]: !prev[`showHints-${index}`],
                                    }))
                                }
                            >
                                <i className="bi bi-lightbulb-fill text-xl"></i>
                            </button>

                            {/* Hint Box */}
                            {answers[`showHints-${index}`] && (
                                <div className="absolute top-full left-0 mt-1 bg-black text-[#ff7700] p-2 rounded-lg shadow-[0_0_12px_#ffaa33] w-full z-10 border border-[#ffaa33]">
                                    {studySet.terms
                                        .filter(
                                            (hint) =>
                                                !Object.values(answers).some(
                                                    (ans) => typeof ans === "string" && ans.toLowerCase() === hint.term.toLowerCase()
                                                )
                                        )
                                        .map((hint, hintIndex) => (
                                            <div
                                                key={hintIndex}
                                                className="px-4 py-2 hover:bg-[#ffaa33] hover:text-black transition cursor-pointer"
                                                onClick={() => {
                                                    handleChange(index, hint.term);
                                                    setAnswers((prev) => ({ ...prev, [`showHints-${index}`]: false }));
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
                {/* Try Again Button */}
                <button
                    className={`mt-6 px-6 py-2 rounded-lg transition duration-300 font-semibold
    ${allCorrect
                            ? "bg-[#105422] text-[#00ff88] border border-[#00ff88] shadow-[0_0_12px_#00ff88] hover:bg-[#0D3B1E]"
                            : "bg-black text-[#ff7700] border border-[#ff7700] shadow-[0_0_12px_#ff7700] hover:bg-[#ff7700] hover:text-black"}
  `}
                    onClick={() => setAnswers({})} // ✅ Reset all inputs
                >
                    {allCorrect ? "🎉 Chúc mừng! Bạn muốn thử lại?" : "Thử Lại!"}
                </button>

            </div>
        </div>
    );
}
