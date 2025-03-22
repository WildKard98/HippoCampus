"use client";
import React, { useState, useEffect } from "react";

// Dynamically set grid size based on longest word
const getDynamicGridSize = (words) => {
    let longestWord = words.reduce((max, word) => Math.max(max, word.length), 0);
    return Math.max(longestWord + 4, 10); // Ensure at least a 10x10 grid
};

const emptyCell = "."; // Placeholder for empty cells

const extractWords = (studySet) => {
    if (!studySet || !studySet.terms) return [];
    return studySet.terms.map(item => item.term.toUpperCase());
};

// Function to check if a word can be placed in the grid
const canPlaceWord = (grid, word, row, col, direction, gridSize) => {
    const length = word.length;

    if (direction === "H") {
        if (col + length > grid.length) return false; // Prevent overflow    
        for (let i = 0; i < length; i++) {
            const cell = grid[row][col + i];
            if (cell !== emptyCell && cell !== word[i]) return false;
        }
    } else {
        if (row + length > grid.length) return false; // Prevent overflow
        for (let i = 0; i < length; i++) {
            const cell = grid[row + i][col];
            if (cell !== emptyCell && cell !== word[i]) return false;
        }
    }
    return true;
};

// Function to place a word in the grid
const placeWord = (grid, word, row, col, direction) => {
    for (let i = 0; i < word.length; i++) {
        if (direction === "H") {
            grid[row][col + i] = word[i];
        } else {
            grid[row + i][col] = word[i];
        }
    }
};

// Function to generate crossword grid
const generateCrossword = (words, gridSize = 15) => {
    if (!words || words.length === 0) {
        console.warn("No words provided for the crossword puzzle.");
        return { grid: [], placedWords: [] }; // Return an empty crossword if words are missing
    }

    let grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(emptyCell)); // Use `emptyCell`
    // Sort words by length (longest first) to maximize placement success
    words = words.filter(word => word && word.length > 0).sort((a, b) => b.length - a.length);

    if (words.length === 0) {
        console.warn("No valid words available after filtering.");
        return { grid, placedWords: [] };
    }

    let placedWords = [];

    // Center the first word correctly
    let startRow = Math.floor(gridSize / 2) - Math.floor(words[0].length / 2);
    let startCol = Math.floor(gridSize / 2) - Math.floor(words[0].length / 2);
    placeWord(grid, words[0], startRow, startCol, "H");
    placedWords.push({ word: words[0], row: startRow, col: startCol, dir: "H" });

    // Improved Word Placement: Prioritizes intersections first
    for (let i = 1; i < words.length; i++) {
        let word = words[i];
        let placed = false;

        // Try to place the word where it shares a letter with an existing word
        for (let existingWord of placedWords) {
            for (let j = 0; j < existingWord.word.length; j++) {
                for (let k = 0; k < word.length; k++) {
                    if (existingWord.word[j] === word[k]) {
                        let newRow = existingWord.row + (existingWord.dir === "H" ? 0 : j - k);
                        let newCol = existingWord.col + (existingWord.dir === "H" ? j - k : 0);
                        let newDirection = existingWord.dir === "H" ? "V" : "H";

                        if (canPlaceWord(grid, word, newRow, newCol, newDirection)) {
                            placeWord(grid, word, newRow, newCol, newDirection);
                            placedWords.push({ word, row: newRow, col: newCol, dir: newDirection });
                            placed = true;
                            break;
                        }
                    }
                }
                if (placed) break;
            }
            if (placed) break;
        }

        // If no intersection is found, try placing in open spaces first before random
        if (!placed) {
            let bestSpot = null;
            let bestScore = -1;
        
            for (let r = 0; r < gridSize; r++) {
                for (let c = 0; c < gridSize; c++) {
                    ["H", "V"].forEach((dir) => {
                        if (canPlaceWord(grid, word, r, c, dir, gridSize)) {
                            let score = 0;
                            for (let i = 0; i < word.length; i++) {
                                const row = dir === "H" ? r : r + i;
                                const col = dir === "H" ? c + i : c;
                                if (grid[row][col] === word[i]) score += 1;
                            }
                            if (score > bestScore) {
                                bestScore = score;
                                bestSpot = { row: r, col: c, dir };
                            }
                        }
                    });
                }
            }
        
            if (bestSpot) {
                placeWord(grid, word, bestSpot.row, bestSpot.col, bestSpot.dir);
                placedWords.push({ word, row: bestSpot.row, col: bestSpot.col, dir: bestSpot.dir });
            }
        }
        
    }

    return { grid, placedWords };
};

