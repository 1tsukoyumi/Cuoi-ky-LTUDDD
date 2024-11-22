import React, { useEffect } from 'react';
import { AppState } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './HomeScreen';
import GameScreen from './GameScreen';
import ScoreScreen from './ScoreScreen';
import SetNameScreen from './SetNameScreen';
import { GameProvider } from './GameContext';
import { useGameContext } from './GameContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Stack = createStackNavigator();

const App = () => {
  const { gameState } = useGameContext();

    useEffect(() => {
        const handleAppStateChange = (nextAppState: string) => {
            if (nextAppState === 'background') {
                AsyncStorage.setItem('gameState', JSON.stringify(gameState));
            }
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);
        return () => subscription.remove();
    }, [gameState]);

  return (
    <GameProvider>
      <Stack.Navigator initialRouteName="HomeScreen" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
        <Stack.Screen name="GameScreen" component={GameScreen} />
        <Stack.Screen name="ScoreScreen" component={ScoreScreen} />
        <Stack.Screen name="SetNameScreen" component={SetNameScreen} />
      </Stack.Navigator>
    </GameProvider>
  );
};

export default App;