import React, { useState, useEffect, useRef } from 'react';
import { Image, View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { saveScore } from './firebaseConfig';
import { Audio } from 'expo-av';
import { useGameContext } from './GameContext';
import { useRoute, RouteProp } from '@react-navigation/native';

export type Cell = { x: number; y: number; state: number; id: number };

type RootStackParamList = {
    GameScreen: {
      playerName: any;
    };
  };
  
  type GameScreenRouteProp = RouteProp<RootStackParamList, 'GameScreen'>;

export default function GameScreen({ navigation }: { navigation: any }) {
    const [matrix, setMatrix] = useState<Cell[][]>([]);
    const [lastChose, setLastChose] = useState<Cell | null>(null);
    const [timeLeft, setTimeLeft] = useState(60); // Bộ đếm ngược
    const [score, setScore] = useState(0); // Bộ đếm điểm số
    const [pairsFound, setPairsFound] = useState(0); // Số cặp đã ăn
    const timerRef = useRef<number | null>(null); // Tham chiếu đến bộ đếm thời gian
    const [hintPair, setHintPair] = useState<{ cell1: Cell; cell2: Cell } | null>(null);
    const [clickSound, setClickSound] = useState<Audio.Sound | null>(null);
    const [correctSound, setCorrectSound] = useState<Audio.Sound | null>(null);
    const [wrongSound, setWrongSound] = useState<Audio.Sound | null>(null);
    const route = useRoute<GameScreenRouteProp>();

    const { setGameState } = useGameContext();
    const { gameState } = useGameContext();
    const { playerName } = route.params.playerName;

    const saveGame = () => {
        setGameState({
            matrix,
            timeLeft,
            score,
            pairsFound,
        });
    };

    const resetGame = () => {
        setGameState({
            matrix: null,
            timeLeft: 60,
            score: 0,
            pairsFound: 0,
        });
    };

    useEffect(() => {
        if (gameState.matrix) {
            setMatrix(gameState.matrix);
            setTimeLeft(gameState.timeLeft);
            setScore(gameState.score);
            setPairsFound(gameState.pairsFound);
        } else {
            createMatrix();
        }
    }, []);

    // Tải âm thanh
    const loadSounds = async () => {
        const { sound: click } = await Audio.Sound.createAsync(require('./sounds/click.wav'));
        const { sound: correct } = await Audio.Sound.createAsync(require('./sounds/correct.wav'));
        const { sound: wrong } = await Audio.Sound.createAsync(require('./sounds/wrong.wav'));

        setClickSound(click);
        setCorrectSound(correct);
        setWrongSound(wrong);
    };

    // Gỡ âm thanh khi không dùng
    useEffect(() => {
        loadSounds();

        return () => {
            clickSound?.unloadAsync();
            correctSound?.unloadAsync();
            wrongSound?.unloadAsync();
        };
    }, []);

    // Hàm phát âm thanh
    const playClickSound = async () => {
        if (clickSound) await clickSound.replayAsync();
    };

    const playCorrectSound = async () => {
        if (correctSound) await correctSound.replayAsync();
    };

    const playWrongSound = async () => {
        if (wrongSound) await wrongSound.replayAsync();
    };

    const createMatrix = () => {
        const rows = 6;
        const cols = 5;
        const randomArray = Array.from({ length: 15 }, () => Math.floor(Math.random() * 13) + 1);
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
            Alert.alert('Hết giờ!', 'Điểm số của bạn: ' + sc, [
                { text: 'OK', onPress: () => navigation.navigate('HomeScreen') },
            ]);
            handleSaveScore();
        }
    }, [timeLeft]);


    const handleSaveScore = async () => {
        if (!score || score <= 0) return; // Không lưu nếu điểm <= 0
        try {
            await saveScore(playerName, score + timeLeft);
            console.log('Score saved successfully!');
        } catch (error) {
            console.error('Error saving score:', error);
        }
    };



    useEffect(() => {
        if (pairsFound === 15) {
            if (timerRef.current !== null) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }

            const finalScore = score + timeLeft; // Cộng thêm thời gian còn lại vào điểm số
            setScore(finalScore);
            resetGame();

            Alert.alert(
                'Chúc mừng!',
                `Bạn đã hoàn thành game! Điểm số của bạn là: ${finalScore}`,
                [{ text: 'OK', onPress: () => navigation.navigate('HomeScreen') }]
            );
            handleSaveScore();
        }
    }, [pairsFound]);

    // Thuật toán kiểm tra kết nối
    const checkLineX = (y1: number, y2: number, x: number, matrix: Cell[][]): boolean => {
        const [min, max] = [Math.min(y1, y2), Math.max(y1, y2)];
        for (let y = min + 1; y < max; y++) {
            if (matrix[x][y].state != 0) return false; // Nếu bị chắn, trả về false
        }
        return true; // Không bị chắn
    };

    const checkLineY = (x1: number, x2: number, y: number, matrix: Cell[][]): boolean => {
        const [min, max] = [Math.min(x1, x2), Math.max(x1, x2)];
        for (let x = min + 1; x < max; x++) {
            if (matrix[x][y].state != 0) return false; // Nếu bị chắn, trả về false
        }
        return true; // Không bị chắn
    };
    const checkRectX = (p1: Cell, p2: Cell, matrix: Cell[][]): number => {
        // Xác định điểm có tọa độ Y nhỏ hơn
        const [pMinY, pMaxY] = p1.y > p2.y ? [p2, p1] : [p1, p2];

        for (let y = pMinY.y; y <= pMaxY.y; y++) {
            // Nếu gặp vật cản giữa hai điểm
            if (y > pMinY.y && matrix[pMinY.x][y].state !== 0) {
                return -1;
            }
            // Kiểm tra các đường kết nối
            if (
                (matrix[pMaxY.x][y].state === 0 || y === pMaxY.y) &&
                checkLineY(pMinY.x, pMaxY.x, y, matrix) &&
                checkLineX(y, pMaxY.y, pMaxY.x, matrix)
            ) {
                return y; // Trả về tọa độ Y hợp lệ
            }
        }
        return -1; // Không tìm thấy kết nối
    };


    const checkRectY = (p1: Cell, p2: Cell, matrix: Cell[][]): number => {
        // Xác định điểm có tọa độ X nhỏ hơn
        const [pMinX, pMaxX] = p1.x > p2.x ? [p2, p1] : [p1, p2];

        for (let x = pMinX.x; x <= pMaxX.x; x++) {
            // Nếu gặp vật cản giữa hai điểm
            if (x > pMinX.x && matrix[x][pMinX.y].state !== 0) {
                return -1;
            }
            // Kiểm tra các đường kết nối
            if (
                (matrix[x][pMaxX.y].state === 0 || x === pMaxX.x) &&
                checkLineX(pMinX.y, pMaxX.y, x, matrix) &&
                checkLineY(x, pMaxX.x, pMaxX.y, matrix)
            ) {
                return x; // Trả về tọa độ X hợp lệ
            }
        }
        return -1; // Không tìm thấy kết nối
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
        const idMatrix = matrix.map(row => row.map(cell => cell.id)); // Lấy ma trận id
        console.table(idMatrix); // In ra console
    };

    // Xử lý nhấn vào ô
    const handleCellPress = async (cell: Cell) => {
        if (cell.state === 0 || (lastChose && lastChose.x === cell.x && lastChose.y === cell.y)) return;

        if (!lastChose) {
            await playClickSound(); // Phát âm thanh nhấn ô
            setLastChose(cell);
        } else {
            if (canConnect(lastChose, cell, matrix)) {
                await playCorrectSound(); // Phát âm thanh chọn đúng
                saveGame();
                updateMatrix(cell, lastChose);
            } else {
                await playWrongSound(); // Phát âm thanh chọn sai
                saveGame();
            }
            setLastChose(null);
        }

        setHintPair(null); // Reset trạng thái gợi ý
        printMatrix();
    };


    const shuffleMatrix = () => {
        const existingCells = matrix.flat().filter((cell) => cell.state !== 0);

        const shuffledIds = existingCells
            .map((cell) => cell.id)
            .sort(() => Math.random() - 0.5);

        let index = 0;

        // Cập nhật ma trận tạm thời
        const newMatrix = matrix.map((row) =>
            row.map((cell) =>
                cell.state !== 0
                    ? { ...cell, id: shuffledIds[index++] }
                    : cell
            )
        );

        setMatrix(newMatrix); // Cập nhật trạng thái
        console.log('Matrix shuffled');

        // Kiểm tra cặp hợp lệ ngay trên `newMatrix`
        if (!hasAvailablePairs(newMatrix)) {
            console.log('No valid pairs, reshuffling...');
            shuffleMatrix(); // Gọi lại hàm nếu cần
        }
    };

    const findHint = () => {
        // Duyệt qua tất cả các ô còn tồn tại
        const existingCells = matrix.flat().filter((cell) => cell.state !== 0);

        for (let i = 0; i < existingCells.length; i++) {
            for (let j = i + 1; j < existingCells.length; j++) {
                const cell1 = existingCells[i];
                const cell2 = existingCells[j];

                // Kiểm tra nếu hai ô có thể kết nối được
                if (canConnect(cell1, cell2, matrix)) {
                    setHintPair({ cell1, cell2 }); // Lưu cặp gợi ý vào trạng thái
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
                    return true; // Có cặp hợp lệ
                }
            }
        }

        return false; // Không có cặp nào hợp lệ
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
        setScore((prevScore) => prevScore + 10); // Cập nhật điểm số đồng bộ
        setPairsFound((prevPairs) => prevPairs + 1); // Tăng số cặp đã tìm
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
                                    ((hintPair.cell1.x === cell.x && hintPair.cell1.y === cell.y) ||
                                        (hintPair.cell2.x === cell.x && hintPair.cell2.y === cell.y)) &&
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
            <TouchableOpacity
                style={styles.shuffleButton}
                onPress={shuffleMatrix}
            >
                <Text style={styles.buttonText}>Đảo Vị Trí</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.hintButton}
                onPress={findHint}
            >
                <Text style={styles.buttonText}>Gợi ý</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.button}
                onPress={() => {
                    saveGame(); // Lưu trạng thái
                    if (timerRef.current !== null) {
                        clearInterval(timerRef.current);
                        timerRef.current = null;
                    }
                    navigation.navigate('HomeScreen');
                }}
            >
                <Text style={styles.buttonText}>Trang chủ</Text>
            </TouchableOpacity>
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
    shuffleButton: {
        backgroundColor: '#32CD32',
        width: 170,
        padding: 15,
        marginTop: 10,
        borderRadius: 10,
        alignItems: 'center',
    },
    hintCell: {
        borderColor: 'blue',
        borderWidth: 3,
    },
    hintButton: {
        backgroundColor: '#ffa07a',
        padding: 15,
        marginTop: 10,
        borderRadius: 10,
        alignItems: 'center',
        width: 170,
    },
    cellImage: {
        width: '80%',
        height: '80%',
        resizeMode: 'contain', // Hoặc 'cover' tùy ý
    },
});
