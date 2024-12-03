import { useState, useEffect } from "react";
import {
  requestPermissionsAsync,
  getCurrentPositionAsync,
  Accuracy,
  reverseGeocodeAsync,
  getPermissionsAsync,
} from "expo-location";

// run callback whenever receive a new position update
export default () => {
  const [grant, setGrant] = useState(true);
  const [location, setLocation] = useState(null);
  const [district, setDistrict] = useState(null);

  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = async () => {
    let { status } = await getPermissionsAsync();
    status === "granted" ? setGrant(true) : setGrant(false);
    console.log("inside checkPermission", status);
  };

  const requestLocationPermissionAsync = async () => {
    console.log("requesting location");
    let { status } = await requestPermissionsAsync();
    status === "granted" ? setGrant(true) : setGrant(false);
  };

  const updateLocationAsync = async () => {
    await getCurrentPositionAsync({ accuracy: Accuracy.Balanced })
      .then(async (response) => {
        setLocation(response.coords);
        let address = await reverseGeocodeAsync(response.coords);
        setDistrict(address[0].district);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return {
    requestLocationPermissionAsync,
    updateLocationAsync,
    grant,
    location,
    district,
  };
};
