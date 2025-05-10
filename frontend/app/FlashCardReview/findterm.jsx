import { useState, useEffect, useRef } from "react";

export default function Findterm({ studySet, setShowFillTest, screenWidth, t }) {
    const [answers, setAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const allCorrect = studySet.terms.every((_, index) => answers[`correct-${index}`]); // ✅ Check if all answers are correct
    const hintRefs = useRef([]); // To track refs for each hint dropdown
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
    useEffect(() => {
        const handleClickOutside = (event) => {
            hintRefs.current.forEach((ref, i) => {
                if (ref && !ref.contains(event.target)) {
                    setAnswers((prev) => {
                        const updated = { ...prev };
                        if (updated[`showHints-${i}`]) {
                            updated[`showHints-${i}`] = false;
                        }
                        return updated;
                    });
                }
            });
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSubmit = () => {
        setSubmitted(true);
    };

    return (
        <div className="flex flex-col text-white">
            {/* Title & Back Button */}
            <div className={`flex justify-between items-center py-5 ${screenWidth <= 1000 ? "w-full" : "w-[70%] ml-0"}`}>
                <h3 className="text-xl text-[#00e0ff]">
                    {t.fillIn}
                </h3>

                <button
                    className="w-[120px] px-4 py-2 text-sm rounded-3xl border-2 border-[#ff7700] text-[#ff7700] hover:bg-[#ff7700] hover:text-black transition duration-300"
                    onClick={() => setShowFillTest(false)}
                >
                    {t.backbtn}
                </button>
            </div>

            <div className={`flex flex-col gap-2 mb-2 ${screenWidth <= 1000 ? "w-full " : "w-[70%]"}`}>
                {studySet.terms.map((item, index) => (
                    <div
                        key={index}
                        ref={(el) => (hintRefs.current[index] = el)}
                        className={`p-4 rounded-3xl flex items-center justify-between mb-2 transition duration-300
                        ${answers[`correct-${index}`]
                                ? "bg-black p-4 rounded-3xl flex items-center justify-between border-2 border-[#00ff88] mb-2"
                                : "bg-black p-4 rounded-3xl flex items-center justify-between border-2 border-[#00e0ff] mb-2"
                            }`}
                    >

                        <span
                            className={` transition duration-300
                                    ${answers[`correct-${index}`]
                                    ? "text-[#00ff88] "
                                    : "text-[#00e0ff]"
                                }`}
                        >
                            {item.definition}
                        </span>


                        {/* Input Field with Hint Button */}
                        <div className="relative flex items-center w-1/3 min-w-[120px]" style={{ flexShrink: "0" }}>
                            <input
                                type="text"
                                className={`bg-black text-[#00e0ff] placeholder-[#ff7700] px-4 py-2 rounded-3xl w-full transition duration-300
                                      border-2  focus:outline-[#00e0ff] focus:ring-2 focus:ring-[#00e0ff] 
                                     ${answers[`correct-${index}`] ? "border-[#00ff88] text-[#00ff88]" : ""}
                                     ${answers[`wrong-${index}`] ? "border-[#ff0033] text-[#ff0033]" : ""}
                                        `}
                                placeholder={t.whatterm}
                                value={answers[index] || ""}
                                onChange={(e) => handleChange(index, e.target.value)}
                                disabled={answers[`correct-${index}`]}
                            />

                            {/* Hint Button */}
                            <button
                                className={`absolute right-2 top-1/2 transform -translate-y-1/2 transition duration-300
                                      ${answers[`showHints-${index}`]
                                        ? "text-[#ff7700] "
                                        : "text-[#00e0ff] hover:text-[#ffaa33]"
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
                                <div className="absolute top-full left-0 mt-1 bg-black text-[#ff7700] p-2 rounded-3xl w-full z-10 border border-[#ffaa33]">
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
                                                className="px-4 py-2 hover:bg-[#ffaa33] rounded-3xl hover:text-black transition cursor-pointer"
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
                <button
                    className={`mt-6 px-6 py-2 rounded-3xl transition duration-300 font-semibold
                              ${allCorrect
                            ? "bg-[#105422] text-[#00ff88] border-2 border-[#00ff88] hover:bg-[#0D3B1E]"
                            : "bg-black text-[#ff7700] border-2 border-[#ff7700] hover:bg-[#ff7700] hover:text-black"}
                             `}
                    onClick={() => setAnswers({})} // ✅ Reset all inputs
                >
                    {allCorrect ? t.congradbtn : t.tryagainbtn}
                </button>

            </div>
        </div>
    );
}
