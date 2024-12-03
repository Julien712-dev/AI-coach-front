import { useState } from "react";
import spoonacular from "~/src/api/spoonacular";
import Firebase from "firebase";
import "firebase/firestore";
import apikeys from "../../apikeys";

import useProfileFirebase from "../useProfileFirebase";

function shuffle(array) {
  var currentIndex = array.length,
    temporaryValue,
    randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

export default () => {
  const apiKey = apikeys.spoonacularApiKey;
  const defaultRecipeList = {
    American: 10,
    Chinese: 10,
    Japanese: 10,
    French: 10,
    Korean: 10,
    Thai: 10,
  };
  const [recipeResults, setRecipeResults] = useState(null);
  const [restaurantResults, setRestaurantResults] = useState(null);
  const [isFetched, setIsFetched] = useState(false);

  const { cuisineList, fetchCuisineListAsync } = useProfileFirebase();

  const cuisineTypeGenerator = () => {
    const cuisineTypesAvailable = [
      "Chinese",
      "Japanese",
      "Korean",
      "French",
      "American",
      "Thai",
      "Vietnamese",
      "Italian",
    ];
    let n = 2;
    let randomItems = cuisineTypesAvailable
      .sort(() => 0.5 - Math.random())
      .slice(0, n);

    return randomItems.toString();
  };

  // dataList format === { 'a': 1, 'b': 2, 'c': 3}
  const weightedRandom = (dataList = defaultRecipeList, number) => {
    let items = Object.keys(dataList);
    let weights = Object.values(dataList);
    let randomChoices = {};
    let i = 0;
    for (i = 0; i < weights.length; i++) weights[i] += weights[i - 1] || 0;
    for (let j = 0; j < number; j++) {
      var random = Math.random() * weights[weights.length - 1];
      for (i = 0; i < weights.length; i++) if (weights[i] > random) break;
      if (randomChoices[items[i]] != null) randomChoices[items[i]] += 1;
      else randomChoices[items[i]] = 1;
    }
    return randomChoices;
  };

  // To process the nutrient information in results.
  const processResults = (dataList) => {
    dataList.forEach((recipe) => {
      const nutrients = recipe.nutrition.nutrients;
      if (nutrients === null) return dataList;
      recipe.nutrients = {};
      for (var i = 0; i < nutrients.length; i++) {
        recipe.nutrients[nutrients[i].title.toLowerCase()] = {
          amount: Math.round(nutrients[i].amount),
          unit: nutrients[i].unit,
        };
      }
      delete recipe.nutrition;
    });
    return dataList;
  };

  const searchByName = async ({
    query,
    cuisine,
    type = "lunch",
    excludeIngredients,
    minCarbs = 0,
    maxCarbs,
    minProtein = 0,
    maxProtein,
    minCalories = 0,
    maxCalories,
    minFat = 0,
    maxFat,
  }) => {
    setIsFetched(false);
    try {
      console.log({
        // type,
        // minCarbs,
        // maxCarbs,
        // maxProtein,
        // minCalories,
        // maxCalories,
        // maxFat,
        query
      });

      const response = await spoonacular.get("/complexSearch", {
        params: {
          apiKey,
          query,
          minCarbs,
          minProtein,
          minFat,
          minCalories,
          type,
          number: 6,
        },
      });
      const results = processResults(response.data.results);
      console.log(results);
      setRecipeResults(results);
      setIsFetched(true);
    } catch (e) {
      console.log(e);
    }
  };

  const searchByNutrients = async (keyword) => {
    try {
      const response = await spoonacular.get("/findByNutrients", {
        params: {
          apiKey,
          minCalories: 50,
          maxCalories: 800,
          number: 3,
        },
      });
      setRecipeResults(response.data.results);
    } catch (e) {
      console.log(e);
    }
  };

  // number is number of results
  const smartSearch = async (
    number,
    { type = "lunch", minCalories, maxCalories, vegetarian=false }
  ) => {
    const list = await fetchCuisineListAsync();
    const searchList = weightedRandom(list, number);
    console.log('searchlist: ', searchList);
    let tempResults = [];
    try {
      for (let cuisine in searchList) {
        console.log(searchList[cuisine]);
        const response = await spoonacular.get("/complexSearch", {
          params: {
            apiKey,
            cuisine,
            type,
            minCalories,
            maxCalories,
            number: searchList[cuisine],
            ...(!!vegetarian && {diet: 'vegetarian'})
          },
        });
        // add the cuisine type to the result manually
        response.data.results.forEach((item) => {
          item.cuisineType = cuisine;
        });
        tempResults = tempResults.concat(response.data.results);
      }
      setRecipeResults(tempResults);
      console.log("smart search returned ", tempResults.length, " results");
      return tempResults;
    } catch (e) {
      console.log(e);
    }
  };

  const fakeSearch = () => {
    console.log("in fake search");
    let recipeResults = [
      {
        id: 716429,
        calories: 584,
        carbs: "84g",
        fat: "20g",
        image: "https://spoonacular.com/recipeImages/716429-312x231.jpg",
        imageType: "jpg",
        protein: "19g",
        title: "Pasta with Garlic, Scallions, Cauliflower & Breadcrumbs",
      },
      {
        id: 715538,
        calories: 521,
        carbs: "69g",
        fat: "10g",
        image: "https://spoonacular.com/recipeImages/715538-312x231.jpg",
        imageType: "jpg",
        protein: "35g",
        title: "Bruschetta Style Pork & Pasta",
      },
      {
        id: 715539,
        calories: 521,
        carbs: "69g",
        fat: "10g",
        image: "https://spoonacular.com/recipeImages/715538-312x231.jpg",
        imageType: "jpg",
        protein: "35g",
        title: "Bruschetta Style Pork & Pasta",
      },
      {
        id: 715578,
        calories: 521,
        carbs: "69g",
        fat: "10g",
        image: "https://spoonacular.com/recipeImages/715538-312x231.jpg",
        imageType: "jpg",
        protein: "35g",
        title: "Bruschetta Style Pork & Pasta",
      },
      {
        id: 715544,
        calories: 521,
        carbs: "69g",
        fat: "10g",
        image: "https://spoonacular.com/recipeImages/715538-312x231.jpg",
        imageType: "jpg",
        protein: "35g",
        title: "Bruschetta Style Pork & Pasta",
      },
      {
        id: 715533,
        calories: 521,
        carbs: "69g",
        fat: "10g",
        image: "https://spoonacular.com/recipeImages/715538-312x231.jpg",
        imageType: "jpg",
        protein: "35g",
        title: "Bruschetta Style Pork & Pasta",
      },
    ];
    setRecipeResults(recipeResults);
    return recipeResults;
  };

  const getRestaurantRecommendations = async ({
    minCarbs,
    maxCarbs,
    minProtein,
    maxProtein,
    minCalories = 0,
    maxCalories,
    minFat,
    maxFat,
  }) => {
    console.log("searching restaurants");
    const list = await fetchCuisineListAsync();
    const searchList = weightedRandom(defaultRecipeList, 5);
    console.log("wr list from getRestaurant", searchList);
    try {
      let foodItems = [];

      const snapshot = await Firebase.firestore()
        .collection("restaurants")
        .where("type", "array-contains-any", ['breakfast', 'lunch', 'dinner'])
        .get();

      if (snapshot.empty) {
        console.log("No matching documents.");
        return;
      }
      snapshot.forEach((doc) => {
        console.log(doc.id, "=>", doc.data());
      });

      snapshot.forEach((doc) => {
        let restaurantData = doc.data();
        if (!restaurantData.menuDataWithNutritionInfo) return;
        let recommendedItem = restaurantData.menuDataWithNutritionInfo[0];
        let properItemFound = false;
        for (var item of restaurantData.menuDataWithNutritionInfo) {
          if (item.nutritionValues == "N.A.") continue;
          else if (
            item.nutritionValues.nf_calories >= minCalories &&
            item.nutritionValues.nf_calories <= maxCalories
          ) {
            recommendedItem = item;
            // break;
            foodItems.push({ ...restaurantData, recommendedItem });
          }
        }
      });
      console.log(foodItems);
      foodItems = shuffle(foodItems);
      let foodItemsAccordingToWishList = {};
      for (let cuisineType in searchList) {
        foodItemsAccordingToWishList[cuisineType] = 0;
      }
      let finalResults = [];
      for (let cuisineType in searchList) {
        for (let i of foodItems) {
          if ((i.cuisineType || []).includes(cuisineType)) {
            if (
              foodItemsAccordingToWishList[cuisineType] <
              searchList[cuisineType]
            ) {
              foodItemsAccordingToWishList[cuisineType]++;
              finalResults.push(i);
            } else break;
          } else continue;
        }
      }
      let results = foodItems.slice(0, 5);
      setRestaurantResults(results);
      console.log("restaurant results from firebase: ", results);
      console.log("restaurant full results from firebase: ", finalResults);
      return results;
    } catch (e) {
      console.log(e);
    }
  };

  return {
    searchByName,
    searchByNutrients,
    smartSearch,
    fakeSearch,
    getRestaurantRecommendations,
    recipeResults,
    restaurantResults,
    isFetched
  };
};
