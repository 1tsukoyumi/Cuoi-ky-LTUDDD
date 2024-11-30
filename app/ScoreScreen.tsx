import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { fetchTopScoresRealtime, resetScores } from './firebaseConfig';

const ScoreScreen = ({ navigation }: { navigation: any }) => {
    const [scores, setScores] = useState([]);

    useEffect(() => {
        const unsubscribe = fetchTopScoresRealtime((fetchedScores: any) => {
            setScores(fetchedScores);
        });

        return () => unsubscribe();
    }, []);
    
    const renderItem = ({ item, index }: { item: any, index: any }) => (
        <View style={styles.scoreRow}>
            <Text style={styles.rank}>{index + 1}</Text>
            <Text style={styles.username}>{item.username}</Text>
            <Text style={styles.score}>{item.score}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Bảng điểm</Text>
            <FlatList
                data={scores}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
            />
            <TouchableOpacity
                style={styles.button}
                onPress={() => { navigation.navigate('HomeScreen'); }}
            >
                <Text style={styles.buttonText}>Trang chủ</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    button: {
        backgroundColor: '#4682b4',
        width: 170,
        padding: 15,
        marginTop: 10,
        marginBottom: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    scoreRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    rank: {
        fontSize: 18,
        fontWeight: 'bold',
        width: '10%',
        textAlign: 'center',
    },
    username: {
        fontSize: 18,
        width: '60%',
        textAlign: 'left',
    },
    score: {
        fontSize: 18,
        width: '30%',
        textAlign: 'right',
    },
});

export default ScoreScreen;