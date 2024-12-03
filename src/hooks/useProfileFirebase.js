import React, { useState, useEffect } from "react";
import Firebase from "firebase";

// There are some console.log() in this file which can be removed in the future.

export default () => {
  // In case we can't retrieve the cuisine list from firebase, use this.
  const defaultCuisineList = {
    American: 10,
    French: 10,
    Chinese: 10,
    Japanese: 10,
    Korean: 10,
    Thai: 10,
    Italian: 10,
  };
  const [cuisineList, setCuisineList] = useState(null);

  useEffect(() => {
    fetchCuisineListAsync();
  }, []);

  const fetchCuisineListAsync = async () => {
    let data = await fetchData({ path: "/cuisineList" });
    if (data === null) data = defaultCuisineList;
    setCuisineList(data);
    return data;
  };

  const updateCuisineList = ({ cuisineType, change }) => {
    let newValue =
      cuisineList[cuisineType] === undefined
        ? 10 + change
        : cuisineList[cuisineType] + change;
    if (newValue > 18) newValue = 18;
    else if (newValue < 2) newValue = 2;
    updateData({
      path: "/cuisineList",
      data: { [cuisineType]: newValue },
    });
    fetchCuisineListAsync();
  };

  // General functions

  const fetchData = async ({ path }) => {
    const { currentUser } = Firebase.auth();
    let data;
    await Firebase.database()
      .ref(`/users/${currentUser.uid}${path}`)
      .once("value", (snapshot) => {
        data = snapshot.val();
      });
    return data;
  };

  const updateData = async ({ path, data }) => {
    const { currentUser } = Firebase.auth();
    console.log("in updateData, append: ", data, " to path: ", path);
    await Firebase.database()
      .ref(`/users/${currentUser.uid}${path}`)
      .update(data)
      .catch((err) => {
        console.log(err);
      });
  };

  const setData = async ({ path, data }) => {
    const { currentUser } = Firebase.auth();
    await Firebase.database()
      .ref(`/users/${currentUser.uid}${path}`)
      .set(data)
      .catch((err) => {
        console.log(err);
      });
  };

  return { cuisineList, fetchCuisineListAsync, updateCuisineList };
};
