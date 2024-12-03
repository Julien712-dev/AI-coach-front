import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

/*const fetchProfile = createAsyncThunk("users/fetchProfile", async () => {
  let data
  console.log('accessing');
  await firebase.database().ref('/users/123/profile')
    .once("value", (snapshot) => {
      data = snapshot.val()
    });
  return data;
});*/

const nullProfile = {
  firstName: null,
  lastName: null,
  height: null,
  heightUnit: 'cm',
  weight: null,
  weightUnit: 'kg',
  sex: 'M',
  age: null,
  bodyGoal: null,
  exerciseHabit: '',
  dietHabit: [], // balanced diet, lose weight, build muscles
  dietRestrictions: [],
  foodAllergies: [],
  favList: []
}

const profileSlice = createSlice({
  name: 'profile',
  initialState: nullProfile,
  reducers: {
    updateTempStorage: (state, action) => {
      return {...state, ...action.payload}
    },

    saveProfileToFirebase: (state, action) => {
      const userRef = action.payload;
      userRef.set({...state});
      // reset state values
      return {...state}
    },
    
    clearTempStorage: (state, action) => {
      return nullProfile
    }
  }
});


const { reducer, actions } = profileSlice;
export const { updateTempStorage, saveProfileToFirebase, clearTempStorage } = actions;
export default reducer;