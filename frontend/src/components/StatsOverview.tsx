import React, { useEffect, useState } from "react";
import FlipNumbers from "react-flip-numbers";

const START_PACKETS = 356;
const START_TRAYS = 31;

const StatsOverview = () => {
    const [animatedPackets, setAnimatedPackets] = useState(START_PACKETS);
    const [animatedTrays, setAnimatedTrays] = useState(START_TRAYS);

    useEffect(() => {
        const interval = setInterval(() => {
            setAnimatedPackets(prev => prev + 65);
            setAnimatedTrays(prev => prev + 12);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border">
            <div className="grid grid-cols-2 divide-x">
                <div className="px-8 py-6">
                    <p className="text-sm font-medium text-gray-500">Total Packets</p>
                    <div className="mt-2 text-4xl font-semibold text-gray-900" style={{ minHeight: 80 }}>
                        <FlipNumbers
                            height={20}
                            width={30}
                            color="#111827"
                            background="white"
                            play
                            perspective={100}
                            numbers={animatedPackets.toString()}
                        />
                    </div>
                </div>
                <div className="px-8 py-6">
                    <p className="text-sm font-medium text-gray-500">Total Trays</p>
                    <div className="mt-2 text-4xl font-semibold text-gray-900" style={{ minHeight: 80 }}>
                        <FlipNumbers
                            height={20}
                            width={30}
                            color="#111827"
                            background="white"
                            play
                            perspective={100}
                            numbers={animatedTrays.toString()}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatsOverview;
