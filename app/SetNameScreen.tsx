import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';

const SetNameScreen = ({ navigation }: { navigation: any }) => {
  const [playerName, setPlayerName] = useState('');
  const [difficulty, setDifficulty] = useState<string | null>(null);

  const handleStartGame = () => {
    if (!playerName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên của bạn!');
      return;
    }
    if (!difficulty) {
      Alert.alert('Lỗi', 'Vui lòng chọn độ khó!');
      return;
    }
    navigation.navigate('GameScreen', { playerName, difficulty });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nhập tên của bạn</Text>
      <TextInput
        style={styles.input}
        placeholder="Tên của bạn"
        value={playerName}
        onChangeText={setPlayerName}
      />

      <Text style={styles.subtitle}>Chọn độ khó</Text>
      <View style={styles.difficultyContainer}>
        <TouchableOpacity
          style={[
            styles.difficultyButton,
            difficulty === 'easy' && styles.selectedDifficulty,
          ]}
          onPress={() => setDifficulty('easy')}
        >
          <Text style={styles.difficultyText}>Dễ</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.difficultyButton,
            difficulty === 'medium' && styles.selectedDifficulty,
          ]}
          onPress={() => setDifficulty('medium')}
        >
          <Text style={styles.difficultyText}>Trung bình</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.difficultyButton,
            difficulty === 'hard' && styles.selectedDifficulty,
          ]}
          onPress={() => setDifficulty('hard')}
        >
          <Text style={styles.difficultyText}>Khó</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleStartGame}>
        <Text style={styles.buttonText}>Bắt đầu chơi</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 18,
  },
  difficultyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  difficultyButton: {
    backgroundColor: '#E0E0E0',
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  selectedDifficulty: {
    backgroundColor: '#007BFF',
  },
  difficultyText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SetNameScreen;