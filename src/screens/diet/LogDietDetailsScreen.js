import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { View, ScrollView } from "react-native";
import {
  Text,
  Button,
  TextInput,
  FAB,
  Portal,
  Provider,
  Snackbar,
} from "react-native-paper";
import LoadingScreen from "../LoadingScreen";
import Firebase from "firebase";
import DropDown from "~/src/components/DropDown";
import moment from "moment";
import { setLogs } from "~/src/store/authSlice";

export default function LogDietDetailsScreen({ route, navigation }) {
  let meals = [
    { label: "Breakfast", value: "breakfast" },
    { label: "Lunch", value: "lunch" },
    { label: "Snack", value: "snack" },
    { label: "Dinner", value: "dinner" },
  ];

  let user = useSelector((state) => state.main.auth.user);
  const userFireBaseRef = Firebase.database();
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [showDropDown, setShowDropDown] = useState(false);
  const [mealSelected, setMealSelected] = useState(null);
  const [itemName, setItemName] = useState(null);
  const [calorieAmount, setCalorieAmount] = useState(null);
  const [proteinAmount, setProteinAmount] = useState(null);
  const [fatAmount, setFatAmount] = useState(null);
  const [carbAmount, setCarbAmount] = useState(null);
  const [description, setDescription] = useState(null);
  const [loggedItems, setLoggedItems] = useState([]);
  //Snack Bar
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");

  const { recipe } = route.params || {};

  useEffect(() => {
    if (recipe != null) {
      console.log("loading recipe data from previous page");
      setItemName(recipe.title);
      setFatAmount(recipe.nutrients.fat.amount.toString());
      setProteinAmount(recipe.nutrients.protein.amount.toString());
      setCarbAmount(recipe.nutrients.carbohydrates.amount.toString());
      setCalorieAmount(recipe.nutrients.calories.amount.toString());
    }
  }, []);

  const clearInputs = () => {
    setItemName(null);
    setDescription(null);
    setFatAmount(null);
    setProteinAmount(null);
    setCarbAmount(null);
    setCalorieAmount(null);
  };

  const isValid = () => {
    return !!mealSelected && !!calorieAmount;
  };

  const onSaveChanges = () => {
    setLoading(true);
    setMessage("Meals logged.");
    const today = moment().format("YYYYMMDD");
    let updateObj = {};
    for (let loggedItem of loggedItems) {
      let userDatabaseLogRef = Firebase.database().ref(
        `/users/${user.uid}/logs/${today}/diet/${loggedItem.meal}`
      );
      userDatabaseLogRef.once("value", (snapshot) => {
        let value = snapshot.val();
        if (!!value) {
          console.log(value);
          let newUserDatabaseLogRef = Firebase.database().ref(
            `/users/${user.uid}/logs/${today}/diet`
          );
          if (Array.isArray(value)) {
            newUserDatabaseLogRef.update({
              [mealSelected]: [...value, loggedItem],
            });
            updateObj[mealSelected] = [...value, loggedItem];
          }
        } else {
          let newUserDatabaseLogRef = Firebase.database().ref(
            `/users/${user.uid}/logs/${today}/diet`
          );
          newUserDatabaseLogRef.update({
            [loggedItem.meal]: [loggedItem],
          });
        }
        setVisible(true);
      });
    }
    // fetch from realtime db again
    setTimeout(() => {
      let userDatabaseDietRef = Firebase.database().ref(
        `/users/${user.uid}/logs`
      );
      userDatabaseDietRef.once("value", (snapshot) => {
        let value = snapshot.val();
        if (!!value) {
          console.log("value found");
          console.log(value);
          dispatch(setLogs({ logs: value }));
        }
        setLoading(false);
      });
    }, 1000);
    setTimeout(() => {
      navigation.goBack();
    }, 1000);
  };

  return (
    <View style={{ flex: 1 }}>
      {loading && <LoadingScreen />}
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <DropDown
          label={"Select Meal"}
          mode={"outlined"}
          value={mealSelected}
          setValue={setMealSelected}
          list={meals}
          visible={showDropDown}
          showDropDown={() => setShowDropDown(true)}
          onDismiss={() => setShowDropDown(false)}
        />
        <View style={{ marginTop: 10 }}>
          <Text>About the item</Text>
          <TextInput
            style={{ marginTop: 5, backgroundColor: "transparent" }}
            label="Food Item Name"
            value={itemName}
            onChangeText={(item) => setItemName(item)}
          />
          <TextInput
            style={{ marginTop: 5, backgroundColor: "transparent" }}
            label="Description (Optional)"
            value={description}
            onChangeText={(item) => setDescription(item)}
          />
        </View>
        <View style={{ marginVertical: 10 }}>
          <Text>Nutrients</Text>
          <TextInput
            style={{ marginTop: 5, backgroundColor: "transparent" }}
            keyboardType={"number-pad"}
            label="Calories (in KCals)"
            value={calorieAmount}
            onChangeText={(item) => setCalorieAmount(item)}
          />
          <TextInput
            style={{ marginTop: 5, backgroundColor: "transparent" }}
            keyboardType={"number-pad"}
            label="Proteins (in grams)"
            value={proteinAmount}
            onChangeText={(item) => setProteinAmount(item)}
          />
          <TextInput
            style={{ marginTop: 5, backgroundColor: "transparent" }}
            keyboardType={"number-pad"}
            label="Carbs (in grams)"
            value={carbAmount}
            onChangeText={(item) => setCarbAmount(item)}
          />
          <TextInput
            style={{ marginTop: 5, backgroundColor: "transparent" }}
            keyboardType={"number-pad"}
            label="Fats (in grams)"
            value={fatAmount}
            onChangeText={(item) => setFatAmount(item)}
          />
        </View>
        <Button
          icon="check"
          mode="contained"
          onPress={() => {
            if (isValid()) {
              let mealObj = {
                meal: mealSelected,
                itemName,
                ...(!!description && { description }),
                calorieAmount,
                ...(!!proteinAmount && { proteinAmount }),
                ...(!!fatAmount && { fatAmount }),
                ...(!!carbAmount && { carbAmount }),
              };
              console.log(mealObj);
              setLoggedItems([...loggedItems, mealObj]);
              clearInputs();
            } else {
              setMessage("Please select meal type and fill in calorie amount.");
              setVisible(true);
            }
          }}
        >
          ADD
        </Button>
      </ScrollView>
      <Provider>
        <Portal>
          {/* <Button
                        style={{position: "absolute", alignSelf: 'flex-start', margin: 16, left: 0, bottom: 0}} 
                    >VIEW LOGS</Button> */}
          <FAB
            small
            style={{
              position: "absolute",
              alignSelf: "flex-end",
              margin: 16,
              right: 0,
              bottom: 0,
            }}
            icon={`plus`}
            disabled={!loggedItems.length}
            label={`Submit Log ${
              !!loggedItems.length ? `(${loggedItems.length} logged)` : ``
            }`}
            onPress={() => onSaveChanges()}
          />
        </Portal>
      </Provider>
      <Snackbar
        visible={visible}
        onDismiss={() => setVisible(false)}
        duration={2000}
      >
        {message}
      </Snackbar>
      <View style={{ marginBottom: 50 }}></View>
    </View>
  );
}
