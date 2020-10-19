import React, { memo, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import base64 from 'react-native-base64';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import Background from '../components/Background';
import Logo from '../components/Logo';
import Header from '../components/Header';
import Button from '../components/Button';
import TextInput from '../components/TextInput';
import BackButton from '../components/BackButton';
import { theme } from '../core/theme';
import {
  emailValidator,
  sexValidator,
  nameValidator,
} from '../core/utils';
import FireBase from '../services/firebase'

const RegisterScreen = ({ navigation }) => {
  //PROPRIEDADES DO FORM
  const [name, setName] = useState({ value: '', error: '' });
  const [email, setEmail] = useState({ value: '', error: '' });
  const [sex, setSex] = useState({ value: '', error: '' });

  //FUNÇÃO AO GRAVAR FORM
  const _onSignUpPressed = () => {

    //APLICANDO VALIDADORES
    const nameError = nameValidator(name.value);
    const emailError = emailValidator(email.value);
    const sexError = sexValidator(sex.value);

    //VERIFICANDO VALIDAÇÃO
    if (emailError || sexError || nameError) {
      setName({ ...name, error: nameError });
      setEmail({ ...email, error: emailError });
      setSex({ ...sex, error: sexError });
      return;
    }

    //CRIANDO ID DO USUÁRIO COM BASE NO EMAIL
    let userId = base64.encode(email.value);

    //CHECANDO EXISTÊNCIA DO USUÁRIO
    var user = FireBase.database().ref('users/' + userId + '/email');
    user.once('value', function(data) {
      if(data.val() != null){
        setEmail({ ...email, error: 'Email já cadastrado!' });
        return;
      }else{

        //CHECANDO PLATAFORMA
        if (Platform.OS !== 'web') {
          //REQUISITANDO ACESSO A CÂMERA
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
                  //CAPTURANDO BLOB DA IMAGEM A PARTIR DO URI
                  fetch(data.uri).then(function(imageData){
                    imageData.blob().then(function(blob){
                      //CRIANDO REFERÊNCIA NO FIREBASE
                      var photoRef = FireBase.storage().ref().child(`photos/${userId}.jpg`);

                      //UPLOAD DA FOTO DE CADASTRO
                      photoRef.put(blob, {contentType:'image/jpg'}).then(function() {
                        console.log('Photo uploaded!')

                        //SALANDO DADOS NO FIREBASE
                        FireBase.database().ref('users/' + userId).set({
                          name: name.value,
                          email: email.value,
                          sex : sex.value,
                        });
                
                        //EMPURRANDO USUÁRIO A DASHBOARD
                        navigation.navigate('Dashboard');

                      });
                    });
                  });
                }
              }).catch(function(error){
                console.log(error)
              })
            }
          }).catch(function(error){
            console.log(error)
          });
          
        }
      }
    });
  };

  return (
    <Background>
      <BackButton goBack={() => navigation.navigate('HomeScreen')} />

      <Logo />

      <Header>Crie sua conta</Header>

      <TextInput
        label="Nome"
        returnKeyType="next"
        value={name.value}
        onChangeText={text => setName({ value: text, error: '' })}
        error={!!name.error}
        errorText={name.error}
      />

      <TextInput
        label="Sexo"
        returnKeyType="next"
        value={sex.value}
        onChangeText={text => setSex({ value: text, error: '' })}
        error={!!sex.error}
        errorText={sex.error}
      />

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

      <Button mode="contained" onPress={_onSignUpPressed} style={styles.button}>
        Cadastrar
      </Button>

      <Button mode="outlined" onPress={() => navigation.navigate('HomeScreen')}>
        Cancelar
      </Button>

      <View style={styles.row}>
        <Text style={styles.label}>Já possui uma conta? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('LoginScreen')}>
          <Text style={styles.link}>Login</Text>
        </TouchableOpacity>
      </View>
    </Background>
  );
};

const styles = StyleSheet.create({
  label: {
    color: theme.colors.secondary,
  },
  button: {
    marginTop: 24,
  },
  row: {
    flexDirection: 'row',
    marginTop: 4,
  },
  link: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
});

export default memo(RegisterScreen);
