"use client"
import React, { useState } from "react";
import { FiPlus, FiTrash } from "react-icons/fi";
import { motion } from "framer-motion";
import { FaFire } from "react-icons/fa";
import 'react-awesome-button/dist/styles.css';
import { AwesomeButtonProgress } from "react-awesome-button";
import { UserButton } from "@clerk/nextjs";
import axios from "axios";

export const CustomKanban = ({ data, uniqueId }) => {
    return (
        <div className="relative h-screen w-full bg-neutral-900 text-neutral-50">
            <Board data={data} uniqueId={uniqueId} />
        </div>
    );
};

const Board = ({ data, uniqueId }) => {
    const [cards, setCards] = useState(data || []);

    const handleSubmit = async () => {
        if (!uniqueId) {
            console.error("No unique ID provided.");
            return;
        }

        try {
            const response = await axios.post('/api/updateData', {
                uniqueId: uniqueId,
                newTask: cards,
            });

            // Check if the response contains updated data
            if (response.data && Array.isArray(response.data)) {
                setCards(response.data);
            } else {
                console.error("Invalid response data");
            }
        } catch (error) {
            console.error("Error updating data:", error);
        }
    };

    return (
        <div className="h-full">
            <div className="absolute bottom-10 left-10 w">
                <AwesomeButtonProgress
                    type="primary"
                    onPress={async (element, next) => {
                        await handleSubmit();
                        next();
                    }}
                    style={{ width: '100px' }}
                >
                    Save
                </AwesomeButtonProgress>

            </div>
            <div className="absolute right-10 top-5">
                <UserButton />
            </div>
            <div className="flex h-full w-full gap-3 overflow-scroll p-12">
                <Column
                    title="Backlog"
                    column="backlog"
                    headingColor="text-neutral-500"
                    cards={cards}
                    setCards={setCards}
                />
                <Column
                    title="TODO"
                    column="todo"
                    headingColor="text-yellow-200"
                    cards={cards}
                    setCards={setCards}
                />
                <Column
                    title="In progress"
                    column="doing"
                    headingColor="text-blue-200"
                    cards={cards}
                    setCards={setCards}
                />
                <Column
                    title="Complete"
                    column="done"
                    headingColor="text-emerald-200"
                    cards={cards}
                    setCards={setCards}
                />
                <BurnBarrel setCards={setCards} />
            </div>
        </div>
    );
};

const Column = ({ title, headingColor, cards = [], column, setCards }) => {
    const [active, setActive] = useState(false);

    const handleDragStart = (e, card) => {
        e.dataTransfer.setData("cardId", card.id);
    };

    const handleDragEnd = (e) => {
        const cardId = e.dataTransfer.getData("cardId");

        setActive(false);
        clearHighlights();

        const indicators = getIndicators();
        const { element } = getNearestIndicator(e, indicators);

        const before = element.dataset.before || "-1";

        if (before !== cardId) {
            let copy = [...cards];

            let cardToTransfer = copy.find((c) => c.id === cardId);
            if (!cardToTransfer) return;
            cardToTransfer = { ...cardToTransfer, column };

            copy = copy.filter((c) => c.id !== cardId);

            const moveToBack = before === "-1";

            if (moveToBack) {
                copy.push(cardToTransfer);
            } else {
                const insertAtIndex = copy.findIndex((el) => el.id === before);
                if (insertAtIndex === undefined) return;

                copy.splice(insertAtIndex, 0, cardToTransfer);
            }

            setCards(copy);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        highlightIndicator(e);

        setActive(true);
    };

    const clearHighlights = (els) => {
        const indicators = els || getIndicators();

        indicators.forEach((i) => {
            i.style.opacity = "0";
        });
    };

    const highlightIndicator = (e) => {
        const indicators = getIndicators();

        clearHighlights(indicators);

        const el = getNearestIndicator(e, indicators);

        el.element.style.opacity = "1";
    };

    const getNearestIndicator = (e, indicators) => {
        const DISTANCE_OFFSET = 50;

        const el = indicators.reduce(
            (closest, child) => {
                const box = child.getBoundingClientRect();

                const offset = e.clientY - (box.top + DISTANCE_OFFSET);

                if (offset < 0 && offset > closest.offset) {
                    return { offset: offset, element: child };
                } else {
                    return closest;
                }
            },
            {
                offset: Number.NEGATIVE_INFINITY,
                element: indicators[indicators.length - 1],
            }
        );

        return el;
    };

    const getIndicators = () => {
        return Array.from(document.querySelectorAll(`[data-column="${column}"]`));
    };

    const handleDragLeave = () => {
        clearHighlights();
        setActive(false);
    };

    // Ensure cards are filtered and avoid accessing undefined properties
    const filteredCards = Array.isArray(cards) ? cards.filter((c) => c.column === column) : [];

    return (
        <div className="w-56 shrink-0">
            <div className="mb-3 flex items-center justify-between">
                <h3 className={`font-medium ${headingColor}`}>{title}</h3>
                <span className="rounded text-sm text-neutral-400">
                    {filteredCards.length}
                </span>
            </div>
            <div
                onDrop={handleDragEnd}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`h-full w-full transition-colors ${active ? "bg-neutral-800/50" : "bg-neutral-800/0"
                    }`}
            >
                {filteredCards.map((c) => (
                    <Card key={c.id} {...c} handleDragStart={handleDragStart} />
                ))}
                <DropIndicator beforeId={null} column={column} />
                <AddCard column={column} setCards={setCards} />
            </div>
        </div>
    );
};

