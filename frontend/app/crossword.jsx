"use client";
import React from "react";
import { useState, useEffect } from "react";

export default function CrosswordPuzzle({ screenWidth, onBack, studySet }) {
    const [puzzleTitle, setPuzzleTitle] = React.useState("");
    const [qnaList, setQnaList] = React.useState([]);
    const [hoverRow, setHoverRow] = useState(null);
    const [hoverCol, setHoverCol] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    // Get clue number for a specific grid cell
    const getClueNumber = (row, col) => {
        const match = placedWords.find((entry) => {
            if (!entry || !entry.start) return false;
            return entry.start.row === row && entry.start.col === col;
        });

        return match?.clueNumber ?? null;

    };
    const handleInputChange = (value, row, col) => {
        setUserGrid((prev) => {
            const updated = [...prev.map((r) => [...r])];
            updated[row][col] = value;
            return updated;
        });
    };
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

    const checkAnswers = () => {
        const incorrect = [];

        for (let row = 0; row < grid.length; row++) {
            for (let col = 0; col < grid[row].length; col++) {
                const expected = grid[row][col];
                const actual = userGrid[row]?.[col];
                if (expected && expected !== actual) {
                    incorrect.push({ row, col });
                }
            }
        }
        if (incorrect.length === 0) {
            alert("✅ All answers are correct!");
        } else {
            alert(`❌ ${incorrect.length} incorrect cells. Try again.`);
        }
    };
    const [grid, setGrid] = useState([]);
    const [placedWords, setPlacedWords] = useState([]);
    const containerRef = React.useRef(null);
    const [userGrid, setUserGrid] = useState([]);
    const inputRefs = React.useRef({});
    useEffect(() => {
        if (!studySet) return;

        const qnaList = studySet.terms.map((termObj) => ({
            question: termObj.definition,
            answer: termObj.term.toUpperCase(),
        }));
        setQnaList(qnaList); // ✅ THIS LINE IS MISSING
        setPuzzleTitle(studySet.title || "My Puzzle");
        const generate = async () => {
            const res = await fetch("/api/generate-puzzle", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ qnaList }),
            });

            const data = await res.json();
            setGrid(data.grid);
            setPlacedWords(data.placedWords);

            const emptyGrid = data.grid.map((row) =>
                row.map((cell) => (cell ? "" : null))
            );
            setUserGrid(emptyGrid);
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
    }, [studySet]);


    return (
        <div className="text-white font-[Itim]">


            <div className="flex flex-col md:flex-row flex-wrap gap-2 w-full justify-start">
            <button
                 className="mb-4 px-4 py-2 bg-[#5A2E44] text-white rounded hover:bg-[#6A2A3B] transition"
                 onClick={onBack}
             >
                 ← Quay lại
             </button>
             <h1 className="text-3xl font-bold mb-6">Trò Chơi Ô Chữ</h1>
                {/* Puzzle look */}

                <div className="bg-[#522136] p-2 rounded-lg w-full flex flex-col gap-2 w-full md:max-w-[750px]">
                    {/* ✅ highlight is now scoped inside the render and updates correctly */}
                    {(() => {
                        if (!grid.length || !placedWords.length) return null;

                        // Inline highlight calculation
                        const highlighted = (() => {
                            if (hoverRow === null || hoverCol === null) return [];

                            const results = [];

                            placedWords.forEach((word) => {
                                if (!word?.start || !word?.answer) {
                                    return;
                                }

                                const { start, direction, answer } = word;
                                const len = answer.length;

                                if (
                                    direction === "across" &&
                                    hoverRow === start.row &&
                                    hoverCol >= start.col &&
                                    hoverCol < start.col + len
                                ) {
                                    for (let i = 0; i < len; i++) {
                                        results.push(`${start.row}-${start.col + i}`);
                                    }
                                }

                                if (
                                    direction === "down" &&
                                    hoverCol === start.col &&
                                    hoverRow >= start.row &&
                                    hoverRow < start.row + len
                                ) {
                                    for (let i = 0; i < len; i++) {
                                        results.push(`${start.row + i}-${start.col}`);
                                    }
                                }

                            });
                            return results;
                        })();
                        return (
                            <>

                                {/* THE PUZZLE */}

                                <div
                                    className="w-full h-[420px] overflow-auto"
                                    style={{
                                        cursor: isDragging ? "grabbing" : "grab",
                                        maxWidth: "100%",
                                        maxHeight: "420px",
                                        border: "1px solid #fff", // optional for visual clarity
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
                                                            onMouseEnter={() => {
                                                                setHoverRow(row);
                                                                setHoverCol(col);

                                                                // 💡 Auto-focus the first input of the hovered word
                                                                const targetKey = highlighted.find(key => key === `${row}-${col}`);
                                                                if (targetKey && inputRefs.current[targetKey]) {
                                                                    setTimeout(() => {
                                                                        inputRefs.current[targetKey].focus();
                                                                    }, 10);
                                                                }
                                                            }}

                                                            onMouseLeave={() => {
                                                                setHoverRow(null);
                                                                setHoverCol(null);
                                                            }}

                                                            className={`relative z-20 w-6 h-6 rounded-sm flex items-center justify-center text-xs border transition-all duration-100
                                                        ${highlighted.includes(`${row}-${col}`)
                                                                    ? 'bg-yellow-300 text-black font-extrabold border-2 border-black scale-110'
                                                                    : 'bg-[#522136] text-white'}
                                                      `}
                                                        >
                                                            <input
                                                                ref={(el) => {
                                                                    if (el) inputRefs.current[`${row}-${col}`] = el;
                                                                }}
                                                                type="text"
                                                                maxLength={1}
                                                                value={userGrid[row]?.[col] || ""}
                                                                onChange={(e) => {
                                                                    const val = e.target.value.toUpperCase();
                                                                    handleInputChange(val, row, col);

                                                                    if (val && highlighted.length > 0) {
                                                                        let currentIndex = highlighted.findIndex(cell => cell === `${row}-${col}`);

                                                                        // 🔁 Look for the next empty cell in the highlight path
                                                                        for (let i = currentIndex + 1; i < highlighted.length; i++) {
                                                                            const [nextRow, nextCol] = highlighted[i].split("-").map(Number);
                                                                            if (!userGrid[nextRow][nextCol]) {
                                                                                const nextKey = `${nextRow}-${nextCol}`;
                                                                                if (inputRefs.current[nextKey]) {
                                                                                    setTimeout(() => {
                                                                                        inputRefs.current[nextKey].focus();
                                                                                    }, 10);
                                                                                }
                                                                                break;
                                                                            }
                                                                        }
                                                                    }
                                                                }}

                                                                onKeyDown={(e) => {
                                                                    if (e.key === "Backspace" && !userGrid[row][col]) {
                                                                        const currentIndex = highlighted.findIndex(cell => cell === `${row}-${col}`);
                                                                        const prevKey = highlighted[currentIndex - 1];
                                                                        if (prevKey && inputRefs.current[prevKey]) {
                                                                            setTimeout(() => {
                                                                                inputRefs.current[prevKey].focus();
                                                                            }, 10);
                                                                        }
                                                                    }
                                                                }}
                                                                className="w-full h-full text-center bg-transparent outline-none z-10"
                                                            />

                                                            {clueNum && (
                                                                <span className="absolute top-[1px] left-[1px] text-[8px] text-yellow font-bold z-20 leading-none">
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
                            </>
                        );
                    })()}
                    {/* Divider Line */}
                    <hr className="border-white" />

                    {/* Bottom: Across & Down */}
                    <div className="flex gap-2">
                        <div className="bg-[#522136] text-white p-4 rounded-md w-1/2 min-h-[150px]">
                            <span className="font-semibold block mb-2">Hàng Ngang</span>
                            {placedWords
                                .filter((entry) => entry.direction === "across")
                                .sort((a, b) => a.clueNumber - b.clueNumber)
                                .map((entry, idx) => {
                                    const qna = qnaList[entry.index];
                                    if (!qna) return null;
                                    return (
                                        <div key={idx} className="mb-2 text-sm">
                                            <strong>{entry.clueNumber}.</strong> {qna.question}
                                        </div>
                                    );
                                })}
                        </div>

                        <div className="bg-[#522136] text-white p-4 rounded-md w-1/2 min-h-[150px]">
                            <span className="font-semibold block mb-2">Hàng Dọc</span>
                            {placedWords
                                .filter((entry) => entry.direction === "down")
                                .sort((a, b) => a.clueNumber - b.clueNumber)
                                .map((entry, idx) => {
                                    const qna = qnaList[entry.index];
                                    if (!qna) return null;
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
            <button
                onClick={() => checkAnswers()}
                className="mt-4 bg-yellow-600 text-white px-6 py-2 rounded hover:bg-green-500 transition"
            >
                Kiểm tra!
            </button>
        </div >
    );

}