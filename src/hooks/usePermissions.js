import { useEffect } from 'react';
import { askAsync } from 'expo-permissions';
import useMountedState from './useMountedState';

// types === Permisions.CAMERA
export default function usePermissions(types) {
    const [status, setStatus] =  useMountedState(null);
    useEffect(() => {
        askAsync(...types).then(result => setStatus(result.status));
    }, []);
    return status;
}