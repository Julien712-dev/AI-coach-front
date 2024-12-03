import { useState, useEffect } from 'react';

export default function useTimer(dependencies, updateInterval = 10) {
    const [startTime, setStartTime] = useState((new Date()).getTime());
    const [currentTime, setCurrentTime] = useState((new Date()).getTime());
    useEffect(() => {
        let interval = setInterval(() => setCurrentTime((new Date()).getTime()), updateInterval);
        return () => clearInterval(interval);
    }, []);
    useEffect(() => {
        setStartTime((new Date()).getTime());
    }, dependencies);
    return currentTime - startTime;
}