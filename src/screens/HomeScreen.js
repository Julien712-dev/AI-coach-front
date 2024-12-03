import * as Firebase from "firebase";
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  SafeAreaView,
  ImageBackground,
} from "react-native";
import {
  useTheme,
  Button,
  Title,
  Card,
  Text,
  Divider,
  Portal,
  Dialog,
  Paragraph,
} from "react-native-paper";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";

import {
  logout as logoutAction,
  saveProfileToReducer,
  setLogs,
} from "../store/authSlice";
import { setPlan } from "../store/exerciseSlice";
import LoadingScreen from "./LoadingScreen";
import Carousel, { Pagination } from "react-native-snap-carousel";
import REST_DAY_IMAGE from "~/assets/image/rest-day.jpg";
import ARM_WORKOUT_IMAGE from "~/assets/image/exercise-survey-bg.jpg";
import GLUTE_WORKOUT_IMAGE from "~/assets/image/glute-workout.jpeg";
import CORE_WORKOUT_IMAGE from "~/assets/image/core-workout.jpeg";
import LEG_WORKOUT_IMAGE from "~/assets/image/leg-workout.jpeg";

import { Pedometer } from "expo-sensors";
import {
  VictoryBar,
  VictoryChart,
  VictoryTheme,
  VictoryLine,
} from "victory-native";
import {
  computeNutritionValues,
  computeNutritionValuesAsync,
} from "../hooks/diet/Nutrition";

function getWorkoutImage(workout) {
  switch (workout.focus) {
    case "arm":
      return ARM_WORKOUT_IMAGE;
    case "glute":
      return GLUTE_WORKOUT_IMAGE;
    case "core":
      return CORE_WORKOUT_IMAGE;
    case "leg":
      return LEG_WORKOUT_IMAGE;
    default:
      return ARM_WORKOUT_IMAGE;
  }
}

function getWorkoutDescription(workout) {
  switch (workout.focus) {
    case "arm":
      return "This workout is designed to train your arm strength.";
    case "glute":
      return "This is a glute workout routine to strengthen your buttocks.";
    case "core":
      return "Engage your core in this workout.";
    case "leg":
      return "We will workout your legs with this one.";
    default:
      return "Enjoy the designed routine!";
  }
}

