import React, { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Alert,
  BackHandler,
  View,
  Text,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useGameContext } from './GameContext';


const HomeScreen = ({ navigation }: { navigation: any }) => {
  const { gameState, setGameState } = useGameContext();

  const handleNewGame = () => {
    // Xóa trạng thái game hiện tại
    setGameState({
      matrix: null,
      timeLeft: 60,
      score: 0,
      pairsFound: 0,
    });
    navigation.navigate('SetNameScreen'); // Điều hướng đến màn chơi mới
  };

  const handleScore = () => {
    navigation.navigate('ScoreScreen');// điều hướng đến bảng điểm
  };

  useEffect(() => {
    const loadGameState = async () => {
      const savedState = await AsyncStorage.getItem('gameState');
      if (savedState) {
        setGameState(JSON.parse(savedState));
      }
    };
    loadGameState();
  }, []);

  const handleExit = () => {
    Alert.alert(
      'Xác nhận thoát',
      'Bạn có chắc chắn muốn thoát ứng dụng?',
      [
        {
          text: 'Hủy',
          onPress: () => console.log('Hủy thoát'),
          style: 'cancel',
        },
        {
          text: 'Thoát',
          onPress: () => BackHandler.exitApp(),
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <ImageBackground source={require('./Background.webp')} style={styles.background}>
      <View style={styles.container}>
        {gameState.matrix && (
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('GameScreen')}
          >
            <Text style={styles.buttonText}>Tiếp tục</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.button}
          onPress={handleNewGame}
        >
          <Text style={styles.buttonText}>Chơi mới</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={handleScore}
        >
          <Text style={styles.buttonText}>Bảng điểm</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleExit}>
          <Text style={styles.buttonText}>Thoát</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 40,
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
  button: {
    backgroundColor: '#00A8E8',
    width: 150,
    padding: 15,
    margin: 10,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5, // Hiệu ứng đổ bóng
  },
  buttonText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
