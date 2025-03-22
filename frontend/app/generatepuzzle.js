"use client";
import React from "react";
import { useState } from "react";
export default function GeneratePuzzle({ screenWidth }) {
    const [puzzleTitle, setPuzzleTitle] = React.useState("");
    const [question, setQuestion] = React.useState("");
    const [answer, setAnswer] = React.useState("");
    const [qnaList, setQnaList] = React.useState([]);
    const [editAnswer, setEditAnswer] = useState("");
    const [editQuestion, setEditQuestion] = useState("");
    const [editingIndex, setEditingIndex] = useState(null); // Index of the QnA being edited
    const [isEditing, setIsEditing] = useState(false);

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


    return (
        <div className="text-white font-[Itim]">
            <h1 className="text-3xl font-bold mb-6">Crossword Puzzle</h1>
            {isEditing ? (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div
                        className="bg-[#3B0B24] p-6 rounded-lg text-white relative"
                        style={{ width: screenWidth > 450 ? "450px" : "100%" }} // ✅ Set width logic
                    >
                        <button className="absolute top-2 right-2 text-xl" onClick={() => setIsEditing(false)}>✖</button>
                        <h2 className="text-2xl font-bold mb-4">Edit</h2>

                        <label className="block mb-2">Answer:</label>
                        <input
                            type="text"
                            className="bg-[#522136] text-white px-4 py-2 rounded-lg w-full mb-4"
                            value={editAnswer}
                            onChange={(e) => setEditAnswer(e.target.value)}
                        />

                        <label className="block mb-2">Question:</label>
                        <textarea
                            className="bg-[#522136] text-white px-4 py-2 rounded-lg w-full mb-4"
                            value={editQuestion}
                            onChange={(e) => setEditQuestion(e.target.value)}
                        />

                        <button onClick={handleSaveEdit} className="bg-yellow-500 px-6 py-2 rounded-lg transition duration-300 hover:bg-yellow-400 hover:scale-105">
                            Done
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col md:flex-row gap-2 w-full justify-start">

                    {/* Left Column */}
                    <div className={`flex flex-col gap-2 ${screenWidth > 770 ? "w-full md:w-2/5 max-w-[450px]" : "w-full"}`}>
                        {/* Box 1: Title Input + Create Button */}
                        <div className="bg-[#522136] p-4 rounded-lg">
                            <input
                                type="text"
                                placeholder="Enter title"
                                value={puzzleTitle}
                                onChange={(e) => setPuzzleTitle(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg text-white bg-transparent border border-white focus:outline-none placeholder-white"
                            />
                            <button
                                className="w-full mt-4 bg-[#B0913D] text-white py-2 rounded-md hover:bg-[#c5a847] transition duration-300"
                            >
                                Create
                            </button>
                        </div>

                        {/* Box 2: Question + Answer Input */}
                        <div className="bg-[#522136] p-4 rounded-lg">
                            <label className="block mb-2 text-white">Question</label>
                            <input
                                type="text"
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg text-white bg-transparent border border-white mb-4 focus:outline-none placeholder-white"
                            />
                            <hr className="border-white my-2" />
                            <label className="block mb-2 text-white">Answer</label>
                            <input
                                type="text"
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg text-white bg-transparent border border-white focus:outline-none placeholder-white"
                            />
                            <button
                                onClick={() => {
                                    if (question.trim() && answer.trim()) {
                                        setQnaList([...qnaList, { question, answer }]);
                                        setQuestion("");
                                        setAnswer("");
                                    }
                                }}
                                className="mt-4 bg-[#B0913D] text-white px-6 py-2 rounded-md hover:bg-[#c5a847] transition duration-300"
                            >
                                Add
                            </button>


                        </div>

                        {/* Show QnA box*/}
                        <div className="bg-[#522136] p-4 rounded-lg h-64">
                            <div className="flex flex-col gap-2">
                                {qnaList.map((item, index) => (

                                    <div key={index} className="bg-[#6A2A3B] p-4 rounded-lg flex items-center justify-between w-full">
                                        <span className="font-semibold w-1/3">{item.answer}</span>
                                        <span className="text-white text-5xl px-1 font-light">|</span> {/* Vertical Line */}
                                        <span className="text-gray-300 w-2/3">{item.question}</span>

                                        {/* ✏️ Edit Buttons Container */}
                                        <div className="relative flex items-center pl-8">
                                            {/* Trash Button - Positioned at the top-right */}
                                            <button
                                                onClick={() => {
                                                    const updatedList = qnaList.filter((_, i) => i !== index);
                                                    setQnaList(updatedList);
                                                }}
                                                className="absolute top-0 right-0 text-white transition duration-300 hover:text-red-500 hover:scale-110"
                                            >
                                                <i className="bi bi-trash"></i>
                                            </button>


                                            {/* ✏️ Pencil Icon (Edit Button) - Positioned lower right */}
                                            <button
                                                onClick={() => handleEditClick(item, index)}
                                                className="absolute bottom-1 right-0 text-white  transition duration-300 hover:text-yellow-400 hover:scale-110"
                                            >
                                                <i className="bi bi-pencil-fill"></i>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                        </div>
                    </div>

                    {/* Right Column */}
                    {/* Puzzle look */}
                    <div className= { `bg-[#522136] p-2 rounded-lg ${screenWidth > 770 ? "md:w-3/5 h-[670px] flex flex-col gap-2 max-w-[750px]" : "w-full md:w-3/5 h-[705px] flex flex-col gap-2 " }`}>

                        {/* Puzzle Title Box */}
                        <div className="flex justify-center ">
                            <div className="bg-[#522136] text-white p-2 rounded-md font-semibold text-center">
                                {puzzleTitle || "Untitled"}
                            </div>
                        </div>
                        {/* Divider Line */}
                        <hr className="border-white" />

                        {/* Middle Puzzle Grid Box */}
                        <div className="bg-[#522136] text-white p-4 rounded-md flex-1">The Puzzle</div>

                        {/* Bottom: Across & Down */}
                        <div className="flex gap-2 ">
                            <div className="bg-white text-black p-4 rounded-md w-1/2 min-h-[150px] max-h-[250px] overflow-y-auto">
                                <span className="font-semibold block mb-2">Across</span>
                            </div>
                            <div className="bg-white text-black p-4 rounded-md w-1/2 min-h-[150px] max-h-[250px] overflow-y-auto">
                                <span className="font-semibold block mb-2">Down</span>
                            </div>

                        </div>
                    </div>

                </div>
            )}
        </div>
    );
}
