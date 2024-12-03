import React, {useState, useEffect} from 'react';
import { View, ScrollView } from 'react-native';
import { Text,Title,Searchbar } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import useProfileFirebase from "../../hooks/useProfileFirebase";
import LoadingScreen from "../LoadingScreen";

// Overriding the header
DetailsScreen['navigationOptions'] = screenProps => ({
	title: "",
	headerLeft: () => <Ionicons name={'ios-arrow-back'} size={30} color={'dodgerblue'} style={{ paddingLeft: 10 }} onPress={() => screenProps.navigation.goBack()} />
})

const defaultCuisineList = {
    American: 10,
    French: 10,
    Chinese: 10,
    Japanese: 10,
    Korean: 10,
    Thai: 10,
    Italian: 10,
};

// screen for demo purpose
export default function DetailsScreen({ navigation }) {

	const [isLoading, setIsLoading] = useState(false);
	const [results, setResults] = useState([]);
	const [searchQuery, setSearchQuery] = React.useState('');
	const [cuisineList, setCuisineList] = useState(null);

	const onChangeSearch = query => setSearchQuery(query);
	const { fetchCuisineListAsync } = useProfileFirebase();

	useEffect(() => {
		setIsLoading(true);
		async function getCuisineList(){
			const list = await fetchCuisineListAsync();
			console.log(list);
			setCuisineList(list);
			setIsLoading(false);
		}
		getCuisineList();
	}, [])

	return (
		<View style={{flex:1}}>
			{isLoading && <LoadingScreen />}
			{!isLoading &&
			<ScrollView contentContainerStyle={{padding: 20}}>
				{JSON.stringify(cuisineList) == JSON.stringify(defaultCuisineList) && 
				<View>
					<Title>Default Cuisine Recommendation!</Title>
					<Text>Try to like the recipes of certain cuisine types to get personalized recommendations!</Text>
				</View>}
				{JSON.stringify(cuisineList) != JSON.stringify(defaultCuisineList) && 
				<View>
					<Title>Customized Recommendation!</Title>
					<Text>We are predicting what you like from pevious logs!</Text>
					{!!cuisineList && Object.keys(cuisineList).map((c, i) => {if (cuisineList[c] > 10) return <Text key={i}>{c}</Text>})}
			</View>}
			</ScrollView>}
		</View>
	);
}