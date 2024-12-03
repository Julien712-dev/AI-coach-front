import { useState, useRef, useEffect } from 'react';

export default function useMountedState(initialValue) {
    const [state, setState] = useState(initialValue);
    const isMounted = useRef(true);
    useEffect(() => {
        isMounted.current = true;
        return () => isMounted.current = false;
    }, []);
    const setMountedState = newState => {
        if (isMounted.current)
            setState(newState);
    };
    return [state, setMountedState];
}