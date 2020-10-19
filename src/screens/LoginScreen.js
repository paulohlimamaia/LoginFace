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


//CRIANDO PROPRIEDADES
const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState({ value: '', error: '' });

  //FUNÇÃO AO CLICAR EM LOGIN
  const _onLoginPressed = () => {
    //VALIDANDO EMAIL
    const emailError = emailValidator(email.value);

    //CHECANDO VALIDAÇÃO
    if (emailError) {
      setEmail({ ...email, error: emailError });
      return;
    }

    //OBTENDO ID DO USUÁRIO A PARTIR DO EMAIL
    let userId = base64.encode(email.value);

    //INICIALIZANDO REFERÊNCIA AO FIREBASE
    var user = FireBase.database().ref('users/' + userId + '/email');
    
    //CHECANDO SE O EMAIL JÁ FOI CADASTRADO
    user.once('value', async function(data) {
      if(data.val() == null){
        setEmail({ ...email, error: 'Email inválido!' });
        return;
      }else{
        //OBTENDO FOTO JÁ CADASTRADA PARA O USUÁRIO
        var photoRef = FireBase.storage().ref().child(`photos/${userId}.jpg`);
        let faceCadastradaUrl = await photoRef.getDownloadURL()

        //SOLICITANDO PERMISSÃO DE ACESSO A CÂMERA
        ImagePicker.requestCameraPermissionsAsync().then(function(status){
          if (!status.granted) {
            alert('Precisamos de permissão para sua câmera para poder continuar!');
          }else{
            //ABRINDO CÂMERA
            ImagePicker.launchCameraAsync({
              allowsEditing: false,
              quality: 0.4
            }).then(function(data){
              if(!data.cancelled){
                //OBTENDO BLOB DA FOTO TIRADA A PARTIR DO URI
                fetch(data.uri).then(function(imageData){
                  imageData.blob().then(async function(blob){
                    //CRIANDO REFERÊNCIA TEMPORÁRIA A FOTO NO FIREBASE
                    var newPhotoRef = FireBase.storage().ref().child(`tmp/${userId}.jpg`);
                    //UPLOAD DA FOTO TEMPORÁTIA
                    let task = await newPhotoRef.put(blob, {contentType:'image/jpg'})
                    //OBTENDO URL DE DOWNLOAD DO FIREBASE
                    let faceUrl = await newPhotoRef.getDownloadURL()

                    //CONFIGURAÇÕES DE ACESSO AO AZURE
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

                    //DETECTANDO FACE 1
                    let response = await fetch(faceDetectUrl, options1)
                    let responseJson = await response.json()

                    //CONFIGURAÇÕES DA FACE 2
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

                    //DETECTANDO FACE 2
                    let newResponse = await fetch(faceDetectUrl, options2)
                    let newResponseJson = await newResponse.json()

                    //CONFIGURAÇÕES DE COMPARAÇÃO FACIAL
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

                    //COMPARANDO FACES
                    let faceResponse = await fetch(faceVerifyUrl, options3)
                    let faceJson = await faceResponse.json()

                    //CHECANDO COMPARAÇÃO
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