const Card = ({ title, description, priority, id, column, handleDragStart }) => {
    return (
        <>
            <DropIndicator beforeId={id} column={column} />
            <motion.div
                layout
                layoutId={id}
                draggable="true"
                onDragStart={(e) => handleDragStart(e, { title, description, priority, id, column })}
                className={`cursor-grab rounded border border-neutral-700 bg-neutral-800 p-3 active:cursor-grabbing`}
            >
                <p className="text-sm font-bold text-neutral-100">{title}</p>
                <p className="text-xs text-neutral-400">{description}</p>
                <p className={`mt-2 text-xs ${getPriorityColor(priority)}`}>
                    Priority: {priority}
                </p>
            </motion.div>
        </>
    );
};

const getPriorityColor = (priority) => {
    switch (priority) {
        case "HIGH":
            return "text-red-500";
        case "MEDIUM":
            return "text-yellow-400";
        default:
            return "text-green-400";
    }
};

const DropIndicator = ({ beforeId, column }) => {
    return (
        <div
            data-before={beforeId || "-1"}
            data-column={column}
            className="my-0.5 h-0.5 w-full bg-violet-400 opacity-0"
        />
    );
};

const BurnBarrel = ({ setCards }) => {
    const [active, setActive] = useState(false);

    const handleDragOver = (e) => {
        e.preventDefault();
        setActive(true);
    };

    const handleDragLeave = () => {
        setActive(false);
    };

    const handleDragEnd = (e) => {
        const cardId = e.dataTransfer.getData("cardId");

        setCards((pv) => pv.filter((c) => c.id !== cardId));

        setActive(false);
    };

    return (
        <div
            onDrop={handleDragEnd}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`mt-10 grid h-56 w-56 shrink-0 place-content-center rounded border text-3xl ${active
                ? "border-red-800 bg-red-800/20 text-red-500"
                : "border-neutral-500 bg-neutral-500/20 text-neutral-500"
                }`}
        >
            {active ? <FaFire className="animate-bounce" /> : <FiTrash />}
        </div>
    );
};

const AddCard = ({ column, setCards }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [form, setForm] = useState({
        title: "",
        description: "",
        priority: "LOW",
    });

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setCards((pv) => [
            ...pv,
            {
                ...form,
                id: crypto.randomUUID(),
                column,
            },
        ]);
        setForm({
            title: "",
            description: "",
            priority: "LOW",
        });
        setIsOpen(false);
    };

    return (
        <>
            <motion.button
                layout
                type="button"
                onClick={() => setIsOpen((pv) => !pv)}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded border border-dashed border-neutral-500 bg-neutral-900 py-3 text-sm text-neutral-400"
            >
                <FiPlus />
                Add card
            </motion.button>

            {isOpen && (
                <motion.div layout className="mt-4">
                    <form
                        onSubmit={handleSubmit}
                        className="rounded border border-neutral-700 bg-neutral-800 p-3"
                    >
                        <div>
                            <label
                                htmlFor="title"
                                className="text-xs font-bold text-neutral-100"
                            >
                                Title
                            </label>
                            <input
                                required
                                type="text"
                                name="title"
                                id="title"
                                className="mt-1 w-full rounded border border-neutral-700 bg-neutral-900 p-2 text-neutral-100"
                                value={form.title}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="mt-3">
                            <label
                                htmlFor="description"
                                className="text-xs font-bold text-neutral-100"
                            >
                                Description
                            </label>
                            <input
                                required
                                type="text"
                                name="description"
                                id="description"
                                className="mt-1 w-full rounded border border-neutral-700 bg-neutral-900 p-2 text-neutral-100"
                                value={form.description}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="mt-3">
                            <label
                                htmlFor="priority"
                                className="text-xs font-bold text-neutral-100"
                            >
                                Priority
                            </label>
                            <select
                                name="priority"
                                id="priority"
                                className="mt-1 w-full rounded border border-neutral-700 bg-neutral-900 p-2 text-neutral-100"
                                value={form.priority}
                                onChange={handleChange}
                            >
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                            </select>
                        </div>

                        <div className="mt-3 flex items-center justify-end">
                            <button
                                type="submit"
                                className="rounded border border-neutral-700 bg-neutral-900 px-5 py-2 text-sm font-bold text-neutral-100"
                            >
                                Submit
                            </button>
                        </div>
                    </form>
                </motion.div>
            )}
        </>
    );
};
