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
  const [name, setName] = useState({ value: '', error: '' });
  const [email, setEmail] = useState({ value: '', error: '' });
  const [sex, setSex] = useState({ value: '', error: '' });

  const _onSignUpPressed = () => {

    const nameError = nameValidator(name.value);
    const emailError = emailValidator(email.value);
    const sexError = sexValidator(sex.value);

    if (emailError || sexError || nameError) {
      setName({ ...name, error: nameError });
      setEmail({ ...email, error: emailError });
      setSex({ ...sex, error: sexError });
      return;
    }

    let userId = base64.encode(email.value);

    var user = FireBase.database().ref('users/' + userId + '/email');
    user.once('value', function(data) {
      if(data.val() != null){
        setEmail({ ...email, error: 'Email já cadastrado!' });
        return;
      }else{
        console.log(name.value)
        console.log(sex.value)
        console.log(email.value)
        console.log(userId)

        if (Platform.OS !== 'web') {
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
                    imageData.blob().then(function(blob){

                      var photoRef = FireBase.storage().ref().child(`photos/${userId}.jpg`);

                      photoRef.put(blob, {contentType:'image/jpg'}).then(function() {
                        console.log('Photo uploaded!')

                        FireBase.database().ref('users/' + userId).set({
                          name: name.value,
                          email: email.value,
                          sex : sex.value,
                        });
                
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
