import { clsx } from "clsx";
import { useEffect, useState } from "react";

export function Visualizer({ isPlaying }: { isPlaying: boolean }) {
    const [heights, setHeights] = useState([30, 60, 40, 70]);

    useEffect(() => {
        if (!isPlaying) {
            setHeights([20, 20, 20, 20]);
            return;
        }

        const interval = setInterval(() => {
            setHeights([
                Math.random() * 60 + 20, // 20-80%
                Math.random() * 60 + 20,
                Math.random() * 60 + 20,
                Math.random() * 60 + 20,
            ]);
        }, 300);

        return () => clearInterval(interval);
    }, [isPlaying]);

    return (
        <div className="flex items-end gap-1 h-4">
            {heights.map((height, i) => (
                <div
                    key={i}
                    className="w-1 bg-green-500 rounded-t-sm transition-all duration-300 ease-in-out"
                    style={{
                        height: `${height}%`,
                    }}
                />
            ))}
        </div>
    );
}