export default function HomeScreen({ navigation }) {
  let user = useSelector((state) => state.main.auth.user) || {};
  let currentProfile = useSelector((state) => state.main.auth.profile) || {};
  let currentPlan = useSelector((state) => state.main.exercise.plan);
  let logs = useSelector((state) => state.main.auth.logs) || {};
  var plan = {};
  const [loading, setLoading] = useState(false);
  const [isFetched, setIsFetched] = useState(false);
  const [profile, setProfile] = useState(null);
  const [workoutOfTheDay, setWorkoutOfTheDay] = useState(null);
  const [insightCarouselActiveIndex, setInsightCarouselActiveIndex] = useState(
    0
  );
  const [calorieIntakeThisWeek, setCalorieIntakeThisWeek] = useState(0);
  const [calorieBurntThisWeek, setCalorieBurntThisWeek] = useState(0);
  const [workoutsCompletedThisWeek, setWorkoutsCompletedThisWeek] = useState(0);
  const [nutritionValues, setNutritionValues] = useState();

  const [todaySteps, setTodaySteps] = useState(0);
  const today = moment();
  const dispatch = useDispatch();

  const [dialogVisible, setDialogVisible] = useState(false);
  const { colors } = useTheme();

  function onLogWorkout(workout) {
    const workoutDbRef = Firebase.database().ref(
      `/users/${user.uid}/logs/${today.format("YYYYMMDD")}/workout`
    );
    const workouts = logs[today.format("YYYYMMDD")]?.workout;

    if (workouts != null && Array.isArray(workouts))
      workoutDbRef.set(workouts.concat([workout]));
    else workoutDbRef.set([workout]);

    // fetch from realtime db again
    setTimeout(() => {
      let userDatabaseDietRef = Firebase.database().ref(
        `/users/${user.uid}/logs`
      );
      userDatabaseDietRef.once("value", (snapshot) => {
        let value = snapshot.val();
        if (!!value) {
          dispatch(setLogs({ logs: value }));
        }
        setLoading(false);
      });
    }, 1000);
  }

  const logout = () => {
    Firebase.auth()
      .signOut()
      .then(() => {
        // Sign-out successful.
        dispatch(logoutAction());
      })
      .catch(() => {
        // An error happened.
      });
  };

  // Render function for recipe item recommendations.
  function InsightsSummary(props) {
    return (
      <View
        style={{
          flex: 1,
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Title style={{ fontSize: 26, marginTop: 15 }}>This Week</Title>
        <View style={{ flex: 1, flexDirection: "row" }}>
          <View style={{ width: 80, marginLeft: 5, justifyContent: "center" }}>
            <View style={{ justifyContent: "center", alignItems: "center" }}>
              <Text style={{ fontSize: 32 }}>
                {Math.round(calorieIntakeThisWeek)}
              </Text>
            </View>
            <View style={{ justifyContent: "center", alignItems: "center" }}>
              <Text style={{ fontSize: 10, textAlign: "center" }}>
                average calories intake
              </Text>
            </View>
          </View>
          <View
            style={{
              width: 110,
              marginHorizontal: 5,
              justifyContent: "center",
              marginBottom: 10,
            }}
          >
            <View style={{ justifyContent: "center", alignItems: "center" }}>
              <Text style={{ fontSize: 72, fontWeight: "600" }}>
                {workoutsCompletedThisWeek}
              </Text>
            </View>
            <View style={{ justifyContent: "center", alignItems: "center" }}>
              <Text style={{ fontSize: 12, textAlign: "center" }}>
                workouts completed
              </Text>
            </View>
          </View>
          <View style={{ width: 80, marginRight: 5, justifyContent: "center" }}>
            <View style={{ justifyContent: "center", alignItems: "center" }}>
              <Text style={{ fontSize: 32 }}>
                {Math.round(calorieBurntThisWeek)}
              </Text>
            </View>
            <View style={{ justifyContent: "center", alignItems: "center" }}>
              <Text style={{ fontSize: 10, textAlign: "center" }}>
                average calories consumption
              </Text>
            </View>
          </View>
        </View>
        {!!nutritionValues && <View style={{ marginBottom: 15 }}><Text>Recommended intake: {nutritionValues.dailyRecommendedCalories} kcal</Text></View>}
      </View>
    );
  }

  function InsightsDiet(props) {
    const data = [];
    // const nutritionValues = computeNutritionValues(profile)
    for (let d = 0; d < 7; d++) {
      let l = moment()
        .add(-6 + d, "days")
        .format("YYYYMMDD");
      // console.log(l)
      if (!!logs[l]) {
        let totalCalories = 0;
        for (let diet in logs[l]["diet"]) {
          let result = logs[l]["diet"][diet].reduce(function (acc, obj) {
            return acc + parseInt(obj.calorieAmount);
          }, 0); // 7
          totalCalories += result;
        }
        data.push({ day: moment(l).format("DD/MM"), calories: totalCalories });
      } else data.push({ day: moment(l).format("DD/MM"), calories: 0 });
    }
    // console.log(nutritionValues);
    if (!!nutritionValues) {
      return (
        <View
          style={{
            flex: 1,
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Title style={{ fontSize: 22, marginTop: 15 }}>Weekly Diet</Title>
          <VictoryChart
            width={310}
            height={200}
            theme={VictoryTheme.material}
            padding={{ left: 50, right: 50, top: 10, bottom: 40 }}
          >
            <VictoryLine
              y={() => nutritionValues.dailyRecommendedCalories}
              style={{ data: { stroke: "#c43a31", strokeWidth: 3 } }}
            />
            <VictoryBar data={data} x="day" y="calories" />
          </VictoryChart>
        </View>
      );
    }

    return (
      <View
        style={{
          flex: 1,
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Title style={{ fontSize: 22, marginTop: 15 }}>Weekly Diet</Title>
        <Text>Loading</Text>
      </View>
    );
  }

  function InsightsExercise(props) {
    const data = [];
    for (let d = 0; d < 7; d++) {
      let l = moment()
        .add(-6 + d, "days")
        .format("YYYYMMDD");
      if (!!logs[l] && !!logs[l]["workout"]) {
        data.push({ day: moment(l).format("DD/MM"), calories: 120 });
      } else data.push({ day: moment(l).format("DD/MM"), calories: 0 });
    }
    return (
      <View
        style={{
          flex: 1,
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Title style={{ fontSize: 22, marginTop: 15 }}>Weekly Workout</Title>
        <VictoryChart
          width={310}
          height={200}
          theme={VictoryTheme.material}
          padding={{ left: 50, right: 50, top: 10, bottom: 40 }}
        >
          <VictoryBar data={data} x="day" y="calories" />
        </VictoryChart>
      </View>
    );
  }

  function _renderInsights({ item, index }) {
    return (
      <View
        style={{
          borderRadius: 8,
          height: 230,
          width: null,
          backgroundColor: "white",
        }}
      >
        {item == "summary" && <InsightsSummary />}
        {item == "diet" && <InsightsDiet />}
        {item == "exercise" && <InsightsExercise />}
      </View>
    );
  }

  // This functions fires every time when the user clicks into home screen
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      // The screen is focused
      // Call any action
    });

    // Return the function to unsubscribe from the event so it gets removed on unmount
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    // Listen to profile update and update workout of the day.
    console.log("plan update triggered.");
    if (!!currentPlan) {
      for (var prop in currentPlan) {
        if (moment().day(prop).day() == today.day()) {
          setWorkoutOfTheDay(currentPlan[prop]);
        }
      }
    }
  }, [currentPlan]);

  // Listen to log update and update the logs for diet and exercise
  useEffect(() => {
    if (!!logs) {
      let totalAmountOfCalories = 0,
        daysLogged = 0,
        workoutsCompleted = 0;
      for (var l in logs) {
        if (
          l >= moment().add(-6, "days").format("YYYYMMDD") &&
          l <= today.format("YYYYMMDD")
        ) {
          daysLogged++;
          for (var d in logs[l].diet) {
            console.log(d, logs[l]["diet"][d]);
            let result = logs[l]["diet"][d].reduce(function (acc, obj) {
              return acc + parseInt(obj.calorieAmount);
            }, 0); // 7
            totalAmountOfCalories += result;
          }
          if (!!logs[l]["workout"]) workoutsCompleted++;
        }
      }
      setWorkoutsCompletedThisWeek(workoutsCompleted);
      if (!!totalAmountOfCalories) setCalorieIntakeThisWeek(totalAmountOfCalories / daysLogged);
      setCalorieBurntThisWeek(120 * workoutsCompleted);
    }
  }, [logs]);

  useEffect(() => {
    if (!profile && isFetched) {
      navigation.navigate("Entrance Survey");
    }
  }, [isFetched]);

  useEffect(() => {
    async function getNutritionValues() {
      if (!!profile) {
        let nv = await computeNutritionValuesAsync({ profile, logs });
        setNutritionValues(nv);
        console.log("profile adjusted from steps and workouts: ", nv);
      }
    }
    getNutritionValues();
  }, [profile]);

  useEffect(() => {
    (() => {
      setIsFetched(false);
      const userDatabaseRef = Firebase.database().ref(`/users/${user.uid}`);
      userDatabaseRef.once("value", (snapshot) => {
        let value = snapshot.val();
        if (!!value) {
          dispatch(saveProfileToReducer({ profile: value.profile }));
          setProfile(value.profile);
          dispatch(setPlan({ plan: value.exercisePlan }));
          dispatch(setLogs({ logs: value.logs }));

          plan = value.exercisePlan;
          for (var prop in plan) {
            if (moment().day(prop).day() == today.day()) {
              setWorkoutOfTheDay(plan[prop]);
            }
          }
        }
        setIsFetched(true);

        // pedometer
        let subscription = Pedometer.watchStepCount((result) => {
          console.log(result.steps);
        });

        Pedometer.isAvailableAsync().then(
          (result) => {
            console.log("pedometer enabled: ", result);
            const end = new Date();
            const start = new Date();
            if (result) {
              start.setDate(end.getDate() - 1);
              Pedometer.getStepCountAsync(start, end).then(
                (result) => {
                  console.log("past step count: ", result.steps);
                  setTodaySteps(result.steps);
                },
                (error) => {
                  console.log(error);
                }
              );
            }
          },
          (error) => {
            console.log(error);
          }
        );
      });
    })();
  }, []);

  if (!isFetched) {
    return <LoadingScreen />;
  } else {
    return (
      <SafeAreaView>
        {loading && <LoadingScreen />}
        <ScrollView contentContainerStyle={{ padding: 10 }}>
          <StatusBar barStyle="dark-content" style="auto" />
          <View style={{ flex: 1 }}>
            <Title style={{ alignSelf: "center", color: "white" }}>
              See how far you have gone!
            </Title>
            <View
              style={{
                position: "absolute",
                alignSelf: "center",
                zIndex: -99,
                top: -250,
                width: 600,
                height: 600,
                overflow: "hidden",
                borderRadius: 600 / 2,
                backgroundColor: "#1E90FF",
              }}
            ></View>

            <View
              style={{
                marginVertical: 15,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Carousel
                layout={"default"}
                layoutCardOffset={3}
                activeSlideOffset={5}
                data={["summary", "diet", "exercise"]}
                containerCustomStyle={{ overflow: "visible" }}
                sliderWidth={350}
                itemWidth={310}
                renderItem={_renderInsights}
                onSnapToItem={(index) => setInsightCarouselActiveIndex(index)}
              />
              <Pagination
                dotsLength={3}
                activeDotIndex={insightCarouselActiveIndex}
                containerStyle={{ paddingVertical: 8 }}
                dotColor={"white"}
                dotStyle={styles.paginationDot}
                inactiveDotColor={"grey"}
                inactiveDotOpacity={0.4}
                inactiveDotScale={0.6}
              />
            </View>

            <View style={{ marginVertical: 20 }}>
              <Card>
                <View style={{ flexDirection: "row", marginTop: 5 }}>
                  <View>
                    <Title style={{ marginLeft: 15 }}>Food</Title>
                  </View>
                  <View style={{ flex: 1, alignItems: "flex-end" }}>
                    <Button
                      icon="plus"
                      style={{ alignSelf: "flex-end" }}
                      onPress={() => navigation.navigate("Log Diet")}
                    >
                      Log food
                    </Button>
                  </View>
                </View>
                <Divider />
                <Card.Content style={{ marginTop: 5 }}>
                  <View
                    style={{
                      marginTop: 10,
                      borderWidth: 2,
                      padding: 10,
                      borderStyle: "dashed",
                      borderColor: "#1E90FF",
                      minHeight: 100,
                    }}
                  >
                    {!!logs[today.format("YYYYMMDD")] ? (
                      !!logs[today.format("YYYYMMDD")]["diet"] ? (
                        <View style={{ width: "100%" }}>
                          <Title>Your logged meals today: </Title>
                          {!!logs[today.format("YYYYMMDD")]["diet"][
                            "breakfast"
                          ] && (
                            <View style={{ width: "100%", marginVertical: 5 }}>
                              <Divider />
                              <Title>Breakfast</Title>
                              {logs[today.format("YYYYMMDD")]["diet"][
                                "breakfast"
                              ].map((item, index) => (
                                <View
                                  key={index}
                                  style={{
                                    width: "100%",
                                    flexDirection: "row",
                                  }}
                                >
                                  <View style={{ width: "80%" }}>
                                    <Text style={{ alignSelf: "flex-start" }}>
                                      {item.itemName}
                                    </Text>
                                  </View>
                                  <View
                                    style={{ flex: 1, alignItems: "flex-end" }}
                                  >
                                    <Text
                                      style={{ alignSelf: "flex-end" }}
                                    >{`${item.calorieAmount} kcal`}</Text>
                                  </View>
                                </View>
                              ))}
                            </View>
                          )}
                          {!!logs[today.format("YYYYMMDD")]["diet"][
                            "lunch"
                          ] && (
                            <View style={{ width: "100%", marginVertical: 5 }}>
                              <Divider />
                              <Title>Lunch</Title>
                              {logs[today.format("YYYYMMDD")]["diet"][
                                "lunch"
                              ].map((item, index) => (
                                <View
                                  key={index}
                                  style={{
                                    width: "100%",
                                    flexDirection: "row",
                                  }}
                                >
                                  <View>
                                    <Text style={{ alignSelf: "flex-start" }}>
                                      {item.itemName}
                                    </Text>
                                  </View>
                                  <View
                                    style={{ flex: 1, alignItems: "flex-end" }}
                                  >
                                    <Text
                                      style={{ alignSelf: "flex-end" }}
                                    >{`${item.calorieAmount} kcal`}</Text>
                                  </View>
                                </View>
                              ))}
                            </View>
                          )}
                          {!!logs[today.format("YYYYMMDD")]["diet"][
                            "snack"
                          ] && (
                            <View style={{ width: "100%", marginVertical: 5 }}>
                              <Divider />
                              <Title>Snack</Title>
                              {logs[today.format("YYYYMMDD")]["diet"][
                                "snack"
                              ].map((item, index) => (
                                <View
                                  key={index}
                                  style={{
                                    width: "100%",
                                    flexDirection: "row",
                                  }}
                                >
                                  <View>
                                    <Text style={{ alignSelf: "flex-start" }}>
                                      {item.itemName}
                                    </Text>
                                  </View>
                                  <View
                                    style={{ flex: 1, alignItems: "flex-end" }}
                                  >
                                    <Text
                                      style={{ alignSelf: "flex-end" }}
                                    >{`${item.calorieAmount} kcal`}</Text>
                                  </View>
                                </View>
                              ))}
                            </View>
                          )}
                          {!!logs[today.format("YYYYMMDD")]["diet"][
                            "dinner"
                          ] && (
                            <View style={{ width: "100%" }}>
                              <Divider />
                              <Title>Dinner</Title>
                              {logs[today.format("YYYYMMDD")]["diet"][
                                "dinner"
                              ].map((item, index) => (
                                <View
                                  key={index}
                                  style={{
                                    width: "100%",
                                    flexDirection: "row",
                                  }}
                                >
                                  <View>
                                    <Text style={{ alignSelf: "flex-start" }}>
                                      {item.itemName}
                                    </Text>
                                  </View>
                                  <View
                                    style={{ flex: 1, alignItems: "flex-end" }}
                                  >
                                    <Text
                                      style={{ alignSelf: "flex-end" }}
                                    >{`${item.calorieAmount} kcal`}</Text>
                                  </View>
                                </View>
                              ))}
                            </View>
                          )}
                        </View>
                      ) : (
                        <Text>
                          You have not logged your diet yet. Logged food will be
                          shown here.
                        </Text>
                      )
                    ) : (
                      <Text>
                        You have not logged your diet yet. Logged food will be
                        shown here.
                      </Text>
                    )}
                  </View>
                  <View
                    style={{
                      marginTop: 5,
                      flexDirection: "row",
                      justifyContent: "center",
                    }}
                  >
                    <Button onPress={() => navigation.navigate("Diet")}>
                      Explore Recommendations
                    </Button>
                  </View>
                </Card.Content>
              </Card>
            </View>

            <View style={{ marginBottom: 20 }}>
              <Card>
                <View style={{ flexDirection: "row", marginTop: 5 }}>
                  <View>
                    <Title style={{ marginLeft: 15 }}>Workout</Title>
                  </View>
                  <View style={{ flex: 1, alignItems: "flex-end" }}>
                    {!!logs[`${today.format("YYYYMMDD")}`] ? (
                      !!logs[`${today.format("YYYYMMDD")}`]["workout"] ? (
                        <Button icon="check" color="green">
                          COMPLETED
                        </Button>
                      ) : (
                        <Button
                          icon="plus"
                          style={{ alignSelf: "flex-end" }}
                          onPress={() => setDialogVisible(true)}
                        >
                          Log workout
                        </Button>
                      )
                    ) : (
                      <Button
                        icon="plus"
                        style={{ alignSelf: "flex-end" }}
                        onPress={() => setDialogVisible(true)}
                      >
                        Log workout
                      </Button>
                    )}
                  </View>
                </View>
                <Divider />
                {!!workoutOfTheDay && (
                  <Card.Content style={{ marginTop: 5 }}>
                    {workoutOfTheDay.type == "rest" ||
                    workoutOfTheDay.type == "recovery" ? (
                      <View
                        style={{ height: 170, width: "100%", borderRadius: 20 }}
                      >
                        <ImageBackground
                          source={REST_DAY_IMAGE}
                          style={styles.bakcgroundImage}
                        >
                          <View style={styles.textOverImageWrapper}>
                            <Title style={styles.titleOverImage}>
                              REST DAY!
                            </Title>
                            <Text style={{ fontWeight: "600", color: "white" }}>
                              Try to relax and let your body recover!
                            </Text>
                          </View>
                        </ImageBackground>
                      </View>
                    ) : (
                      <View
                        style={{ height: 170, width: "100%", borderRadius: 20 }}
                      >
                        <ImageBackground
                          source={getWorkoutImage(workoutOfTheDay)}
                          style={styles.bakcgroundImage}
                        >
                          <View style={styles.textOverImageWrapper}>
                            <Title style={styles.titleOverImage}>
                              {workoutOfTheDay.name}
                            </Title>
                            <Text style={{ fontWeight: "600", color: "white" }}>
                              {getWorkoutDescription(workoutOfTheDay)}
                            </Text>
                          </View>
                        </ImageBackground>
                      </View>
                    )}
                    {!!workoutOfTheDay && (
                      <View
                        style={{
                          marginVertical: 5,
                          flexDirection: "row",
                          justifyContent: "center",
                        }}
                      >
                        {workoutOfTheDay.type != "rest" && (
                          <Button
                            onPress={() => navigation.navigate("Exercise")}
                          >
                            Do Workout
                          </Button>
                        )}
                      </View>
                    )}
                  </Card.Content>
                )}
                {!workoutOfTheDay && (
                  <Card.Content>
                    <View
                      style={{ height: 170, width: "100%", borderRadius: 20 }}
                    >
                      <Text>
                        Complete your survey to access your workout
                        recommendations.
                      </Text>
                    </View>
                  </Card.Content>
                )}
              </Card>
            </View>

            <Button
              style={styles.btnStyle}
              mode="contained"
              onPress={() => navigation.navigate("Entrance Survey")}
            >
              Manage My Profile
            </Button>
            <Button
              style={styles.btnStyle}
              mode="contained"
              onPress={() => logout()}
            >
              Log out
            </Button>
          </View>
          <Portal>
            <Dialog
              visible={dialogVisible}
              onDismiss={() => setDialogVisible(false)}
            >
              <Dialog.Title>Mark workout as complete?</Dialog.Title>
              <Dialog.Content>
                <Paragraph>You can log this workout to the database.</Paragraph>
              </Dialog.Content>
              <Dialog.Actions>
                <Button onPress={() => onLogWorkout(workoutOfTheDay)}>
                  Save
                </Button>
                <Button
                  color={colors.disabled}
                  onPress={() => setDialogVisible(false)}
                >
                  Cancel
                </Button>
              </Dialog.Actions>
            </Dialog>
          </Portal>
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    // backgroundColor: 'white'
  },
  bakcgroundImage: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
    opacity: 0.8,
  },
  textOverImageWrapper: {
    justifyContent: "flex-end",
    position: "absolute", // child
    bottom: 0, // position where you want
    left: 0,
    marginLeft: 5,
    marginBottom: 10,
  },
  titleOverImage: {
    fontWeight: "700",
    color: "white",
    fontSize: 32,
    backgroundColor: "#1E90FF",
    justifyContent: "center",
    paddingLeft: 3,
    paddingTop: 3,
    alignSelf: "flex-start",
  },
  btnStyle: {
    margin: 10,
    alignSelf: "center",
  },
  textInputStyle: {
    margin: 10,
  },
  errorTextStyle: {
    fontSize: 20,
    alignSelf: "center",
    color: "red",
  },
});