// React Component to Render Crossword Puzzle
const CrosswordPuzzle = ({ studySet, setShowCrosswordPuzzle }) => {
    const [crossword, setCrossword] = useState({ grid: [], placedWords: [] });
    const [selectedCell, setSelectedCell] = useState(null);
    const [inputValue, setInputValue] = useState("");

    useEffect(() => {
        if (studySet) {
            const words = extractWords(studySet);
            const dynamicGridSize = getDynamicGridSize(words); // ✅ Now calculated dynamically
            const newCrossword = generateCrossword(words, dynamicGridSize);
            setCrossword(newCrossword);
        }
    }, [studySet]);

    const handleCellClick = (row, col) => {
        setSelectedCell({ row, col });
        setInputValue("");
    };

    const handleInputChange = (e) => {
        const value = e.target.value.toUpperCase();
        setInputValue(value);
        if (value.length === 1 && selectedCell) {
            const newGrid = [...crossword.grid];
            newGrid[selectedCell.row][selectedCell.col] = value;
            setCrossword({ ...crossword, grid: newGrid });
            setSelectedCell(null);
        }
    };

    return (
        <div className="flex flex-col items-center p-6 bg-[#3B0B24] min-h-screen text-white">
            <h1 className="text-3xl font-bold mb-4">Crossword Puzzle</h1>

            {/* Crossword Grid */}
            <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${crossword.grid.length}, 1fr)` }}>
                {crossword.grid.map((row, rowIndex) =>
                    row.map((cell, colIndex) => (
                        <div
                            key={`${rowIndex}-${colIndex}`}
                            className={`w-8 h-8 flex items-center justify-center text-lg font-bold rounded-lg ${
                                cell !== emptyCell ? "bg-gray-700" : "bg-transparent"
                            } ${selectedCell && selectedCell.row === rowIndex && selectedCell.col === colIndex ? "border-2 border-yellow-500" : ""}`}
                            onClick={() => handleCellClick(rowIndex, colIndex)}
                        >
                            {cell !== emptyCell ? cell : ""}
                        </div>
                    ))
                )}
            </div>

            {/* Input for Cell */}
            {selectedCell && (
                <div className="mt-4">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={handleInputChange}
                        className="bg-[#522136] text-white px-4 py-2 rounded-lg"
                        maxLength={1}
                        autoFocus
                    />
                </div>
            )}

            {/* Crossword Clues */}
            <div className="mt-6">
                <h2 className="text-2xl font-semibold">Clues</h2>
                <div className="flex gap-8 mt-2">
                    <div>
                        <h3 className="text-xl">Across</h3>
                        <ul>
                            {crossword.placedWords
                                .filter((w) => w.dir === "H")
                                .map((w, i) => (
                                    <li key={i}>{i + 1}. {w.word}</li>
                                ))}
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-xl">Down</h3>
                        <ul>
                            {crossword.placedWords
                                .filter((w) => w.dir === "V")
                                .map((w, i) => (
                                    <li key={i}>{i + 1}. {w.word}</li>
                                ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Back Button */}
            <button
                onClick={() => setShowCrosswordPuzzle(false)}
                className="mt-6 bg-yellow-500 px-6 py-2 rounded-lg transition duration-300 hover:bg-yellow-400 hover:scale-105"
            >
                Back
            </button>
        </div>
    );
};

export default CrosswordPuzzle;