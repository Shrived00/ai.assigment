"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useStore } from '../libs/store';
import { CustomKanban } from '../components/CustomKanban';
import { BeatLoader } from 'react-spinners';

interface User {
    id: string;
    uniqueId: string;
    tasks: Card[];
}

interface Card {
    title: string;
    description: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    id: string;
    column: string;
}

const Page: React.FC = () => {
    const { userId } = useStore();
    const [data, setData] = useState<User | null>(null);
    const [uniqueId, setUniqueID] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userId) {
            setUniqueID(userId);
            localStorage.setItem("uid", JSON.stringify({ userId }));
        } else {
            const uid = JSON.parse(localStorage.getItem("uid") ? localStorage.getItem("uid")!.toString() : "{}");
            setUniqueID(uid.userId);
        }
    }, [userId]);

    useEffect(() => {
        const fetchData = async () => {
            if (!uniqueId) return;

            setLoading(true);
            try {
                const response = await axios.post('/api/getData', { uniqueId });
                setData(response.data);
                console.log(response.data)
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [uniqueId]);

    if (loading) {
        return <div className='flex h-screen items-center justify-center'>
            <BeatLoader color='#FFFFFF' />
        </div>;
    }



    return (
        <div>
            <CustomKanban data={data?.tasks} uniqueId={uniqueId} />
        </div>
    );
};

export default Page;
