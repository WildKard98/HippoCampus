import React, { useEffect, useRef, useState } from "react";
import { useDrag, useDrop } from "react-dnd";

/* Draggable Card Component */
export default function DraggableCard({ id, index, term, definition, moveCard, onDelete, onTermChange, onDefinitionChange, t }) {
    const termRef = useRef(null);
    const defRef = useRef(null);
    const [isMobile, setIsMobile] = useState(false);

    const [{ isDragging }, ref] = useDrag({
        type: "CARD",
        item: { index },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    const [, drop] = useDrop({
        accept: "CARD",
        hover: (draggedItem) => {
            if (draggedItem.index !== index) {
                moveCard(draggedItem.index, index);
                draggedItem.index = index;
            }
        },
    });
    // Auto-expand term field
    useEffect(() => {
        if (termRef.current) {
            termRef.current.style.height = "auto";
            termRef.current.style.height = termRef.current.scrollHeight + "px";
        }
    }, [term]);

    // Auto-expand definition field
    useEffect(() => {
        if (defRef.current) {
            defRef.current.style.height = "auto";
            defRef.current.style.height = defRef.current.scrollHeight + "px";
        }
    }, [definition]);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 480);
        checkMobile(); // Initial check
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    return (
        <div ref={(node) => ref(drop(node))} className={`bg-[#1a2e30] p-6 rounded-3xl mb-4 border-2 border-[#00e0ff]  ${isDragging ? "opacity-50" : ""}`}>
            <div className="flex justify-between border-b border-[#00e0ff] pb-2 mb-2">
                {/* 🔸 Box Number in Neon Orange */}
                <span className="text-lg font-bold text-white drop-shadow-[0_0_8px_white]">{id}</span>
                <div>
                    <span className="cursor-move mr-4 text-white drop-shadow-[0_0_8px_white] transition duration-300 hover:scale-110">═</span>
                    <button
                        onClick={onDelete}
                        className="text-white drop-shadow-[0_0_8px_white] transition duration-300 hover:scale-110"
                    >
                        <i className="bi bi-trash"></i>
                    </button>
                </div>
            </div>

            <div className={`flex ${isMobile ? "flex-col gap-4" : "flex-row items-center gap-2"}`}>


                {/* 🔸 Term input (now textarea) */}
                <textarea
                    ref={termRef}
                    placeholder={t.enterterm}
                    className={`${isMobile ? "w-full" : "w-2/6"} px-4 py-2 rounded-3xl text-[#ff7700] bg-black border border-white placeholder-white  focus:outline-none min-h-[40px] overflow-hidden resize-none`}
                    value={term}
                    onChange={(e) => onTermChange(e.target.value)}
                />


                <span className={`text-[#00e0ff] text-5xl px-1 font-light ${isMobile ? "hidden" : "block"}`}>|</span>


                {/* 🔸 Definition input (now textarea) */}
                <textarea
                    ref={defRef}
                    placeholder={t.enterdefinition}
                    className={`${isMobile ? "w-full" : "w-4/6"} px-4 py-2 rounded-3xl text-[#ff7700] bg-black border border-white placeholder-white  focus:outline-none min-h-[40px] overflow-hidden resize-none`}
                    value={definition}
                    onChange={(e) => onDefinitionChange(e.target.value)}
                />



                <button
                    className={`${isMobile ? "w-full" : ""} bg-black text-white border border-white px-4 py-2 rounded-3xl hover:shadow-[0_0_10px_white] transition duration-300 ${!isMobile && "ml-2"}`}
                >
                    <i className="bi bi-image"></i> {t.addimage}
                </button>

            </div>
        </div>
    );
}