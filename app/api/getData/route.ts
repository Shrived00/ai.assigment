import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";

export async function POST(request: Request) {
    try {
        const { uniqueId } = await request.json();

        if (!uniqueId || typeof uniqueId !== 'string') {
            return NextResponse.json({ error: "uniqueId is required and must be a string" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { uniqueId }
        });



        if (!user) {
            const newUser = await prisma.user.create({
                data: {
                    uniqueId: uniqueId,
                    tasks: [
                        {
                            title: "Add Your First Task",
                            description: "Description 1",
                            priority: "MEDIUM",
                            id: "1",
                            column: "todo"
                        }
                    ],
                },
            });

            return NextResponse.json({ user: newUser }, { status: 201 });
        }

        return NextResponse.json(user, { status: 200 });
    } catch (error) {
        console.error("Error fetching user data:", error);
        return NextResponse.json({ error: "Failed to fetch user data" }, { status: 500 });
    }
}
