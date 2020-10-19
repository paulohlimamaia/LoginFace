import React, { memo } from 'react';
import Background from '../components/Background';
import Logo from '../components/Logo';
import Header from '../components/Header';
import Paragraph from '../components/Paragraph';
import Button from '../components/Button';

const Dashboard = ({ navigation }) => (
  <Background>
    <Logo />
    <Header>Vamos lá!</Header>
    <Button mode="outlined" onPress={() => navigation.navigate('HomeScreen')}>
      Logout
    </Button>
  </Background>
);

export default memo(Dashboard);
