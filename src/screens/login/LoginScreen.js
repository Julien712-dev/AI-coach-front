import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import firebase from 'firebase';
import { View, StyleSheet, Keyboard, TouchableWithoutFeedback, ImageBackground } from 'react-native';
import { Card, TextInput, Button, Snackbar, Text, Title } from 'react-native-paper';
import { login } from '~/src/store/authSlice';
import LoadingScreen from '../LoadingScreen';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [visible, setVisible] = useState(false)
  const [alert, setAlert] = useState('')
  const [loading, setLoading] = useState(false)

  const dispatch = useDispatch();

  const registerButtonPress = () => {
    navigation.navigate('Sign Up');
  }

  const loginButtonPress = () => {
    setLoading(true)
    firebase.auth().signInWithEmailAndPassword(email, password)
      .then(() => {
        dispatch(login());
      })
      .catch(() => {
        setLoading(false);
        setAlert('Login Failed')
        setVisible(true)
      })
  }

  const loginAsTrialUser = () => {
    setLoading(true)
    firebase.auth().signInWithEmailAndPassword(`trial@gmail.com`, `123456`)
      .then(() => {
        dispatch(login());
      })
      .catch(() => {
        setLoading(false)
        setAlert('Login Failed')
        setVisible(true)
      })
  }

  const onDismissSnackBar = () => setVisible(false)

  
  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
    <View style={styles.container}>
      <View style={styles.backgroundContainer}>
            <ImageBackground 
              source={require('~/assets/image/male-athlete.jpg')} 
              style={styles.bakcgroundImage}
              blurRadius={20}
            >
            </ImageBackground>
      </View>

      <View style={{ marginTop: 200 }}>
        <Card style={{ marginHorizontal: 10, width: 350, backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
          <View style={{ marginLeft: 15, marginTop: 10, alignSelf: "flex-start"  }}>
              <Title style={{ fontSize: 28 }}>Welcome, Athlete!</Title>
              <Text>Sign in to use Coach.ai.</Text>
          </View>
          <Card.Content>
          <TextInput
            style={styles.textInputStyle}
            label="Email"
            autoCapitalize='none'
            autoCorrect={false}
            autoCompleteType='email'
            keyboardType='email-address'
            value={email}
            // theme={{ colors: { 
            //   text: 'white',
            //   placeholder: 'white',
            //   primary: 'white',
            //   underlineColor: 'white'
            // } }}
            onChangeText={email => setEmail(email)}
          />

          <TextInput
            style={styles.textInputStyle}
            label="Password"
            autoCapitalize='none'
            autoCorrect={false}
            autoCompleteType='password'
            secureTextEntry={true}
            value={password}
            onChangeText={password => setPassword(password)}
            // theme={{ colors: {
            //   text: 'white',
            //   placeholder: 'white',
            //   primary: 'white',
            //   underlineColor: 'white'
            // } }}
          />

          <View style={{ flexDirection: 'row', marginBottom: 5 }}>
            <Button style={styles.btnStyle} mode="contained" onPress={() => loginButtonPress()}>
            Log In
            </Button>
          </View>

          <View style={{ flexDirection: 'row' }}>
            <Button style={styles.btnStyle} mode="text" onPress={() => registerButtonPress()}>
              Not a user? Register now!
            </Button>
          </View>
          </Card.Content>
        </Card>

        {/* {loading ? <ActivityIndicator animating={true} /> : <ActivityIndicator animating={false} /> } */}

        <View style={{flexDirection: 'row', alignItems: 'stretch'}}>
            <Button 
              style={styles.btnStyle} 
              mode="text"
              color="white"
              onPress={() => loginAsTrialUser()}>
              Log in as Trial User
            </Button>
        </View>
      </View>

      <Snackbar visible={visible} onDismiss={onDismissSnackBar} duration={3000}>{alert}</Snackbar>
      {loading && <LoadingScreen text={'Logging you in'} />}
    </View>
    </TouchableWithoutFeedback>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundContainer: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  bakcgroundImage: {
    flex: 1, 
    width: null, 
    height: null,
    opacity: 0.5
  },
  btnStyle:{
    marginHorizontal: 10,
    borderRadius: 20,
    flex: 1
  },
  textInputStyle:{
    margin: 10,
    height: 50,
    fontWeight: '700',
    backgroundColor: "transparent",
  },
  errorTextStyle:{
    fontSize: 20,
    alignSelf: 'center',
    color:'red'
  }
})

export default LoginScreen;