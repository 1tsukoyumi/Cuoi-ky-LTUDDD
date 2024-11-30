import React, { useState, useEffect, useRef } from 'react';
import { Image, View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { saveScore } from './firebaseConfig';
import { Audio } from 'expo-av';
import { useGameContext } from './GameContext';
import { useRoute, RouteProp } from '@react-navigation/native';
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';


export type Cell = { x: number; y: number; state: number; id: number };

type RootStackParamList = {
    GameScreen: {
        playerName: any;
        difficulty: any;
    };
};

type GameScreenRouteProp = RouteProp<RootStackParamList, 'GameScreen'>;

export default function GameScreen({ navigation }: { navigation: any }) {
    const [matrix, setMatrix] = useState<Cell[][]>([]);
    const [lastChose, setLastChose] = useState<Cell | null>(null);
    const [timeLeft, setTimeLeft] = useState(180);
    const [score, setScore] = useState(0);
    const [lenght, setLenght] = useState(4);
    const [playerName, setplayerName] = useState('');
    const [pairsFound, setPairsFound] = useState(0);
    const timerRef = useRef<number | null>(null);
    const [hintPair, setHintPair] = useState<{ cell1: Cell; cell2: Cell } | null>(null);
    const [clickSound, setClickSound] = useState<Audio.Sound | null>(null);
    const [correctSound, setCorrectSound] = useState<Audio.Sound | null>(null);
    const [wrongSound, setWrongSound] = useState<Audio.Sound | null>(null);
    const [musicSound, setMusicSound] = useState<Audio.Sound | null>(null);
    const [finalSound, setFinalSound] = useState<Audio.Sound | null>(null);
    const [loserSound, setLoserSound] = useState<Audio.Sound | null>(null);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [musicEnabled, setMusicEnabled] = useState(true);
    const { setGameState } = useGameContext();

    const route = useRoute<GameScreenRouteProp>();
    const { gameState } = useGameContext();
    var difficulty = 'easy';
    var cols = 4;
    var rows = 4;

    const getInfo = () => {
        try {
            setplayerName(route.params.playerName);
            difficulty = route.params.difficulty;
        } catch (error) {
            
        }
    }

    const saveGame = () => {
        setGameState({
            matrix,
            timeLeft,
            score,
            pairsFound,
            playerName
        });
    };

    const resetGame = () => {
        setGameState({
            matrix: null,
            timeLeft: 180,
            score: 0,
            pairsFound: 0,
            playerName: '',
        });
    };

    const getBoardSize = () => {
        if (difficulty === 'easy') {
            rows = 4;
            cols = 4;
            setLenght(8);
        } else if (difficulty === 'medium') {
            rows = 6;
            cols = 6;
            setLenght(18);
        } else if (difficulty === 'hard') {
            rows = 10;
            cols = 6;
            setLenght(30);
        }
    };

    useEffect(() => {
        if (gameState.matrix) {
            setMatrix(gameState.matrix);
            setTimeLeft(gameState.timeLeft);
            setScore(gameState.score);
            setPairsFound(gameState.pairsFound);
            setplayerName(gameState.playerName);
        } else {
            getInfo();
            getBoardSize();
            createMatrix();
        }

    }, []);

    const loadSounds = async () => {
        const { sound: click } = await Audio.Sound.createAsync(require('./sounds/click.wav'));
        const { sound: correct } = await Audio.Sound.createAsync(require('./sounds/correct.wav'));
        const { sound: wrong } = await Audio.Sound.createAsync(require('./sounds/wrong.wav'));
        const { sound: final } = await Audio.Sound.createAsync(require('./sounds/Congratulations.mp3'));
        const { sound:loser} = await Audio.Sound.createAsync(require('./sounds/Loser.mp3'));
        setClickSound(click);
        setCorrectSound(correct);
        setWrongSound(wrong);
        setFinalSound(final);
        setLoserSound(loser);
    };

    const loadBackgroundMusic = async () => {
        try {
            const { sound } = await Audio.Sound.createAsync(
                require('./sounds/background.mp3'),
                { isLooping: true }
            );
            setMusicSound(sound);
            if (musicEnabled) {
                await sound.playAsync();
            }
        } catch (error) {
            console.error('Lỗi khi tải nhạc nền:', error);
        }
    };

    const toggleSound = () => {
        setSoundEnabled((prev) => !prev);

    };
    const toggleMusic = () => {
        setMusicEnabled((prev) => !prev);
        if (musicEnabled){
            if (musicSound) {
                musicSound.stopAsync();
            }
        }else{
            if (musicSound) {
                musicSound.playAsync();
            }
        }

    };

    useEffect(() => {
        loadSounds();
        loadBackgroundMusic();

        return () => {
            clickSound?.unloadAsync();
            correctSound?.unloadAsync();
            wrongSound?.unloadAsync();
            if (musicSound) {
                musicSound.stopAsync();
                musicSound.unloadAsync();
            }
        };
    }, []);

    useEffect(() => {
        
    }, []);


    const playClickSound = async () => {
        if (soundEnabled) {
            if (clickSound) await clickSound.replayAsync();
        }
    };

    const playCorrectSound = async () => {
        if (soundEnabled) {
            if (correctSound) await correctSound.replayAsync();
        }
    };

    const playWrongSound = async () => {
        if (soundEnabled) {
            if (wrongSound) await wrongSound.replayAsync();
        }
    };
    const playFinalSound = async () => {
        if (soundEnabled) {
            if (finalSound) await finalSound.replayAsync();
        }
    };
    const playLoserSound = async () => {
        if (soundEnabled) {
            if (loserSound) await loserSound.replayAsync();
        }
    };

    const createMatrix = () => {
        const randomArray = Array.from(
            { length: (rows * cols) / 2 },
            () => Math.floor(Math.random() * 13) + 1
          );
        const doubledArray = [...randomArray, ...randomArray];
        const shuffledArray = doubledArray.sort(() => Math.random() - 0.5);

        let tempMatrix: Cell[][] = [];
        let index = 0;
        for (let i = 0; i < rows + 2; i++) {
            let row: Cell[] = [];
            for (let j = 0; j < cols + 2; j++) {
                if ((i === 0) || (i === rows + 1) || (j === 0) || (j === cols + 1)) {
                    row.push({ x: i, y: j, state: 0, id: 0 });
                }
                else {
                    row.push({ x: i, y: j, state: 1, id: shuffledArray[index++] });
                }
            }
            tempMatrix.push(row);
        }
        setMatrix(tempMatrix);
    };

    useEffect(() => {
        if (timeLeft > 0) {
            timerRef.current = window.setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
            return () => {
                if (timerRef.current !== null) {
                    clearInterval(timerRef.current);
                }
            };
        } else {
            var sc = score;
            resetGame();
            if (musicSound) {
                musicSound.stopAsync();
            }
            playLoserSound();
            Alert.alert('Hết giờ!', 'Điểm số của bạn: ' + sc, [
                { text: 'OK', onPress: () => navigation.navigate('HomeScreen') },
            ]);
            handleSaveScore();
        }
    }, [timeLeft]);


    const handleSaveScore = async () => {
        if (!score || score <= 0) return;
        try {
            await saveScore(playerName, score + timeLeft);
            console.log('Score saved successfully!');
        } catch (error) {
            console.error('Error saving score:', error);
        }
    };



    useEffect(() => {
        if (pairsFound === lenght) {
            if (timerRef.current !== null) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }

            const finalScore = score + timeLeft;
            setScore(finalScore);
            resetGame();
            if (musicSound) {
                musicSound.stopAsync();
            }
            playFinalSound ();
            Alert.alert(
                'Chúc mừng!',
                `Bạn đã hoàn thành game! Điểm số của bạn là: ${finalScore}`,
                [{ text: 'OK', onPress: () => navigation.navigate('HomeScreen') }]
            );
            handleSaveScore();
        }
    }, [pairsFound]);

    const checkLineX = (y1: number, y2: number, x: number, matrix: Cell[][]): boolean => {
        const [min, max] = [Math.min(y1, y2), Math.max(y1, y2)];
        for (let y = min + 1; y < max; y++) {
            if (matrix[x][y].state != 0) return false;
        }
        return true;
    };

    const checkLineY = (x1: number, x2: number, y: number, matrix: Cell[][]): boolean => {
        const [min, max] = [Math.min(x1, x2), Math.max(x1, x2)];
        for (let x = min + 1; x < max; x++) {
            if (matrix[x][y].state != 0) return false;
        }
        return true;
    };
    const checkRectX = (p1: Cell, p2: Cell, matrix: Cell[][]): number => {
        const [pMinY, pMaxY] = p1.y > p2.y ? [p2, p1] : [p1, p2];

        for (let y = pMinY.y; y <= pMaxY.y; y++) {
            if (y > pMinY.y && matrix[pMinY.x][y].state !== 0) {
                return -1;
            }
            if (
                (matrix[pMaxY.x][y].state === 0 || y === pMaxY.y) &&
                checkLineY(pMinY.x, pMaxY.x, y, matrix) &&
                checkLineX(y, pMaxY.y, pMaxY.x, matrix)
            ) {
                return y;
            }
        }
        return -1;
    };


    const checkRectY = (p1: Cell, p2: Cell, matrix: Cell[][]): number => {
        const [pMinX, pMaxX] = p1.x > p2.x ? [p2, p1] : [p1, p2];

        for (let x = pMinX.x; x <= pMaxX.x; x++) {
            if (x > pMinX.x && matrix[x][pMinX.y].state !== 0) {
                return -1;
            }
            if (
                (matrix[x][pMaxX.y].state === 0 || x === pMaxX.x) &&
                checkLineX(pMinX.y, pMaxX.y, x, matrix) &&
                checkLineY(x, pMaxX.x, pMaxX.y, matrix)
            ) {
                return x;
            }
        }
        return -1;
    };


    const checkMoreLineX = (p1: Cell, p2: Cell, type: number, matrix: Cell[][]): number => {
        const [pMinY, pMaxY] = p1.y > p2.y ? [p2, p1] : [p1, p2];
        let y = pMaxY.y + type;
        let row = pMinY.x;
        let colFinish = pMaxY.y;

        if (type === -1) {
            colFinish = pMinY.y;
            y = pMinY.y + type;
            row = pMaxY.x;
        }

        if (
            (matrix[row][colFinish].state === 0 || pMinY.y === pMaxY.y) &&
            checkLineX(pMinY.y, pMaxY.y, row, matrix)
        ) {
            while (
                matrix[pMinY.x][y].state === 0 &&
                matrix[pMaxY.x][y].state === 0
            ) {
                if (checkLineY(pMinY.x, pMaxY.x, y, matrix)) {
                    return y;
                }
                y += type;
            }
        }
        return -1;
    };


    const checkMoreLineY = (p1: Cell, p2: Cell, type: number, matrix: Cell[][]): number => {
        const [pMinX, pMaxX] = p1.x > p2.x ? [p2, p1] : [p1, p2];
        let x = pMaxX.x + type;
        let col = pMinX.y;
        let rowFinish = pMaxX.x;

        if (type === -1) {
            rowFinish = pMinX.x;
            x = pMinX.x + type;
            col = pMaxX.y;
        }

        if (
            (matrix[rowFinish][col].state === 0 || pMinX.x === pMaxX.x) &&
            checkLineY(pMinX.x, pMaxX.x, col, matrix)
        ) {
            while (
                matrix[x][pMinX.y].state === 0 &&
                matrix[x][pMaxX.y].state === 0
            ) {
                if (checkLineX(pMinX.y, pMaxX.y, x, matrix)) {
                    return x;
                }
                x += type;
            }
        }
        return -1;
    };


    const canConnect = (cell1: Cell, cell2: Cell, matrix: Cell[][]): boolean => {
        if (cell1.id !== cell2.id) return false;

        if (cell1.x == cell2.x)
            if (checkLineX(cell1.y, cell2.y, cell1.x, matrix))
                return true;
        if (cell1.y == cell2.y)
            if (checkLineY(cell1.x, cell2.x, cell1.y, matrix))
                return true;

        if (checkRectX(cell1, cell2, matrix) !== -1) return true;
        if (checkRectY(cell1, cell2, matrix) !== -1) return true;
        if (checkMoreLineX(cell1, cell2, 1, matrix) !== -1) return true;
        if (checkMoreLineX(cell1, cell2, -1, matrix) !== -1) return true;
        if (checkMoreLineY(cell1, cell2, 1, matrix) !== -1) return true;
        if (checkMoreLineY(cell1, cell2, -1, matrix) !== -1) return true;

        return false;
    };

    const printMatrix = () => {
        const idMatrix = matrix.map(row => row.map(cell => cell.id));
        console.table(idMatrix);
    };

    // Xử lý nhấn vào ô
    const handleCellPress = async (cell: Cell) => {
        if (cell.state === 0 || (lastChose && lastChose.x === cell.x && lastChose.y === cell.y)) return;

        if (!lastChose) {
            await playClickSound();
            setLastChose(cell);
        } else {
            if (canConnect(lastChose, cell, matrix)) {
                await playCorrectSound();
                saveGame();
                updateMatrix(cell, lastChose);
            } else {
                await playWrongSound(); 
                saveGame();
            }
            setLastChose(null);
        }

        setHintPair(null);
        printMatrix();
    };


    const shuffleMatrix = () => {
        const existingCells = matrix.flat().filter((cell) => cell.state !== 0);

        const shuffledIds = existingCells
            .map((cell) => cell.id)
            .sort(() => Math.random() - 0.5);

        let index = 0;

        const newMatrix = matrix.map((row) =>
            row.map((cell) =>
                cell.state !== 0
                    ? { ...cell, id: shuffledIds[index++] }
                    : cell
            )
        );

        setMatrix(newMatrix);
        console.log('Matrix shuffled');

        if (!hasAvailablePairs(newMatrix)) {
            console.log('No valid pairs, reshuffling...');
            shuffleMatrix();
        }
    };

    const findHint = () => {
        const existingCells = matrix.flat().filter((cell) => cell.state !== 0);

        for (let i = 0; i < existingCells.length; i++) {
            for (let j = i + 1; j < existingCells.length; j++) {
                const cell1 = existingCells[i];
                const cell2 = existingCells[j];

                if (canConnect(cell1, cell2, matrix)) {
                    setHintPair({ cell1, cell2 });
                    return;
                }
            }
        }

        Alert.alert('Không có cặp Pokémon nào có thể ăn!');
    };

    const hasAvailablePairs = (customMatrix: Cell[][] = matrix): boolean => {
        const existingCells = customMatrix.flat().filter((cell) => cell.state !== 0);

        for (let i = 0; i < existingCells.length; i++) {
            for (let j = i + 1; j < existingCells.length; j++) {
                const cell1 = existingCells[i];
                const cell2 = existingCells[j];

                if (canConnect(cell1, cell2, customMatrix)) {
                    return true;
                }
            }
        }

        return false;
    };



    const updateMatrix = (cell1: Cell, cell2: Cell) => {
        setMatrix((prevMatrix) =>
            prevMatrix.map((row) =>
                row.map((item) =>
                    (item.x === cell1.x && item.y === cell1.y) ||
                        (item.x === cell2.x && item.y === cell2.y)
                        ? { ...item, id: 0, state: 0 }
                        : item
                )
            )
        );
        setScore((prevScore) => prevScore + 10);
        setPairsFound((prevPairs) => prevPairs + 1);
    };

    const getImageForId = (id: number) => {
        switch (id) {
            case 1:
                return require('./images/pokemon (1).png');
            case 2:
                return require('./images/pokemon (2).png');
            case 3:
                return require('./images/pokemon (3).png');
            case 4:
                return require('./images/pokemon (4).png');
            case 5:
                return require('./images/pokemon (5).png');
            case 6:
                return require('./images/pokemon (6).png');
            case 7:
                return require('./images/pokemon (7).png');
            case 8:
                return require('./images/pokemon (8).png');
            case 9:
                return require('./images/pokemon (9).png');
            case 10:
                return require('./images/pokemon (10).png');
            case 11:
                return require('./images/pokemon (11).png');
            case 12:
                return require('./images/pokemon (12).png');
            case 13:
                return require('./images/pokemon (13).png');
            default:
                return null;
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerText}>Tên người chơi: {playerName}</Text>
                <Text style={styles.headerText}>Thời gian: {timeLeft}s</Text>
                <Text style={styles.headerText}>Điểm: {score}</Text>
            </View>
    
            <View style={styles.buttonsRow}>
                <TouchableOpacity
                    style={[styles.roundButton, { backgroundColor: '#007BFF' }]}
                    onPress={() => {
                        saveGame();
                        if (musicSound) {
                            musicSound.stopAsync();
                        }
                        if (timerRef.current !== null) {
                            clearInterval(timerRef.current);
                            timerRef.current = null;
                        }
                        navigation.navigate('HomeScreen');
                    }}
                >
                    <FontAwesome name="home" size={24} color="white" />
                </TouchableOpacity>
    
                <TouchableOpacity
                    style={[styles.roundButton, { backgroundColor: '#FFA500' }]}
                    onPress={findHint}
                >
                    <FontAwesome name="lightbulb-o" size={24} color="white" />
                </TouchableOpacity>
    
                <TouchableOpacity
                    style={[styles.roundButton, { backgroundColor: '#32CD32' }]}
                    onPress={shuffleMatrix}
                >
                    <MaterialCommunityIcons name="shuffle" size={24} color="white" />
                </TouchableOpacity>
    
                <TouchableOpacity
                    style={[styles.roundButton, { backgroundColor: '#FF4500' }]}
                    onPress={toggleSound}
                >
                    <FontAwesome
                        name={soundEnabled ? 'volume-up' : 'volume-off'}
                        size={24}
                        color="white"
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.roundButton, { backgroundColor: '#AA4500' }]}
                    onPress={toggleMusic}
                >
                    <MaterialCommunityIcons 
                        name={musicEnabled ? 'music' : 'music-off'}
                        size={24}
                        color="white"
                    />
                </TouchableOpacity>
            </View>
    
            <View style={styles.board}>
                {matrix.map((row, rowIndex) => (
                    <View key={rowIndex} style={styles.row}>
                        {row.map((cell: Cell, colIndex: number) => (
                            <TouchableOpacity
                                key={colIndex}
                                style={[
                                    styles.cell,
                                    cell.state === 0 && styles.hiddenCell,
                                    lastChose &&
                                    lastChose.x === cell.x &&
                                    lastChose.y === cell.y &&
                                    styles.selectedCell,
                                    hintPair &&
                                    ((hintPair.cell1.x === cell.x &&
                                        hintPair.cell1.y === cell.y) ||
                                        (hintPair.cell2.x === cell.x &&
                                            hintPair.cell2.y === cell.y)) &&
                                    styles.hintCell, // Làm nổi bật ô gợi ý
                                ]}
                                onPress={() => handleCellPress(cell)}
                            >
                                {cell.state !== 0 && (
                                    <Image
                                        source={getImageForId(cell.id)}
                                        style={styles.cellImage}
                                    />
                                )}
                            </TouchableOpacity>
                        ))} 
                    </View>
                ))}
            </View>
        </View>
    );    
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f8ff',
        alignItems: 'center',
    },
    header: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
        backgroundColor: '#4682b4',
    },
    headerText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    buttonsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginTop: 10,
        marginBottom: 10,
    },
    roundButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    board: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    row: {
        flexDirection: 'row',
    },
    cell: {
        width: 60,
        height: 60,
        backgroundColor: '#00FFFF',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5,
        borderWidth: 2,
        borderColor: '#fff',
    },
    hiddenCell: {
        backgroundColor: 'transparent',
        borderWidth: 0,
    },
    selectedCell: {
        borderColor: 'red',
    },
    cellText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    hintCell: {
        borderColor: 'blue',
        borderWidth: 3,
    },
    cellImage: {
        width: '80%',
        height: '80%',
        resizeMode: 'contain',
    },
});