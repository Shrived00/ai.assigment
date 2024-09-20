"use client";

import { useEffect } from "react";
import { UserButton } from "@clerk/nextjs";
import { useStore } from "../libs/store";
import { redirect } from "next/navigation";

interface ClientComponentProps {
    userId: string;
}

const ClientComponent: React.FC<ClientComponentProps> = ({ userId }) => {
    const { setUserId } = useStore();
    useEffect(() => {
        setUserId(userId);
        redirect('/dashboard')
    }, [userId, setUserId]);

    return (
        <div className="text-center text-lg text-green-600">
            Welcome! You are authenticated.
            <div>{userId}</div>
            <UserButton />
        </div>
    );
};

export default ClientComponent;
