import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import config from "~/src/config";
import moment from "moment";
import { View, ScrollView, RefreshControl } from "react-native";
import { Text, Title, Card, Paragraph } from "react-native-paper";
import Carousel from "react-native-snap-carousel";
import DietLoggingFAB from "./dietLoggingFAB";
import {
  computeNutritionValues,
  getCoachAdvice,
} from "~/src/hooks/diet/Nutrition";
import searchRecipe from "~/src/hooks/diet/searchRecipe";

import LoadingScreen from "../LoadingScreen";
import ShowCard from "~/src/components/ShowCard";
import Popup from "~/src/components/Popup";
import useLocation from "~/src/hooks/useLocation";

export default function DietScreenMain({ navigation }) {
  const [time, setTime] = useState();
  const [message, setMessage] = useState({});
  const [coachAdvice, setCoachAdvice] = useState("");
  const [loading, setLoading] = useState(false);
  const {
    searchByName,
    searchByNutrients,
    smartSearch,
    getRestaurantRecommendations,
    recipeResults,
    restaurantResults,
  } = searchRecipe();
  // Carousels
  const [
    recommendedMealCarouselActiveIndex,
    setRecommendedMealCarouselActiveIndex,
  ] = useState(0);
  const [
    restaurantMenuCarouselActiveIndex,
    setRestaurantMenuCarouselActiveIndex,
  ] = useState(0);

  const {
    grant,
    district,
    requestLocationPermissionAsync,
    updateLocationAsync,
  } = useLocation();
  const [showPopup, setShowPopup] = useState(false);
  const [refreshTimes, setRefreshTimes] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  let profileRedux = useSelector((state) => state.main.auth.profile) || {};

  // For location use, to get location permission from user

  useEffect(() => {
    console.log("inside dietscreen useeffect", grant);
    setShowPopup(!grant);
  }, [grant]);

  useEffect(() => {
    console.log("inside dietscreen useeffect");
    let currentTime = new Date();
    let meal = config.messages.diet.find(
      (message) =>
        message.startAt <= moment(currentTime).hour() &&
        message.endAt > moment(currentTime).hour()
    );
    setTime(currentTime);
    setMessage(meal);
    setCoachAdvice(getCoachAdvice(profileRedux));

    (async () => {
      if (!!profileRedux) {
        setLoading(true);
        let nutritionValues = computeNutritionValues(profileRedux);
        let isVegetarian = !!profileRedux.dietRestrictions && profileRedux.dietRestrictions.includes('vegetarian')
        // can add more params afterwards
        await smartSearch(3, {
          type: meal.typeQueryForSpoonacular,
          minCalories:
            meal.meal == "breakfast" || meal.meal == "snack"
              ? 0
              : nutritionValues.dailyRecommendedCalories * 0.55 * meal.weight,
          maxCalories: nutritionValues.dailyRecommendedCalories * meal.weight,
          vegetarian: isVegetarian
        });

        await getRestaurantRecommendations({
          minCalories:
            meal.meal == "breakfast" || meal.meal == "snack"
              ? 0
              : nutritionValues.dailyRecommendedCalories * 0.55 * meal.weight,
          maxCalories: nutritionValues.dailyRecommendedCalories * meal.weight,
        });

        setLoading(false);
        console.log("finish loading");
      }
    })();
  }, [refreshTimes]);

  const wait = (timeout) => {
    return new Promise((resolve) => {
      setTimeout(resolve, timeout);
    });
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    console.log("refresh pressed");
    // This triggers the food and restaurant search again
    setRefreshTimes(refreshTimes + 1);

    wait(2000).then(() => setRefreshing(false));
  }, []);

  // Render function for recipe item recommendations.
  function _renderRecipeRecommendations({ item, index }) {
    let calorieObj = (item.nutrition.nutrients || []).find(
      (nutrient) => nutrient.title == "Calories"
    );
    return (
      <ShowCard
        title={item.title}
        id={item.id}
        cuisineType={item.cuisineType}
        description={`${Math.round(calorieObj.amount)} kcal`}
        image={item.image}
        enableLike={true}
      />
    );
  }

  // Render function for restaurant menu item recommendations.
  function _renderRestaurantMenuItems({ item, index }) {
    console.log("rendering restaurant");
    return (
      <ShowCard
        title={item.recommendedItem.itemName}
        id={item.address}
        description={`${item.recommendedItem.nutritionValues.nf_calories} kcal\n\n${item.name}\n\n${item.address}`}
        image={item.image}
        enableLike={false}
      />
    );
  }

  if (!recipeResults) return <LoadingScreen />;

  return (
    <View style={{ flex: 1 }}>
      {showPopup ? (
        <Popup
          title="Location Service"
          message="Our application will use your location for restaruant suggestion."
          callback={requestLocationPermissionAsync}
        />
      ) : null}
      <ScrollView
        contentContainerStyle={{ padding: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Title style={{ fontSize: 25 }}>{message.title}</Title>
        <Text style={{ marginBottom: 10 }}>{message.message}</Text>
        <View
          style={{
            marginVertical: 15,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Carousel
            layout={"default"}
            layoutCardOffset={5}
            activeSlideOffset={5}
            data={recipeResults || []}
            containerCustomStyle={{ overflow: "visible" }}
            sliderWidth={300}
            itemWidth={300}
            renderItem={_renderRecipeRecommendations}
            onSnapToItem={(index) =>
              setRecommendedMealCarouselActiveIndex(index)
            }
          />
        </View>
        <Card style={{ width: "100%", marginTop: 10, marginBottom: 15 }}>
          <Card.Title title={`Coach's Advice:`} />
          <Card.Content>
            <Paragraph>{coachAdvice}</Paragraph>
          </Card.Content>
        </Card>
        <Title style={{ fontSize: 25 }}>Dining out?</Title>
        <Text style={{ marginBottom: 10 }}>
          Stay healthy while eating outside!
        </Text>
        <View
          style={{
            marginVertical: 15,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {!!restaurantResults && (
            <Carousel
              layout={"default"}
              layoutCardOffset={9}
              data={restaurantResults}
              containerCustomStyle={{ overflow: "visible" }}
              sliderWidth={300}
              itemWidth={300}
              renderItem={_renderRestaurantMenuItems}
              onSnapToItem={(index) =>
                setRestaurantMenuCarouselActiveIndex(index)
              }
            />
          )}
          {!restaurantResults && (
            <View style={{ justifyContent: "center", alignItems: "center" }}>
              <Text>Preparing restaurant recommendations!</Text>
            </View>
          )}
        </View>
        <View style={{ marginBottom: 80 }}></View>
      </ScrollView>
      <DietLoggingFAB navigation={navigation} />
    </View>
  );
}
