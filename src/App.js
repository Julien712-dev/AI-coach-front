import { registerRootComponent } from 'expo';
import React, { useState } from 'react';
import Firebase from 'firebase';
import { Image } from 'react-native';
import AppLoading from 'expo-app-loading';
import { Asset } from 'expo-asset';
import { Provider as PaperProvider, DefaultTheme as PaperDefaultTheme } from 'react-native-paper';
import { DefaultTheme as NavigationDefaultTheme } from '@react-navigation/native';
import { DraxProvider } from 'react-native-drax';
import merge from 'deepmerge';
import 'react-native-console-time-polyfill';

// State saving
import { PersistGate } from 'redux-persist/integration/react';
import { Provider as ReduxProvider } from 'react-redux';
import { store, persistor } from './store/store';

// Router
import Router from './router';

// API Keys
import apiKeys from './apikeys'

// Initialize Firebase
const firebaseConfig = {
	apiKey: apiKeys.firebaseApiKey,
	authDomain: 'coach-ai.firebaseapp.com',
	databaseURL: 'https://coach-ai.firebaseio.com',
	projectId: 'coach-ai',
	storageBucket: 'coach-ai.appspot.com',
};

// Prevent duplicate app
if (!Firebase.apps.length) {
	Firebase.initializeApp(firebaseConfig);
}
let DefaultTheme = merge(PaperDefaultTheme, NavigationDefaultTheme);

const theme = {
	...DefaultTheme,
	colors: {
		...DefaultTheme.colors,
		primary: 'dodgerblue',
	},
}

function cacheImages(images) {
	return images.map(image => {
	  if (typeof image === 'string') {
		return Image.prefetch(image);
	  } else {
		return Asset.fromModule(image).downloadAsync();
	  }
	});
}

  
function App() {

	const [isReady, setIsReady] = useState(false);
	async function loadResourcesAsync () {
		const imageAssets = cacheImages([
			require('../assets/image/male-athlete.jpg'),
			require('../assets/image/female-athlete.jpg'),
			require('../assets/image/arm-workout.jpg'),
			require('../assets/image/exercise-survey-bg.jpg'),
			require('../assets/image/rest-day.jpg'),
			require('../assets/image/survey-background.jpg')
		]);
	  
		//   const fontAssets = cacheFonts([FontAwesome.font]);
	  
		await Promise.all([...imageAssets]);
	}

	if (!isReady) return (
		<AppLoading
		startAsync={loadResourcesAsync}
		onFinish={() => setIsReady(true)}
		onError={console.warn}
	  />
	);

	return (
		<PaperProvider theme={theme}>
			<DraxProvider>
				<ReduxProvider store={store}>
					<PersistGate loading={null} persistor={persistor}>
						<Router theme={theme}/>
					</PersistGate>
				</ReduxProvider>
			</DraxProvider>
		</PaperProvider>
	);
}

export default registerRootComponent(App);