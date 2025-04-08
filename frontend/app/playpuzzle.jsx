"use client";
import React, { useState, useEffect, useRef } from "react";

export default function PlayPuzzle({ screenWidth, onBack, selectedPuzzle }) {
    const [grid, setGrid] = useState([]);
    const [playerGrid, setPlayerGrid] = useState([]);
    const [placedWords, setPlacedWords] = useState([]);
    const containerRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const handleMouseDown = (e) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX, y: e.clientY });
    };

    const handleMouseMove = (e) => {
        if (!isDragging || !containerRef.current) return;
        const dx = e.clientX - dragStart.x;
        const dy = e.clientY - dragStart.y;
        containerRef.current.scrollLeft -= dx;
        containerRef.current.scrollTop -= dy;
        setDragStart({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => setIsDragging(false);

    const getClueNumber = (row, col) => {
        const match = placedWords.find(
            (entry) => entry?.start?.row === row && entry?.start?.col === col
        );
        return match?.clueNumber ?? null;
    };

    const checkAnswers = () => {
        const mistakes = [];
      
        for (let i = 0; i < placedWords.length; i++) {
          const word = placedWords[i];
          const correctAnswer = selectedPuzzle.qnaList[word.index]?.answer?.toUpperCase();
      
          if (!correctAnswer) continue;
      
          let userAnswer = "";
          let { row, col } = word.start;
          for (let j = 0; j < correctAnswer.length; j++) {
            const cell = playerGrid[row]?.[col] || "";
            userAnswer += cell;
      
            if (word.direction === "across") col++;
            else row++;
          }
      
          if (userAnswer !== correctAnswer) {
            mistakes.push({ number: word.clueNumber, expected: correctAnswer, got: userAnswer });
          }
        }
      
        if (mistakes.length === 0) {
          alert("🎉 You solved it!");
        } else {
          alert(`❌ ${mistakes.length} incorrect answer(s). Keep trying!`);
          console.log(mistakes);
        }
      };
      
    const handleLetterInput = (row, col, value) => {
        const letter = value.toUpperCase().slice(0, 1);
        setPlayerGrid((prev) =>
            prev.map((r, i) => r.map((c, j) => (i === row && j === col ? letter : c)))
        );
    };

    useEffect(() => {
        if (!selectedPuzzle) return;
    
        setGrid(selectedPuzzle.grid || []);
        setPlacedWords(selectedPuzzle.placedWords || []);
        setPlayerGrid(
            (selectedPuzzle.grid || []).map((row) =>
                row.map((cell) => (cell ? "" : null))
            )
        );
    
        setTimeout(() => {
            if (containerRef.current) {
                containerRef.current.scrollLeft =
                    containerRef.current.scrollWidth / 2 - containerRef.current.clientWidth / 2;
                containerRef.current.scrollTop =
                    containerRef.current.scrollHeight / 2 - containerRef.current.clientHeight / 2;
            }
        }, 50);
    }, [selectedPuzzle]);
    

    return (
        <div className="text-white font-[Itim]">
            <button
                className="mb-4 px-4 py-2 bg-[#5A2E44] text-white rounded hover:bg-[#6A2A3B] transition"
                onClick={onBack}
            >
                ← Back
            </button>
            <h1 className="text-3xl font-bold mb-6">{selectedPuzzle?.title || "Crossword Puzzle"}</h1>

            <div className="flex flex-col md:flex-row gap-2 w-full justify-start">
                {/* Puzzle Area */}
                <div className={`bg-[#522136] p-2 rounded-lg ${screenWidth > 770 ? "md:w-full max-w-[1000px]" : "w-full"}`}>
                    <div
                        className="w-full h-[420px] overflow-auto border border-white"
                        style={{ cursor: isDragging ? "grabbing" : "grab" }}
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
                                                className="relative w-6 h-6 bg-[#522136] text-white rounded-sm flex items-center justify-center text-xs border border-white"
                                            >
                                                <input
                                                    type="text"
                                                    maxLength={1}
                                                    value={playerGrid[row][col] || ""}
                                                    onChange={(e) => handleLetterInput(row, col, e.target.value)}
                                                    className="w-full h-full bg-transparent text-white text-xs text-center outline-none"
                                                />
                                                {clueNum && (
                                                    <span className="absolute top-[1px] left-[1px] text-[8px] text-white font-bold z-20">
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

                    <hr className="border-white my-4" />

                    
                    <button
                        onClick={checkAnswers}
                        className="mt-4 bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition"
                    >
                        Check Answers
                    </button>

                    {/* Across & Down Clues */}
                    <div className="flex gap-4">
                        <div className="bg-[#522136] text-white p-4 rounded-md w-1/2 min-h-[150px]">
                            <span className="font-semibold block mb-2">Across</span>
                            {placedWords
                                .filter((entry) => entry.direction === "across")
                                .sort((a, b) => a.clueNumber - b.clueNumber)
                                .map((entry, idx) => (
                                    <div key={idx} className="mb-2 text-sm">
                                        <strong>{entry.clueNumber}.</strong>{" "}
                                        {selectedPuzzle.qnaList[entry.index]?.question}
                                    </div>
                                ))}
                        </div>

                        <div className="bg-[#522136] text-white p-4 rounded-md w-1/2 min-h-[150px]">
                            <span className="font-semibold block mb-2">Down</span>
                            {placedWords
                                .filter((entry) => entry.direction === "down")
                                .sort((a, b) => a.clueNumber - b.clueNumber)
                                .map((entry, idx) => (
                                    <div key={idx} className="mb-2 text-sm">
                                        <strong>{entry.clueNumber}.</strong>{" "}
                                        {selectedPuzzle.qnaList[entry.index]?.question}
                                    </div>
                                ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
