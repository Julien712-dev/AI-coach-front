import React from "react";
import { useSelector } from "react-redux";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { Appbar, Avatar } from "react-native-paper";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";

// Importing Screens
import HomeScreen from "./screens/HomeScreen";
import DetailsScreen from "./screens/DetailsScreen";
import EntranceSurveyScreen from "./screens/survey/EntranceSurveyScreen";

// Diet Screens
import DietScreenMain from "./screens/diet/DietScreenMain";
import EditDietScreen from "./screens/diet/EditDietScreen";
import LogDietScreen from "./screens/diet/LogDietScreen";
import LogDietDetailsScreen from "./screens/diet/LogDietDetailsScreen";
import FoodClassifyScreen from "./screens/diet/FoodClassifyScreen";

// Exercise Screens
import ExerciseMainScreen from "./screens/exercise/ExerciseMainScreen";
import PlanWorkoutScreen from "./screens/exercise/PlanWorkoutScreen";
import ViewWorkoutScreen from "./screens/exercise/ViewWorkoutScreen";
import ViewExerciseScreen from "./screens/exercise/ViewExerciseScreen";
import DoWorkoutScreen from "./screens/exercise/DoWorkoutScreen";
import LogWorkoutScreen from './screens/exercise/LogWorkoutScreen';

// Login Screen
import LoginScreen from "./screens/login/LoginScreen";
import SignUpScreen from "./screens/login/SignUpScreen";
import { TouchableOpacity } from "react-native";

const Header = ({ scene, previous, navigation }) => {
  const { options } = scene.descriptor;
  const title =
    options.headerTitle !== undefined
      ? options.headerTitle
      : options.title !== undefined
      ? options.title
      : scene.route.name;

  return (
    <Appbar.Header theme={{ colors: { primary: "#1E90FF" } }}>
      {previous ? (
        <Appbar.BackAction onPress={navigation.goBack} color={"white"} />
      ) : (
        <TouchableOpacity>
          <Avatar.Icon size={40} icon="account-circle-outline" />
        </TouchableOpacity>
      )}
      <Appbar.Content
        title={
          previous ? (
            title
          ) : (
            <Ionicons name="ios-walk" size={40} color={"white"} />
          )
        }
      />
    </Appbar.Header>
  );
};

// Stacks
const HomeStack = createStackNavigator();

function HomeStackScreen() {
  return (
    <HomeStack.Navigator
      initialRouteName="Home Main"
      headerMode="screen"
      screenOptions={{
        header: ({ scene, previous, navigation }) => (
          <Header scene={scene} previous={previous} navigation={navigation} />
        ),
      }}
    >
      <HomeStack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerTitle: "Home" }}
      />
      <HomeStack.Screen
        name="Details"
        component={DetailsScreen}
        options={{ headerTitle: "My Diet" }}
      />
      <HomeStack.Screen
        name="Log Diet"
        component={LogDietScreen}
        options={{ headerTitle: "Log Diet" }}
      />
      <HomeStack.Screen
        name="Log Diet Details"
        component={LogDietDetailsScreen}
        options={{ headerTitle: "Log Diet Details" }}
      />
      <HomeStack.Screen name="Login" component={LoginScreen} />
    </HomeStack.Navigator>
  );
}

const DietStack = createStackNavigator();

function DietStackScreen() {
  return (
    <DietStack.Navigator
      initialRouteName="Diet Main"
      headerMode="screen"
      screenOptions={{
        header: ({ scene, previous, navigation }) => (
          <Header scene={scene} previous={previous} navigation={navigation} />
        ),
      }}
    >
      <DietStack.Screen
        name="Diet"
        component={DietScreenMain}
        options={{ headerTitle: "My Diet" }}
      />
      <DietStack.Screen
        name="Edit Diet"
        component={EditDietScreen}
        options={{ headerTitle: "Edit Diet" }}
      />
      <DietStack.Screen
        name="Log Diet"
        component={LogDietScreen}
        options={{ headerTitle: "Log Diet" }}
      />
      <DietStack.Screen
        name="Log Diet Details"
        component={LogDietDetailsScreen}
        options={{ headerTitle: "Log Diet Details" }}
      />
      <DietStack.Screen
        name="Classify Food"
        component={FoodClassifyScreen}
        options={{ headerTitle: "Food Classify" }}
      />
    </DietStack.Navigator>
  );
}

const ExerciseStack = createStackNavigator();

function ExerciseStackScreen() {
  return (
    <ExerciseStack.Navigator
      initialRouteName="Exercise Main"
      headerMode="screen"
      screenOptions={{
        header: ({ scene, previous, navigation }) => (
          <Header scene={scene} previous={previous} navigation={navigation} />
        ),
      }}
    >
      <ExerciseStack.Screen
        name="Exercise"
        component={ExerciseMainScreen}
        options={{ headerTitle: "Workouts" }}
      />
      <ExerciseStack.Screen
        name="Plan Workout"
        component={PlanWorkoutScreen}
        options={{ headerTitle: "Plan Workout" }}
      />
      <ExerciseStack.Screen
        name="View Workout"
        component={ViewWorkoutScreen}
        options={{ headerTitle: "View Workout" }}
      />
      <ExerciseStack.Screen
        name="View Exercise"
        component={ViewExerciseScreen}
        options={{ headerTitle: "View Exercise" }}
      />
      <ExerciseStack.Screen
        name="Do Workout"
        component={DoWorkoutScreen}
        options={{ headerTitle: "Do Workout" }}
      />
      <ExerciseStack.Screen
        name="Log Workout"
        component={LogWorkoutScreen}
        options={{ headerTitle: "Log Workout" }}
      />
    </ExerciseStack.Navigator>
  );
}

// Bottom Tab - Home, Diet and Exercise
const Tab = createBottomTabNavigator();

function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = focused ? "ios-list-box" : "ios-list";
          } else if (route.name === "Diet") {
            iconName = "ios-restaurant";
          } else if (route.name === "Exercise") {
            iconName = "ios-pulse";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Home"
        options={{ headerShown: false }}
        component={HomeStackScreen}
      />
      <Tab.Screen
        name="Diet"
        options={{ headerShown: false }}
        component={DietStackScreen}
      />
      <Tab.Screen
        name="Exercise"
        options={{ headerShown: false }}
        component={ExerciseStackScreen}
      />
    </Tab.Navigator>
  );
}

const Stack = createStackNavigator();
export default function Routers({ theme }) {
  const loggedIn = useSelector((state) => !!state.main.auth.user);

  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator
        mode="modal"
        screenOptions={{ headerShown: false }}
        initialRouteName={loggedIn ? "Home" : "Login"}
      >
        {!!loggedIn ? (
          <>
            <Stack.Screen name="Home" component={BottomTabs} />
            <Stack.Screen
              name="Entrance Survey"
              component={EntranceSurveyScreen}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Sign Up" component={SignUpScreen} />
          </>
        )}
        {/* Bottom Tab Bar is hidden for the following screens */}
        <Stack.Screen
          name="Edit Diet"
          component={EditDietScreen}
          options={EditDietScreen.navigationOptions}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
