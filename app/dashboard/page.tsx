"use client"
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Page = () => {
    const [data, setData] = useState(null); // State to store the fetched data
    const [loading, setLoading] = useState(true); // State for loading

    // The uniqueId to send to the API
    const uniqueId = 'user_2mEj3i8jsWxAUSsfp3qMdqQo9UA';

    // Fetch data from the API on component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.post('/api/getData', { uniqueId });
                setData(response.data); // Store data in state
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false); // Turn off loading after the request completes
            }
        };

        fetchData();
    }, []); // Empty dependency array ensures this runs once when the component mounts

    if (loading) {
        return <div>Loading...</div>; // Show a loading message while fetching data
    }

    return (
        <div>
            <h1>Fetched Data</h1>
            {data ? (
                <pre>{JSON.stringify(data, null, 2)}</pre> // Display the fetched data in a readable format
            ) : (
                <p>No data available</p>
            )}
        </div>
    );
};

export default Page;
