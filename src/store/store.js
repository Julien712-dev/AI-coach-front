import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import { persistStore, persistReducer } from 'redux-persist';

// stores for data
import AsyncStorage from '@react-native-community/async-storage';
import authReducer from './authSlice';
import profileReducer from './profileSlice';
import exerciseReducer from './exerciseSlice';

const mainPersistConfig = {
  key: 'main',
  storage: AsyncStorage,
  // Whitelist (Save Specific Reducers)
  whitelist: ["auth", "profile"],
  // Blacklist (Don"t Save Specific Reducers)
  blacklist: []
}

// const securePersistConfig = {
//   key: 'secure',
//   storage: createSecureStore(),
//   whitelist: ['authReducer']
// };

const mainReducer = combineReducers({
  auth: authReducer,
  profile: profileReducer,
  exercise: exerciseReducer
});

const rootReducer = combineReducers({
	main: persistReducer(mainPersistConfig, mainReducer)
	// secure: persistReducer(securePersistConfig, secureReducer)
});

// Redux: Store
const store = createStore(rootReducer, applyMiddleware(thunk));

// Middleware: Redux Persist Persister
const persistor = persistStore(store);
// persistor.purge();

export { store, persistor };