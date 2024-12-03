import React, { useEffect } from "react";
import { View, SafeAreaView } from "react-native";
import { Text, Searchbar, Button, Divider } from "react-native-paper";
import Ionicons from "react-native-vector-icons/Ionicons";

// edit
import searchRecipe from "~/src/hooks/diet/searchRecipe";
import VerticalList from "~/src/components/VerticalList";

// Overriding the header
DetailsScreen["navigationOptions"] = (screenProps) => ({
  title: "",
  headerLeft: () => (
    <Ionicons
      name={"ios-arrow-back"}
      size={30}
      color={"dodgerblue"}
      style={{ paddingLeft: 10 }}
      onPress={() => screenProps.navigation.goBack()}
    />
  ),
});

// screen for demo purpose
export default function DetailsScreen({ navigation, route }) {
  const { recipeName } = route.params || '';
  const { recipeResults, searchByName, isFetched } = searchRecipe();
  const [query, setQuery] = React.useState(recipeName);
  const [iconPressed, setIconPressed] = React.useState(false);

  const onChangeSearch = (query) => setQuery(query);

  useEffect(() => {
    setIconPressed(false);
  }, [recipeResults])

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ padding: 20 }}>
        <Searchbar
          style={{ marginBottom: 15 }}
          placeholder="Search for a food item"
          onChangeText={onChangeSearch}
          value={query}
          onIconPress={() => {
            setIconPressed(true); 
            searchByName({ query }); 
          }}
        />
        <Divider />
        <Text style={{ fontSize: 16, alignSelf: "center", marginVertical: 5 }}>
          Can't find your diet?
        </Text>
        <Button
          icon="pencil"
          mode="contained"
          style={{ width: 200, alignSelf: "center", marginTop: 10 }}
          onPress={() => navigation.navigate("Log Diet Details")}
        >
          Log Manually
        </Button>
      </View>
      <SafeAreaView style={{ flex: 1, paddingHorizontal: 20 }}>
        {isFetched && recipeResults.length == 0 && <View style={{ alignItems: 'center' }}><Text>Sorry, we cannot find the dish from the database.</Text></View>}
        {!isFetched && !!iconPressed && <View style={{ alignItems: 'center' }}><Text>Searching.....</Text></View>}
        <VerticalList data={recipeResults} screenName="Log Diet Details" />
      </SafeAreaView>

    </SafeAreaView>
  );
}
