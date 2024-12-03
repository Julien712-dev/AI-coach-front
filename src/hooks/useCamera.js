import React, { useState, useEffect, useRef } from "react";
import { Camera } from "expo-camera";
import * as ImageManipulator from "expo-image-manipulator";

// this hook is used by FoodClassifyScreen.js

export default function useCamera() {
  DESIRED_RATIO = "1:1";

  const [hasPermission, setHasPermission] = useState(null);

  const [hdPhoto, setHdPhoto] = useState(null);
  const [ldPhoto, setLdPhoto] = useState(null);

  // check permission first
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestPermissionsAsync();
      setHasPermission(status === "granted");
      console.log("Camera Permission is ", status);
    })();
  }, []);

  const takePicture = async ({ cameraRef }) => {
    if (!cameraRef) return;
    const hd = await cameraRef.current.takePictureAsync();
    const ld = await ImageManipulator.manipulateAsync(hd.uri, [
      { resize: { width: 224, height: 224 } },
    ]);

    setHdPhoto(hd);
    setLdPhoto(ld);
    return ld.uri;
  };

  // This is not a proper cleaning function, it just set the state to null
  const cleanPhoto = () => {
    setHdPhoto(null);
    setLdPhoto(null);
  };

  // 'ld' for low resolution
  return { hasPermission, hdPhoto, ldPhoto, takePicture, cleanPhoto };
}
