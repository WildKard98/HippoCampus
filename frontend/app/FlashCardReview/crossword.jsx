"use client";
import React from "react";
import { useState, useEffect } from "react";
import { generatePuzzle } from "../api";

export default function CrosswordPuzzle({ screenWidth, onBack, studySet, t }) {
    const [puzzleTitle, setPuzzleTitle] = React.useState("");
    const [qnaList, setQnaList] = React.useState([]);
    const [hoverRow, setHoverRow] = useState(null);
    const [hoverCol, setHoverCol] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [hoveredClueNumber, setHoveredClueNumber] = useState(null);
    const [hoveredDirection, setHoveredDirection] = useState(null);
    const [cellStatus, setCellStatus] = useState({});
    const [scale, setScale] = useState(screenWidth <= 480 ? 1.33 : 1);
    const [translate, setTranslate] = useState({ x: 0, y: 0 });
    const [startPan, setStartPan] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [grid, setGrid] = useState([]);
    const [placedWords, setPlacedWords] = useState([]);
    const containerRef = React.useRef(null);
    const [userGrid, setUserGrid] = useState([]);
    const inputRefs = React.useRef({});
    const [activeClueText, setActiveClueText] = useState(null);
    const [activeClueCell, setActiveClueCell] = useState(null); // { row, col }

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

    const checkAnswers = () => {
        const statusMap = {};
        const newUserGrid = [...userGrid.map((r) => [...r])];

        for (let row = 0; row < grid.length; row++) {
            for (let col = 0; col < grid[row].length; col++) {
                const expected = grid[row][col];
                const actual = userGrid[row]?.[col];

                if (expected) {
                    const key = `${row}-${col}`;
                    if (actual === expected) {
                        statusMap[key] = "correct";
                    } else {
                        statusMap[key] = "incorrect";
                    }
                }
            }
        }

        setCellStatus(statusMap);

        // After 2 seconds: clear wrong answers and remove incorrect highlights
        setTimeout(() => {
            const updatedGrid = [...userGrid.map((r) => [...r])];
            Object.entries(statusMap).forEach(([key, value]) => {
                if (value === "incorrect") {
                    const [r, c] = key.split("-").map(Number);
                    updatedGrid[r][c] = "";
                }
            });

            setUserGrid(updatedGrid);
            setCellStatus({});
        }, 2000);
    };

    useEffect(() => {
        if (!studySet) return;
    
        const qnaList = studySet.terms.map((termObj) => ({
            question: termObj.definition,
            answer: termObj.term.toUpperCase().replace(/\s+/g, ""), // ✅ Strip spaces
        }));
        setQnaList(qnaList); // ✅ Set QnA list
        setPuzzleTitle(studySet.title || "My Puzzle");
    
        const generate = async () => {
            setIsLoading(true);
            try {
                const data = await generatePuzzle(qnaList);
                setGrid(data.grid);
                setPlacedWords(data.placedWords);
    
                const emptyGrid = data.grid.map((row) =>
                    row.map((cell) => (cell ? "" : null))
                );
                setUserGrid(emptyGrid);
            } catch (err) {
                console.error("Failed to generate puzzle:", err);
            } finally {
                setIsLoading(false);
            }
    
            if (screenWidth <= 480) {
                setScale(1.33);
            }
    
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
    

    const handleWheel = (e) => {
        if (containerRef.current?.contains(e.target)) {
            e.preventDefault(); // ⛔ stop page scroll
            const zoomAmount = e.deltaY < 0 ? 0.1 : -0.1;
            setScale((prev) => Math.min(Math.max(prev + zoomAmount, 0.5), 2));
        }
    };


    const handlePanStart = (e) => {
        setStartPan({ x: e.clientX || e.touches[0].clientX, y: e.clientY || e.touches[0].clientY });
    };

    const handlePanMove = (e) => {
        if (!startPan) return;
        const currentX = e.clientX || e.touches[0].clientX;
        const currentY = e.clientY || e.touches[0].clientY;
        const dx = currentX - startPan.x;
        const dy = currentY - startPan.y;
        setTranslate((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
        setStartPan({ x: currentX, y: currentY });
    };

    const handlePanEnd = () => {
        setStartPan(null);
    };

    useEffect(() => {
        const wheelHandler = (e) => {
            if (containerRef.current?.contains(e.target)) {
                e.preventDefault();
            }
        };
        window.addEventListener("wheel", wheelHandler, { passive: false });

        return () => {
            window.removeEventListener("wheel", wheelHandler);
        };
    }, []);

    return (
        <div className="text-white font-[Itim]">
            {/* Matching Test Title & Back Button */}
            <div className={`flex justify-between items-center py-5 ${screenWidth <= 770 ? "w-full" : "w-[60%] ml-0"}`}>
                <h2 className="text-xl text-[#00e0ff] drop-shadow-[0_0_6px_#00e0ff] font-bold">
                    {t.puzzle}
                </h2>

                <button
                    className="w-[120px] px-4 py-2 text-sm rounded-3xl border border-white text-white transition duration-300 
                         hover:bg-white hover:text-black shadow-md hover:shadow-[0_0_12px_white]"
                    onClick={onBack}
                >
                    {t.backbtn}
                </button>
            </div>
            {/* Puzzle look */}

            <div className={`flex flex-col gap-2 mb-2 border-2 border-[#00e0ff] p-2 rounded-3xl ${screenWidth <= 770 ? "w-full" : "w-[60%]"}`}>
                {/* ✅ highlight is now scoped inside the render and updates correctly */}
                {isLoading && (
                    <div className="flex justify-center items-center h-[200px]">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#00e0ff]" />
                    </div>
                )}

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

                            const matches = placedWords.filter(({ start, direction, answer }) => {
                                if (!start || !answer) return false;
                                if (direction === "across") {
                                    return hoverRow === start.row && hoverCol >= start.col && hoverCol < start.col + answer.length;
                                } else {
                                    return hoverCol === start.col && hoverRow >= start.row && hoverRow < start.row + answer.length;
                                }
                            });

                            if (matches.length > 0) {
                                // Find the one with shortest distance to the clue origin
                                let closest = matches[0];
                                let closestDistance = Infinity;

                                for (let word of matches) {
                                    const dist = Math.abs(hoverRow - word.start.row) + Math.abs(hoverCol - word.start.col);

                                    if (
                                        dist < closestDistance ||
                                        (dist === closestDistance && word.answer.length < closest.answer.length) // 👈 Tie-breaker
                                    ) {
                                        closest = word;
                                        closestDistance = dist;
                                    }
                                }


                                // Highlight only this word
                                const { start, direction, answer } = closest;
                                for (let i = 0; i < answer.length; i++) {
                                    const r = direction === "across" ? start.row : start.row + i;
                                    const c = direction === "across" ? start.col + i : start.col;
                                    results.push(`${r}-${c}`);
                                }
                            }


                        });
                        return results;
                    })();
                    return (
                        <>
                            {/* THE PUZZLE */}
                            <div
                                ref={containerRef}
                                onWheel={handleWheel}
                                onMouseDown={handlePanStart}
                                onMouseMove={handlePanMove}
                                onMouseUp={handlePanEnd}
                                onMouseLeave={handlePanEnd}
                                onTouchStart={handlePanStart}
                                onTouchMove={handlePanMove}
                                onTouchEnd={handlePanEnd}
                                className="rounded-2xl"
                                style={{
                                    overflow: "auto",
                                    WebkitOverflowScrolling: "touch",
                                    touchAction: "pinch-zoom",
                                    width: "100%",
                                    height: "420px",
                                    border: "2px solid #00e0ff",
                                    position: "relative",
                                    cursor: startPan ? "grabbing" : "grab",
                                    scrollbarWidth: "none",          // 🔵 Firefox
                                    msOverflowStyle: "none",         // 🔵 IE/Edge
                                }}

                            >
                                <div
                                    style={{
                                        transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
                                        transformOrigin: "top left",
                                        transition: "transform 0.05s ease-out",
                                        display: "inline-block",
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

                                                            const targetKey = highlighted.find(key => key === `${row}-${col}`);
                                                            if (targetKey && inputRefs.current[targetKey]) {
                                                                setTimeout(() => {
                                                                    inputRefs.current[targetKey].focus();
                                                                }, 10);
                                                            }

                                                            // ✅ Find clue number for this cell
                                                            const matches = placedWords.filter(word => {
                                                                if (!word?.start || !word?.answer) return false;
                                                                const { start, direction, answer } = word;
                                                                const len = answer.length;

                                                                if (
                                                                    (direction === "across" &&
                                                                        start.row === row &&
                                                                        col >= start.col &&
                                                                        col < start.col + len) ||
                                                                    (direction === "down" &&
                                                                        start.col === col &&
                                                                        row >= start.row &&
                                                                        row < start.row + len)
                                                                ) {
                                                                    return true;
                                                                }
                                                                return false;
                                                            });

                                                            let matchedWord = null;

                                                            for (let word of matches) {
                                                                if (word.start.row === row && word.start.col === col) {
                                                                    matchedWord = word; // ✅ Prefer clue box
                                                                    break;
                                                                }
                                                            }

                                                            if (!matchedWord && matches.length > 0) {
                                                                matchedWord = matches[0]; // fallback to first match
                                                            }

                                                            setHoveredClueNumber(matchedWord?.clueNumber || null); // ✅ set hovered clue number
                                                            setHoveredDirection(matchedWord?.direction || null);
                                                            if (matchedWord) {
                                                                setHoveredClueNumber(matchedWord.clueNumber);
                                                                setHoveredDirection(matchedWord.direction);
                                                                setActiveClueText(qnaList[matchedWord.index]?.question || null);
                                                                setActiveClueCell({
                                                                    row: matchedWord.start.row,
                                                                    col: matchedWord.start.col,
                                                                });
                                                            }
                                                        }}

                                                        onMouseLeave={() => {
                                                            setHoverRow(null);
                                                            setHoverCol(null);
                                                            setHoveredClueNumber(null); // ✅ clear it
                                                            setHoveredDirection(null);

                                                        }}

                                                        className={`relative z-20 w-6 h-6 rounded-sm flex items-center justify-center text-xs transition-all duration-100
                                                            ${highlighted.includes(`${row}-${col}`)
                                                                ? 'bg-black text-[#ff7700] border-2 border-[#ff7700] shadow-[0_0_20px_#ff7700]'
                                                                : cellStatus[`${row}-${col}`] === "correct"
                                                                    ? 'bg-[#052d1b] text-[#00ff88] border-2 border-[#00ff88] shadow-[0_0_10px_#00ff88]'
                                                                    : cellStatus[`${row}-${col}`] === "incorrect"
                                                                        ? 'bg-[#330a0a] text-[#ff0033] border-2 border-[#ff0033] shadow-[0_0_10px_#ff0033]'
                                                                        : 'bg-black text-[#00e0ff] border-2 border-[#00e0ff] shadow-[0_0_20px_#00e0ff]'
                                                            }`}

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
                                                            className={`w-full h-full text-center bg-transparent outline-none z-10 ${screenWidth <= 480 ? "text-[16px]" : "text-xs"}`}
                                                        />

                                                        {clueNum && (
                                                            <>
                                                                <span className="absolute top-[1px] left-[1px] text-[8px] text-yellow font-bold z-20 leading-none">
                                                                    {clueNum}
                                                                </span>

                                                                {activeClueCell &&
                                                                    activeClueCell.row === row &&
                                                                    activeClueCell.col === col &&
                                                                    activeClueText && (
                                                                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max max-w-[300px] px-2 py-2 bg-black border border-white rounded text-sm text-white z-30 shadow-lg leading-snug whitespace-pre-wrap text-center">

                                                                            {activeClueText}
                                                                        </div>
                                                                    )}
                                                            </>
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
                {/* Divider Line <hr className="border-[#00e0ff] shadow-[0_0_20px_#00e0ff]" />*/}
                

                {/* Bottom: Across & Down */}
                {!isLoading && (
                    <div className="flex flex-col md:flex-row gap-2">
                        <div className="bg-black border-2 border-[#00e0ff] text-[#00e0ff] p-4 rounded-2xl w-full md:w-1/2 min-h-[150px]">
                            <span className={`font-semibold block mb-2 text-2xl transition duration-200
                            ${hoveredDirection === "across" ? "text-[#ffaa33] " : "text-white "}`}>
                                {t.across}
                            </span>

                            {placedWords
                                .filter((entry) => entry.direction === "across")
                                .sort((a, b) => a.clueNumber - b.clueNumber)
                                .map((entry, idx) => {
                                    const qna = qnaList[entry.index];
                                    if (!qna) return null;
                                    return (
                                        <div
                                            key={idx}
                                            onClick={() => {
                                                setHoveredClueNumber(entry.clueNumber);
                                                setHoveredDirection(entry.direction);
                                                setHoverRow(entry.start.row);
                                                setHoverCol(entry.start.col);
                                            }}
                                            className={`mb-2 text-lg transition duration-200 cursor-pointer
                                              ${hoveredClueNumber === entry.clueNumber && hoveredDirection === "across"
                                                    ? "text-[#ff7700] drop-shadow-[0_0_8px_#ff7700] font-bold"
                                                    : ""}`}
                                        >
                                            <strong>{entry.clueNumber}.</strong> {qna.question}
                                        </div>
                                    );
                                })}

                        </div>

                        <div className="bg-black border-2 border-[#00e0ff] text-[#00e0ff] p-4 rounded-2xl w-full md:w-1/2 min-h-[150px]">
                            <span className={`font-semibold block mb-2 text-2xl transition duration-200
                            ${hoveredDirection === "down" ? "text-[#ffaa33] " : "text-white "}`}>
                                {t.down}
                            </span>

                            {placedWords
                                .filter((entry) => entry.direction === "down")
                                .sort((a, b) => a.clueNumber - b.clueNumber)
                                .map((entry, idx) => {
                                    const qna = qnaList[entry.index];
                                    if (!qna) return null;
                                    return (
                                        <div
                                            key={idx}
                                            onClick={() => {
                                                setHoveredClueNumber(entry.clueNumber);
                                                setHoveredDirection(entry.direction);
                                                setHoverRow(entry.start.row);
                                                setHoverCol(entry.start.col);
                                            }}
                                            className={`mb-2 text-lg transition duration-200 cursor-pointer
                                                   ${hoveredClueNumber === entry.clueNumber && hoveredDirection === "down"
                                                    ? "text-[#ff7700] drop-shadow-[0_0_8px_#ff7700] font-bold"
                                                    : ""}`}
                                        >
                                            <strong>{entry.clueNumber}.</strong> {qna.question}
                                        </div>
                                    );
                                })}

                        </div>
                    </div>
                )}

            </div>
            <button
                onClick={() => checkAnswers()}
                className="mt-4 px-6 py-2 rounded-3xl border border-white text-white transition duration-300 
             hover:bg-white hover:text-black shadow-md hover:shadow-[0_0_12px_white]"
            >
                {t.checkanswer}
            </button>

        </div >
    );

}