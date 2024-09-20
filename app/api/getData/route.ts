import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";  // Adjust the path to your Prisma instance

export async function POST(request: Request) {
    try {
        const { uniqueId } = await request.json();

        if (!uniqueId || typeof uniqueId !== 'string') {
            return NextResponse.json({ error: "uniqueId is required and must be a string" }, { status: 400 });
        }

        // Find the user by uniqueId
        const user = await prisma.user.findUnique({
            where: { uniqueId }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Return the user data
        return NextResponse.json(user, { status: 200 });
    } catch (error) {
        console.error("Error fetching user data:", error);
        return NextResponse.json({ error: "Failed to fetch user data" }, { status: 500 });
    }
}
