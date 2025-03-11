"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateSet() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [terms, setTerms] = useState([{ id: 1, term: "", definition: "" }]);

  // Function to add a new term-definition card
  const addCard = () => {
    setTerms([...terms, { id: terms.length + 1, term: "", definition: "" }]);
  };

  // Function to remove a card
  const removeCard = (id) => {
    setTerms(terms.filter((term) => term.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#3B0B24] text-white p-8">
      {/* Back Button */}
      <button onClick={() => router.push("/")} className="text-white mb-4">
        ← Back
      </button>

      <h1 className="text-2xl font-bold mb-4">Create a New Learning Set</h1>

      {/* Title Input */}
      <input
        type="text"
        placeholder="Enter a title"
        className="bg-[#522136] text-white px-4 py-2 rounded-lg w-full mb-4"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {/* Description Input */}
      <textarea
        placeholder="Add a description"
        className="bg-[#522136] text-white px-4 py-2 rounded-lg w-full mb-4"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      {/* Create Button */}
      <button className="bg-yellow-500 px-6 py-2 rounded-lg mb-6">Create</button>

      {/* Term-Definition Cards */}
      {terms.map((item) => (
        <div key={item.id} className="bg-[#522136] p-4 rounded-lg mb-4 flex justify-between items-center">
          <span className="text-lg">{item.id}</span>
          <input
            type="text"
            placeholder="Enter term"
            className="bg-[#3B0B24] text-white px-4 py-2 rounded-lg flex-1 mx-2"
            value={item.term}
            onChange={(e) =>
              setTerms(terms.map((t) => (t.id === item.id ? { ...t, term: e.target.value } : t)))
            }
          />
          <input
            type="text"
            placeholder="Enter definition"
            className="bg-[#3B0B24] text-white px-4 py-2 rounded-lg flex-1 mx-2"
            value={item.definition}
            onChange={(e) =>
              setTerms(terms.map((t) => (t.id === item.id ? { ...t, definition: e.target.value } : t)))
            }
          />
          {/* Delete Button */}
          <button onClick={() => removeCard(item.id)} className="text-white">🗑</button>
        </div>
      ))}

      {/* Add More Card Button */}
      <button onClick={addCard} className="bg-[#5A2E44] px-6 py-2 rounded-lg w-full">
        + Add More Card
      </button>
    </div>
  );
}
