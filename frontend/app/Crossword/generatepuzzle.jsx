"use client";
import React from "react";
import { useState, useEffect } from "react";
import { createPuzzleSet } from "../api";
import { generatePuzzle } from "../api";

export default function GeneratePuzzle({ screenWidth, onBack, onSaveStudySet, t, existingSet }) {
    const [puzzleTitle, setPuzzleTitle] = React.useState("");
    const [question, setQuestion] = React.useState("");
    const [answer, setAnswer] = React.useState("");
    const [qnaList, setQnaList] = React.useState([]);
    const [editAnswer, setEditAnswer] = useState("");
    const [editQuestion, setEditQuestion] = useState("");
    const [editingIndex, setEditingIndex] = useState(null); // Index of the QnA being edited
    const [isEditing, setIsEditing] = useState(false);
    const MAX_WORDS = 30; // or any number you feel is good
    const MAX_LETTERS = 30; // or whatever max you want
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"; // add this at top if not exist
    const [showAiModal, setShowAiModal] = useState(false);
    const [aiPrompt, setAiPrompt] = useState(""); // user input
    const [aiNumTerms, setAiNumTerms] = useState(10);  // default 10 terms
    const [isGenerating, setIsGenerating] = useState(false);
    const [termLanguage, setTermLanguage] = useState("English");
    const [definitionLanguage, setDefinitionLanguage] = useState("English");
    const [errorMsg, setErrorMsg] = useState("");


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
            try {
                const data = await generatePuzzle(
                    qnaList.map(qna => ({
                        question: qna.question,
                        answer: qna.answer
                            .normalize("NFD")                // Break letters into base + accents
                            .replace(/[\u0300-\u036f]/g, "") // Remove accents
                            .replace(/đ/g, "d")              // Lowercase đ → d
                            .replace(/Đ/g, "D")              // Uppercase Đ → D
                            .replace(/[^a-zA-Z0-9]/g, "")    // Remove everything except letters & numbers
                            .toUpperCase()
                    }))
                );
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
            } catch (error) {
                console.error("Failed to generate puzzle:", error);
            }
        };

        generate();
    }, [qnaList]);

    useEffect(() => {
        if (existingSet) {
            setPuzzleTitle(existingSet.title || "");
            setQnaList(
                (existingSet.terms || []).map(item => ({
                    question: item.definition,
                    answer: item.term.toUpperCase()
                }))
            );
        }
    }, [existingSet]);



    return (
        <div className="text-white font-[Itim]">
            <button
                className="mb-4 px-4 py-2 rounded-3xl border border-white text-white transition duration-300 
             hover:bg-white hover:text-black shadow-md hover"
                onClick={onBack}
            >
                {t.backbtn}
            </button>

            <div className="flex flex-col md:flex-row gap-10 w-full justify-start pb-4">
                <h1 className="text-3xl font-bold text-[#ff7700] ">
                    {t.createpuzzle}
                </h1>
                <div className="p-[2px] rounded-3xl bg-gradient-to-r from-pink-500 via-yellow-500 to-blue-500">
                    <button
                        onClick={() => setShowAiModal(true)}
                        className="w-full px-6 py-2 rounded-3xl font-bold bg-black text-yellow-500 transition duration-500
                       hover:bg-gradient-to-r hover:from-pink-500 hover:via-yellow-500 hover:to-blue-500 hover:text-white hover:scale-110"
                    >
                        {t.askai} ✨
                    </button>
                </div>
            </div>
            {isEditing ? (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div
                        className="bg-black p-6 rounded-3xl text-white relative border border-[#00e0ff] "
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
                            className="bg-black text-white placeholder-white  px-4 py-2 rounded-3xl w-full mb-4 
                     border border-[#00e0ff]  focus:outline-none focus:ring-2 focus:ring-[#00e0ff]"
                            value={editAnswer}
                            onChange={(e) => setEditAnswer(e.target.value)}
                        />

                        <label className="block mb-2 text-[#00e0ff]">{t.answer}</label>
                        <textarea
                            className="bg-black text-white  placeholder-white  px-4 py-2 rounded-3xl w-full mb-4 
                     border border-[#00e0ff] focus:outline-none focus:ring-2 focus:ring-[#00e0ff]"
                            value={editQuestion}
                            onChange={(e) => setEditQuestion(e.target.value)}
                        />

                        <button
                            onClick={handleSaveEdit}
                            className="px-6 py-2 rounded-3xl border border-[#ff7700] text-[#ff7700] transition duration-300 
                     hover:bg-[#ff7700] hover:text-black shadow-md hover"
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
                        <div className="bg-black p-4 rounded-3xl border border-[#00e0ff] ">
                            <input
                                type="text"
                                placeholder={t.entertitle}
                                value={puzzleTitle}
                                onChange={(e) => setPuzzleTitle(e.target.value)}
                                className="w-full px-4 py-2 rounded-3xl text-white bg-black placeholder-white  border border-[#00e0ff] focus:outline-none focus:ring-2 focus:ring-[#00e0ff]"
                            />
                            <button
                                onClick={async () => {
                                    if (!puzzleTitle.trim()) {
                                        setErrorMsg("Please enter a title before saving.");
                                        return;
                                    }
                                    if (qnaList.length === 0) {
                                        setErrorMsg("Add at least one question & answer.");
                                        return;
                                    }
                                    setErrorMsg(""); // clear on success


                                    const newPuzzleSet = {
                                        username: localStorage.getItem('username'),
                                        title: puzzleTitle.trim(),
                                        description: "",
                                        terms: qnaList.map((qna) => ({
                                            term: qna.answer,
                                            definition: qna.question,
                                        })),
                                        isPrivate: "Private",
                                    };

                                    try {
                                        const savedSet = await createPuzzleSet(newPuzzleSet);
                                        if (onSaveStudySet) {
                                            onSaveStudySet(savedSet);
                                        }
                                        if (onBack) onBack();
                                    } catch (error) {
                                        console.error(error);
                                        setErrorMsg("Error saving puzzle set. Try again later.");
                                    }
                                }}

                                className="w-full mt-2 py-2 rounded-3xl border border-[#ff7700] text-[#ff7700] transition duration-300 
                                      hover:bg-[#ff7700] hover:text-black shadow-md "
                            >
                                {t.createbtn}
                            </button>
                            {errorMsg && (
                                <p className="text-red-500 text-sm mt-2 text-center">{errorMsg}</p>
                            )}


                        </div>


                        {/* Box 2: Question + Answer Input */}
                        <div className="bg-black p-4 rounded-3xl border border-[#00e0ff]">
                            <label className="block mb-2 text-[#00e0ff]">{t.question}</label>
                            <input
                                type="text"
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                placeholder={t.enterquestion}
                                className="w-full px-4 py-2 rounded-3xl text-white bg-black placeholder-white border border-[#00e0ff] mb-4 
                                 focus:outline-none focus:ring-2 focus:ring-[#00e0ff]"
                            />

                            <hr className="border-[#00e0ff] my-2" />

                            <label className="block mb-2 text-[#00e0ff]">{t.answer}</label>
                            <input
                                type="text"
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                placeholder={t.enteranswer}
                                className="w-full px-4 py-2 rounded-3xl text-white bg-black placeholder-white border border-[#00e0ff] 
                                 focus:outline-none focus:ring-2 focus:ring-[#00e0ff]"
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
                                className="mt-4 px-6 py-2 rounded-3xl border border-[#ff7700] text-[#ff7700] transition duration-300 
                                       hover:bg-[#ff7700] hover:text-black shadow-md"
                            >
                                {t.addbt}
                            </button>
                        </div>


                        {/* Show QnA box */}
                        <div className="bg-black p-4 rounded-3xl overflow-y-auto border border-[#00e0ff]">
                            {qnaList.length === 0 ? (
                                <p className="text-[#00e0ff] text-center py-4">{t.enteryet}</p>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    {qnaList.map((item, index) => (
                                        <div
                                            key={index}
                                            className="bg-black p-4 rounded-2xl flex items-center justify-between w-full 
                                                 border border-[#00e0ff]"
                                        >
                                            <div className="flex items-center gap-2 w-full">
                                                {/* Answer (1/3) */}
                                                <div
                                                    className="w-1/3 px-1 py-4 text-white  font-bold text-center break-words overflow-hidden"
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
                                                <div className="w-[2px] h-10 bg-[#00e0ff] mx-2 rounded-full " />

                                                {/* Question (2/3) */}
                                                <div className="w-2/3 px-1 py-4 text-[#00e0ff]  text-sm break-words"
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
                                                    className="absolute top-0 right-0 text-[#00e0ff] transition duration-300 hover:text-[#ff0033] hover:scale-110"
                                                >
                                                    <i className="bi bi-trash"></i>
                                                </button>

                                                {/* ✏️ Pencil Button */}
                                                <button
                                                    onClick={() => handleEditClick(item, index)}
                                                    className="absolute bottom-1 right-0 text-[#00e0ff] transition duration-300 hover:text-[#ffaa33] hover:scale-110 "
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
                    <div className={`bg-black p-2 rounded-3xl ${screenWidth > 770 ? "md:w-3/5 flex flex-col border-2 border-[#00e0ff] gap-2 max-w-[750px]" : "w-full md:w-3/5 flex flex-col  border-2 border-[#00e0ff] gap-2"}`}>
                        {/* Puzzle Title Box */}
                        <div className="flex justify-center ">
                            <div className="bg-black text-white p-2 rounded-md font-semibold text-center text-2xl">
                                {puzzleTitle || t.untitle}
                            </div>
                        </div>


                        {/* Divider Line */}


                        {/* THE PUZZLE */}

                        <div
                            className="w-full h-[420px] overflow-auto rounded-3xl"
                            style={{
                                cursor: isDragging ? "grabbing" : "grab",
                                maxWidth: "100%",
                                maxHeight: "420px",
                                border: "1px solid #00e0ff",
                                position: "relative",
                                scrollbarWidth: "none",       // ✅ Firefox
                                msOverflowStyle: "none",      // ✅ IE/Edge
                                WebkitOverflowScrolling: "touch", // ✅ smooth scroll on mobile
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
                                                    className="relative w-6 h-6 bg-black  text-[#00e0ff] rounded-sm flex items-center justify-center text-xs  border-2 border-[#00e0ff]"
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

                        {/* Divider Line <hr className="border-[#00e0ff] shadow-[0_0_20px_#00e0ff]" /> */}


                        {/* Bottom: Across & Down */}
                        <div className="flex flex-col md:flex-row gap-2">

                            {/* Across Box */}
                            <div className="bg-black border-1 border-[#00e0ff] text-[#00e0ff] p-4 rounded-2xl w-full md:w-1/2 min-h-[150px]">
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
                            <div className="bg-black border-1 border-[#00e0ff] text-[#00e0ff] p-4 rounded-2xl w-full md:w-1/2 min-h-[150px]">
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
            {showAiModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="relative p-[3px] rounded-3xl bg-gradient-to-r from-pink-500 via-yellow-500 to-blue-500 shadow-[0_0_20px_#ff00ff] w-[450px]">

                        {/* Put .relative here so the ✖ button is relative to this box */}
                        <div className="bg-black p-6 rounded-3xl text-white w-full h-full relative">


                            {/* Close Button */}
                            <button
                                className="absolute top-4 right-4 text-[#ff7700] text-xl hover:scale-110 transition"
                                onClick={() => setShowAiModal(false)}
                            >
                                ✖
                            </button>

                            {/* Title */}
                            <h2 className="text-2xl font-bold mb-4 text-white drop-shadow-[0_0_8px_white]">{t.aipuzzlecreate}</h2>

                            {/* Topic Input */}
                            <label className="block mb-2 text-[#00e0ff]">{t.topic}</label>
                            <input
                                type="text"
                                placeholder={t.topiceg}
                                className="bg-black text-[#ff7700] placeholder-white px-4 py-2 rounded-3xl w-full mb-4 border border-[#00e0ff] shadow-[0_0_12px_#00e0ff] focus:outline-none focus:ring-2 focus:ring-[#00e0ff]"
                                value={aiPrompt}
                                onChange={(e) => setAiPrompt(e.target.value)}
                            />

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="flex flex-col">
                                    <label className="mb-2 text-[#00e0ff]">{t.anslanguage}</label>
                                    <select
                                        value={termLanguage}
                                        onChange={(e) => setTermLanguage(e.target.value)}
                                        className="bg-black text-[#ff7700] px-4 py-2 rounded-3xl border border-[#00e0ff] shadow-[0_0_8px_#00e0ff] focus:outline-none focus:ring-2 focus:ring-[#00e0ff] hover:bg-[#00e0ff] hover:text-black transition duration-300 text-center w-full"
                                    >
                                        <option value="English" className="bg-black text-[#00e0ff]">English</option>
                                        <option value="Vietnamese" className="bg-black text-[#00e0ff]">Tiếng Việt</option>
                                    </select>
                                </div>

                                <div className="flex flex-col">
                                    <label className="mb-2 text-[#00e0ff]">{t.queslanguage}</label>
                                    <select
                                        value={definitionLanguage}
                                        onChange={(e) => setDefinitionLanguage(e.target.value)}
                                        className="bg-black text-[#ff7700] px-4 py-2 rounded-3xl border border-[#00e0ff] shadow-[0_0_8px_#00e0ff] focus:outline-none focus:ring-2 focus:ring-[#00e0ff] hover:bg-[#00e0ff] hover:text-black transition duration-300 text-center w-full"
                                    >
                                        <option value="English" className="bg-black text-[#00e0ff]">English</option>
                                        <option value="Vietnamese" className="bg-black text-[#00e0ff]">Tiếng Việt</option>
                                    </select>
                                </div>
                            </div>
                            {/* Generate Button */}
                            <div className="flex flex-col gap-4 items-center mt-2">
                                <div className="flex flex-col">
                                    <label className="mb-2 text-[#00e0ff]">{t.numterm}</label>
                                    <select
                                        value={aiNumTerms}
                                        onChange={(e) => setAiNumTerms(e.target.value)}
                                        className="bg-black text-[#ff7700] px-4 py-2 rounded-3xl border border-[#00e0ff] 
                                           shadow-[0_0_8px_#00e0ff] focus:outline-none focus:ring-2 focus:ring-[#00e0ff] 
                                           hover:bg-[#00e0ff] hover:text-black transition duration-300 text-center w-full"
                                    >
                                        {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
                                            <option key={num} value={num} className="bg-black text-[#00e0ff]">
                                                {num}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="p-[2px] rounded-full bg-gradient-to-r from-pink-500 via-yellow-500 to-blue-500 w-full max-w-[200px]">
                                    <button
                                        onClick={async () => {
                                            setIsGenerating(true);
                                            try {
                                                const response = await fetch('http://localhost:5001/api/ai', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({
                                                        topic: aiPrompt,
                                                        numTerms: aiNumTerms,
                                                        termLanguage,
                                                        definitionLanguage,
                                                    }),
                                                });

                                                const data = await response.json();

                                                if (response.ok) {
                                                    console.log("Generated terms:", data.terms || data.studySet);
                                                    setQnaList((data.terms || data.studySet).map((item) => ({
                                                        question: item.definition, // question ← from AI definition
                                                        answer: item.term.toUpperCase(), // answer ← from AI term, uppercase for puzzle
                                                    })));
                                                    setPuzzleTitle(aiPrompt);
                                                    setShowAiModal(false);
                                                } else {
                                                    console.error("Error generating set:", data.error);
                                                }
                                            } catch (err) {
                                                console.error("Failed to call AI API:", err);
                                            } finally {
                                                setIsGenerating(false);
                                            }
                                        }}
                                        disabled={isGenerating}
                                        className={`w-full px-6 py-2 rounded-full font-bold bg-black text-yellow-500 transition duration-500
                                          ${isGenerating ? "" : "hover:bg-gradient-to-r hover:from-pink-500 hover:via-yellow-500 hover:to-blue-500 hover:text-white hover:scale-110"}`}
                                    >
                                        {isGenerating ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <svg className="animate-spin h-5 w-5 text-[#ff7700]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"></path>
                                                </svg>
                                                <span>{t.genwait}</span>
                                            </div>
                                        ) : (
                                            t.generatebtn
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
