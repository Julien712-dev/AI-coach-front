import { useState, useRef } from 'react';
import { Platform } from 'react-native';

export default function useCameraRatio(preferredRatio, { tensor = false }) {
    const [cameraRatio, setCameraRatio] = useState(preferredRatio);
    const cameraRef = useRef(null);
    if (Platform.OS == 'ios') {
        return [cameraRef, () => {}, '16:9'];
    } else {
        const onCameraReady = async () => {
            const refCurrent = tensor ? cameraRef.current.camera : cameraRef.current;
            const ratios = await refCurrent.getSupportedRatiosAsync();
            setCameraRatio(ratios.find(r => r === cameraRatio) || ratios[ratios.length - 1])
        };
        return [cameraRef, onCameraReady, cameraRatio];
    }
}