import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";

export async function POST(request: Request) {
    try {
        const { uniqueId, newTask } = await request.json();

        console.log("Unique ID:", uniqueId);
        console.log("New Task:", newTask);

        // Validate uniqueId
        if (!uniqueId || typeof uniqueId !== 'string') {
            return NextResponse.json(
                { error: "uniqueId is required and must be a string" },
                { status: 400 }
            );
        }

        if (!Array.isArray(newTask)) {
            return NextResponse.json({ error: "newTask must be an array" }, { status: 400 });
        }

        // Fetch user with the provided uniqueId
        const user = await prisma.user.findUnique({
            where: { uniqueId },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Ensure tasks is an array before updating
        const existingTasks = Array.isArray(user.tasks) ? user.tasks : [];

        // Create a set of existing task IDs for easy lookup
        const existingTaskIds = new Set(
            existingTasks
                .filter(task => typeof task === "object" && task !== null && "id" in task) // Ensure task is an object and has an id
                .map(task => (task as { id: string }).id) // Safely access the id
        );

        // Filter out new tasks that already exist
        const newUniqueTasks = newTask.filter(task => !existingTaskIds.has(task.id));

        // Combine existing tasks with new unique tasks
        const updatedTasks = [...existingTasks, ...newUniqueTasks];

        // Update user with new task list
        const updatedUser = await prisma.user.update({
            where: { uniqueId },
            data: { tasks: updatedTasks },
        });

        // Respond with the updated user data
        return NextResponse.json({ user: updatedUser }, { status: 200 });

    } catch (error) {
        console.error("Error updating task list:", error);
        return NextResponse.json(
            { error: "Failed to update task list" },
            { status: 500 }
        );
    }
}
