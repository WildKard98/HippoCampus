"use client";
import React from "react";
import { useState, useEffect } from "react";

export default function GeneratePuzzle({ screenWidth, onBack, onSaveStudySet,t }) {
    const [puzzleTitle, setPuzzleTitle] = React.useState("");
    const [question, setQuestion] = React.useState("");
    const [answer, setAnswer] = React.useState("");
    const [qnaList, setQnaList] = React.useState([]);
    const [editAnswer, setEditAnswer] = useState("");
    const [editQuestion, setEditQuestion] = useState("");
    const [editingIndex, setEditingIndex] = useState(null); // Index of the QnA being edited
    const [isEditing, setIsEditing] = useState(false);
    const MAX_WORDS = 20; // or any number you feel is good
    const MAX_LETTERS = 15; // or whatever max you want

    // Open the edit modal
    const handleEditClick = (termObj, index) => {
        setEditAnswer(termObj.answer);       // ✅ Pre-fill answer
        setEditQuestion(termObj.question);   // ✅ Pre-fill question
        setEditingIndex(index);              // ✅ Track index
        setIsEditing(true);                  // ✅ Open modal
    };

    // Save changes
    const handleSaveEdit = () => {
        if (editingIndex !== null) {
            const updatedQnA = [...qnaList];  // ✅ Copy the qnaList
            updatedQnA[editingIndex] = {
                answer: editAnswer,          // ✅ Use new edited values
                question: editQuestion
            };
            setQnaList(updatedQnA);          // ✅ Save back to state
        }
        setIsEditing(false);                 // ✅ Close modal
    };
    // Get clue number for a specific grid cell
    const getClueNumber = (row, col) => {
        const match = placedWords.find((entry) => {
            if (!entry || !entry.start) return false;
            return entry.start.row === row && entry.start.col === col;
        });

        return match?.clueNumber ?? null;

    };
    const [grid, setGrid] = useState([]);
    const [placedWords, setPlacedWords] = useState([]);
    const containerRef = React.useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const handleMouseDown = (e) => {
        setIsDragging(true);
        setDragStart({
            x: e.clientX,
            y: e.clientY,
        });
    };

    const handleMouseMove = (e) => {
        if (!isDragging || !containerRef.current) return;

        const dx = e.clientX - dragStart.x;
        const dy = e.clientY - dragStart.y;

        containerRef.current.scrollLeft -= dx;
        containerRef.current.scrollTop -= dy;

        setDragStart({
            x: e.clientX,
            y: e.clientY,
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        const generate = async () => {
            const res = await fetch("/api/generate-puzzle", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    qnaList: qnaList.map(qna => ({
                        question: qna.question,
                        answer: qna.answer.replace(/\s+/g, "").toUpperCase()  // ✅ strip spaces + uppercase
                    }))
                })

            });

            if (!res.ok) {
                console.warn("Puzzle generation failed:", res.status);
                return;
            }

            const data = await res.json();
            setGrid(data.grid);
            setPlacedWords(data.placedWords);

            // 📦 Auto scroll to center
            if (containerRef.current) {
                const container = containerRef.current;
                setTimeout(() => {
                    container.scrollLeft = container.scrollWidth / 2 - container.clientWidth / 2;
                    container.scrollTop = container.scrollHeight / 2 - container.clientHeight / 2;
                }, 50);
            }
        };

        generate();
    }, [qnaList]);


    return (
        <div className="text-white font-[Itim]">
            <button
                className="mb-4 px-4 py-2 rounded border border-white text-white transition duration-300 
             hover:bg-white hover:text-black shadow-md hover:shadow-[0_0_12px_white]"
                onClick={onBack}
            >
                {t.backbtn}
            </button>

            <h1 className="text-3xl font-bold mb-6 text-[#ff7700] drop-shadow-[0_0_12px_#ff7700]">
                {t.createpuzzle}
            </h1>

            {isEditing ? (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div
                        className="bg-black p-6 rounded-lg text-white relative border border-[#00e0ff] shadow-[0_0_16px_#00e0ff]"
                        style={{ width: screenWidth > 450 ? "450px" : "100%" }}
                    >
                        <button
                            className="absolute top-2 right-2 text-[#ff7700] text-xl hover:scale-110 transition"
                            onClick={() => setIsEditing(false)}
                        >
                            ✖
                        </button>

                        <h2 className="text-2xl font-bold mb-4 text-[#ff7700]">{t.editterm}</h2>

                        <label className="block mb-2 text-[#00e0ff]">{t.question}</label>
                        <input
                            type="text"
                            className="bg-black text-white placeholder-white  px-4 py-2 rounded-lg w-full mb-4 
                     border border-[#00e0ff] shadow-[0_0_12px_#00e0ff] focus:outline-none focus:ring-2 focus:ring-[#00e0ff]"
                            value={editAnswer}
                            onChange={(e) => setEditAnswer(e.target.value)}
                        />

                        <label className="block mb-2 text-[#00e0ff]">{t.answer}</label>
                        <textarea
                            className="bg-black text-white  placeholder-white  px-4 py-2 rounded-lg w-full mb-4 
                     border border-[#00e0ff] shadow-[0_0_12px_#00e0ff] focus:outline-none focus:ring-2 focus:ring-[#00e0ff]"
                            value={editQuestion}
                            onChange={(e) => setEditQuestion(e.target.value)}
                        />

                        <button
                            onClick={handleSaveEdit}
                            className="px-6 py-2 rounded-lg border border-[#ff7700] text-[#ff7700] transition duration-300 
                     hover:bg-[#ff7700] hover:text-black shadow-md hover:shadow-[0_0_12px_#ff7700]"
                        >
                            {t.donebt}
                        </button>
                    </div>
                </div>

            ) : (
                <div className="flex flex-col md:flex-row gap-2 w-full justify-start">

                    {/* Left Column */}
                    <div className={`flex flex-col gap-2 ${screenWidth > 770 ? "w-full md:w-2/5 max-w-[450px]" : "w-full"}`}>
                        {/* Box 1: Title Input + Create Button */}
                        <div className="bg-black p-4 rounded-lg border border-[#00e0ff] shadow-[0_0_12px_#00e0ff]">
                            <input
                                type="text"
                                placeholder={t.entertitle}
                                value={puzzleTitle}
                                onChange={(e) => setPuzzleTitle(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg text-white bg-black placeholder-white  border border-[#00e0ff] shadow-[0_0_12px_#00e0ff] focus:outline-none focus:ring-2 focus:ring-[#00e0ff]"
                            />
                            <button
                                onClick={() => {
                                    if (!puzzleTitle.trim()) {
                                        alert("Please enter a title before saving.");
                                        return;
                                    }
                                    if (qnaList.length === 0) {
                                        alert("Add at least one question & answer.");
                                        return;
                                    }

                                    const studySet = {
                                        title: puzzleTitle.trim(),
                                        description: "", // optional
                                        terms: qnaList.map((qna) => ({
                                            term: qna.answer,
                                            definition: qna.question,
                                        })),
                                    };

                                    if (onSaveStudySet) {
                                        onSaveStudySet(studySet); // ✅ Send to parent
                                    }

                                    if (onBack) onBack(); // ✅ Go back to main screen
                                }}
                                className="w-full mt-2 py-2 rounded-lg border border-[#ff7700] text-[#ff7700] transition duration-300 
                                      hover:bg-[#ff7700] hover:text-black shadow-md hover:shadow-[0_0_12px_#ff7700]"
                            >
                                {t.createbtn}
                            </button>

                        </div>


                        {/* Box 2: Question + Answer Input */}
                        <div className="bg-black p-4 rounded-lg border border-[#00e0ff] shadow-[0_0_12px_#00e0ff]">
                            <label className="block mb-2 text-[#00e0ff]">{t.question}</label>
                            <input
                                type="text"
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                placeholder={t.enterquestion}
                                className="w-full px-4 py-2 rounded-lg text-white bg-black placeholder-white border border-[#00e0ff] mb-4 
                                 shadow-[0_0_12px_#00e0ff] focus:outline-none focus:ring-2 focus:ring-[#00e0ff]"
                            />

                            <hr className="border-[#00e0ff] my-2" />

                            <label className="block mb-2 text-[#00e0ff]">{t.answer}</label>
                            <input
                                type="text"
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                placeholder={t.enteranswer}
                                className="w-full px-4 py-2 rounded-lg text-white bg-black placeholder-white border border-[#00e0ff] 
                                 shadow-[0_0_12px_#00e0ff] focus:outline-none focus:ring-2 focus:ring-[#00e0ff]"
                            />

                            <button
                                onClick={() => {
                                    const cleanQuestion = question.trim();
                                    const cleanAnswer = answer.trim().toUpperCase();

                                    if (qnaList.length >= MAX_WORDS) {
                                        alert(`You’ve reached the max limit of ${MAX_WORDS} words.`);
                                        return;
                                    }
                                    if (cleanAnswer.length > MAX_LETTERS) {
                                        alert(`Word is too long. Max allowed is ${MAX_LETTERS} letters.`);
                                        return;
                                    }
                                    if (cleanQuestion && cleanAnswer) {
                                        const updatedList = [...qnaList, { question: cleanQuestion, answer: cleanAnswer }];
                                        setQnaList(updatedList);
                                        setQuestion("");
                                        setAnswer("");
                                    }
                                }}
                                className="mt-4 px-6 py-2 rounded-lg border border-[#ff7700] text-[#ff7700] transition duration-300 
                                       hover:bg-[#ff7700] hover:text-black shadow-md hover:shadow-[0_0_12px_#ff7700]"
                            >
                                {t.addbt}
                            </button>
                        </div>


                        {/* Show QnA box */}
                        <div className="bg-black p-4 rounded-lg overflow-y-auto border border-[#00e0ff] shadow-[0_0_12px_#00e0ff]">
                            {qnaList.length === 0 ? (
                                <p className="text-[#00e0ff] text-center py-4">{t.enteryet}</p>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    {qnaList.map((item, index) => (
                                        <div
                                            key={index}
                                            className="bg-black p-4 rounded-lg flex items-center justify-between w-full 
                                                 border border-[#00e0ff] shadow-[0_0_12px_#00e0ff]"
                                        >
                                            <div className="flex items-center gap-2 w-full">
                                                {/* Answer (1/3) */}
                                                <div
                                                    className="w-1/3 px-1 py-4 text-white drop-shadow-[0_0_8px_white] font-bold text-center break-words overflow-hidden"
                                                    style={{
                                                        fontSize: item.answer.length > 10 ? "0.7rem" : "0.9rem",
                                                        wordBreak: "break-word",
                                                        lineHeight: "1.2",
                                                        maxHeight: "3.5rem",
                                                    }}
                                                >
                                                    {item.answer.charAt(0).toUpperCase() + item.answer.slice(1).toLowerCase()}
                                                </div>

                                                {/* Divider */}
                                                <div className="w-[2px] h-10 bg-[#00e0ff] mx-2 rounded-full shadow-[0_0_8px_#00e0ff]" />

                                                {/* Question (2/3) */}
                                                <div className="w-2/3 px-1 py-4 text-[#00e0ff] drop-shadow-[0_0_8px_#00e0ff] text-sm break-words"
                                                >
                                                    {item.question}
                                                </div>
                                            </div>

                                            {/* ✏️ Edit Buttons */}
                                            <div className="relative flex items-center pl-8">
                                                {/* 🗑️ Trash Button */}
                                                <button
                                                    onClick={() => {
                                                        const updatedList = qnaList.filter((_, i) => i !== index);
                                                        setQnaList(updatedList);
                                                    }}
                                                    className="absolute top-0 right-0 text-[#00e0ff] transition duration-300 hover:text-[#ff0033] hover:scale-110 drop-shadow-[0_0_8px_#00e0ff]"
                                                >
                                                    <i className="bi bi-trash"></i>
                                                </button>

                                                {/* ✏️ Pencil Button */}
                                                <button
                                                    onClick={() => handleEditClick(item, index)}
                                                    className="absolute bottom-1 right-0 text-[#00e0ff] transition duration-300 hover:text-[#ffaa33] hover:scale-110 drop-shadow-[0_0_8px_#00e0ff]"
                                                >
                                                    <i className="bi bi-pencil-fill"></i>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}


                        </div>
                    </div>

                    {/* Right Column */}
                    {/* Puzzle look */}
                    <div className={`bg-black p-2 rounded-lg ${screenWidth > 770 ? "md:w-3/5 flex flex-col border-2 border-[#00e0ff] shadow-[0_0_20px_#00e0ff] gap-2 max-w-[750px]" : "w-full md:w-3/5 flex flex-col  border-2 border-[#00e0ff] shadow-[0_0_20px_#00e0ff] gap-2"}`}>
                        {/* Puzzle Title Box */}
                        <div className="flex justify-center ">
                            <div className="bg-black text-white p-2 rounded-md font-semibold text-center text-2xl">
                                {puzzleTitle || t.untitle}
                            </div>
                        </div>


                        {/* Divider Line */}
                        <hr className="border-[#00e0ff] shadow-[0_0_20px_#ff7700]" />

                        {/* THE PUZZLE */}

                        <div
                            className="w-full h-[420px] overflow-auto"
                            style={{
                                cursor: isDragging ? "grabbing" : "grab",
                                maxWidth: "100%",
                                maxHeight: "420px",
                                border: "1px solid #00e0ff", // optional for visual clarity
                                position: "relative",
                            }}
                            ref={containerRef}
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                        >
                            <div
                                className="flex flex-col items-start gap-px w-fit max-w-full"
                                style={{
                                    transform: `scale(${grid.length > 20 ? 1 : grid.length > 10 ? 1.2 : 1.5})`,
                                    transformOrigin: "top left",
                                }}
                            >
                                {grid.map((rowArray, row) => (
                                    <div key={row} className="flex gap-px">

                                        {rowArray.map((cell, col) => {
                                            const clueNum = getClueNumber(row, col);

                                            return cell ? (
                                                <div
                                                    key={`${row}-${col}`}
                                                    className="relative w-6 h-6 bg-black  text-[#00e0ff] rounded-sm flex items-center justify-center text-xs  border-2 border-[#00e0ff] shadow-[0_0_20px_#00e0ff]"
                                                >
                                                    <span className="z-10">{cell}</span>
                                                    {clueNum && (
                                                        <span className="absolute top-[1px] left-[1px] text-[8px] text-[#ff7700 font-bold z-20 leading-none">
                                                            {clueNum}
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <div key={`${row}-${col}`} className="w-6 h-6" />
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Divider Line */}
                        <hr className="border-[#00e0ff] shadow-[0_0_20px_#00e0ff]" />

                        {/* Bottom: Across & Down */}
                        <div className="flex gap-2">

                            {/* Across Box */}
                            <div className="bg-black border-1 border-[#00e0ff] text-white p-4 rounded-md w-1/2 min-h-[150px]">
                                <span className="font-semibold block mb-2">{t.across}</span>
                                {placedWords
                                    .filter((entry) => entry.direction === "across")
                                    .sort((a, b) => a.clueNumber - b.clueNumber)
                                    .map((entry, idx) => {
                                        const qna = qnaList[entry.index];
                                        if (!qna) return null; // 🛡️ skip if invalid
                                        return (
                                            <div key={idx} className="mb-2 text-sm">
                                                <strong>{entry.clueNumber}.</strong> {qna.question}
                                            </div>
                                        );
                                    })}
                            </div>

                            {/* Down Box */}
                            <div className="bg-black  border-1 border-[#00e0ff] text-white p-4 rounded-md w-1/2 min-h-[150px]">
                                <span className="font-semibold block mb-2">{t.down}</span>
                                {placedWords
                                    .filter((entry) => entry.direction === "down")
                                    .sort((a, b) => a.clueNumber - b.clueNumber)
                                    .map((entry, idx) => {
                                        const qna = qnaList[entry.index];
                                        if (!qna) return null; // 🛡️ skip if invalid
                                        return (
                                            <div key={idx} className="mb-2 text-sm">
                                                <strong>{entry.clueNumber}.</strong> {qna.question}
                                            </div>
                                        );
                                    })}
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}



/*
<span className="font-semibold w-1/3">{item.answer}</span>
                                            <div
                                                className="w-[2px] h-full bg-white mx-4 rounded-full opacity-50"
                                                style={{ minHeight: "40px" }}
                                            ></div>
                                            <span className="text-gray-300 w-2/3">{item.question}</span>
*/