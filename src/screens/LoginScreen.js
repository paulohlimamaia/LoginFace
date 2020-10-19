import React, { memo, useState } from 'react';
import { TouchableOpacity, StyleSheet, Text, View } from 'react-native';
import Background from '../components/Background';
import Logo from '../components/Logo';
import Header from '../components/Header';
import Button from '../components/Button';
import TextInput from '../components/TextInput';
import BackButton from '../components/BackButton';
import { theme } from '../core/theme';
import { emailValidator, passwordValidator } from '../core/utils';
import FireBase from '../services/firebase';
import base64 from 'react-native-base64';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';


const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState({ value: '', error: '' });

  const _onLoginPressed = () => {
    const emailError = emailValidator(email.value);

    if (emailError) {
      setEmail({ ...email, error: emailError });
      return;
    }

    let userId = base64.encode(email.value);

    var user = FireBase.database().ref('users/' + userId + '/email');
    
    user.once('value', async function(data) {
      if(data.val() == null){
        setEmail({ ...email, error: 'Email inválido!' });
        return;
      }else{
        var photoRef = FireBase.storage().ref().child(`photos/${userId}.jpg`);
        let faceCadastradaUrl = await photoRef.getDownloadURL()

        ImagePicker.requestCameraPermissionsAsync().then(function(status){
          if (!status.granted) {
            alert('Precisamos de permissão para sua câmera para poder continuar!');
          }else{
            ImagePicker.launchCameraAsync({
              allowsEditing: false,
              quality: 0.4
            }).then(function(data){
              if(!data.cancelled){
                fetch(data.uri).then(function(imageData){
                  imageData.blob().then(async function(blob){
                    var newPhotoRef = FireBase.storage().ref().child(`tmp/${userId}.jpg`);
                    let task = await newPhotoRef.put(blob, {contentType:'image/jpg'})
                    let faceUrl = await newPhotoRef.getDownloadURL()

                    let faceDetectUrl = 'https://loginface.cognitiveservices.azure.com/face/v1.0/detect'
                    let apiKey = '8c3883b9dd3347acb65c9bd138b4be34'
                    let options1 = {
                      method: "POST",
                      body: JSON.stringify({
                        "url": faceCadastradaUrl
                      }),
                      headers:{
                        "Content-Type": "application/json",
                        "Ocp-Apim-Subscription-Key": apiKey
                      }
                    }

                    let response = await fetch(faceDetectUrl, options1)
                    let responseJson = await response.json()

                    console.log(responseJson[0].faceId)
                    console.log("------------------")



                    let options2 = {
                      method: "POST",
                      body: JSON.stringify({
                        "url": faceUrl
                      }),
                      headers:{
                        "Content-Type": "application/json",
                        "Ocp-Apim-Subscription-Key": apiKey
                      }
                    }

                    let newResponse = await fetch(faceDetectUrl, options2)
                    let newResponseJson = await newResponse.json()

                    console.log(newResponseJson[0].faceId)
                    console.log("------------------")

                    let faceVerifyUrl = 'https://loginface.cognitiveservices.azure.com/face/v1.0/verify'
                    let options3 = {
                      method: "POST",
                      body: JSON.stringify({
                        "faceId1": responseJson[0].faceId,
                        "faceId2": newResponseJson[0].faceId
                      }),
                      headers:{
                        "Content-Type": "application/json",
                        "Ocp-Apim-Subscription-Key": apiKey
                      }
                    }

                    console.log(options3)

                    let faceResponse = await fetch(faceVerifyUrl, options3)
                    let faceJson = await faceResponse.json()

                    console.log(faceJson)
                    console.log("------------------")

                    if(faceJson.isIdentical){
                      navigation.navigate('Dashboard');
                    }else if(faceJson.confidence > 0.7){
                      navigation.navigate('Dashboard');
                    }else{
                      console.log("Não são a mesma pessoa!")
                    }

                  })
                })
              }
            })
          }
        })
      }
    });
  };

  return (
    <Background>
      <BackButton goBack={() => navigation.navigate('HomeScreen')} />

      <Logo />

      <Header>Bem vindo.</Header>

      <TextInput
        label="Email"
        returnKeyType="next"
        value={email.value}
        onChangeText={text => setEmail({ value: text, error: '' })}
        error={!!email.error}
        errorText={email.error}
        autoCapitalize="none"
        autoCompleteType="email"
        textContentType="emailAddress"
        keyboardType="email-address"
      />

      <Button mode="contained" onPress={_onLoginPressed}>
        Login
      </Button>

      <View style={styles.row}>
        <Text style={styles.label}>Não possui uma conta? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('RegisterScreen')}>
          <Text style={styles.link}>Cadastrar</Text>
        </TouchableOpacity>
      </View>
    </Background>
  );
};

const styles = StyleSheet.create({
  forgotPassword: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    marginTop: 4,
  },
  label: {
    color: theme.colors.secondary,
  },
  link: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
});

export default memo(LoginScreen);
