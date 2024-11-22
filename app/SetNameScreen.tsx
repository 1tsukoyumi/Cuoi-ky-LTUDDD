import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';

const SetNameScreen = ({ navigation } : {navigation : any}) => {
  const [playerName, setPlayerName] = useState('');

  const handleStartGame = () => {
    if (!playerName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên của bạn!');
      return;
    }
    // Chuyển sang GameScreen và truyền tên người chơi
    navigation.navigate('GameScreen', { playerName });
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
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 18,
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