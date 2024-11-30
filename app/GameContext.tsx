import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Cell} from './GameScreen';

export const saveGameStateToStorage = async (gameState: GameState) => {
    try {
        await AsyncStorage.setItem('gameState', JSON.stringify(gameState));
        console.log('Game state saved to storage!');
    } catch (error) {
        console.error('Error saving game state:', error);
    }
};

export const loadGameStateFromStorage = async (): Promise<GameState | null> => {
    try {
        const savedState = await AsyncStorage.getItem('gameState');
        return savedState ? JSON.parse(savedState) : null;
    } catch (error) {
        console.error('Error loading game state:', error);
        return null;
    }
};

type GameState = {
    matrix: Cell[][] | null;
    timeLeft: number;
    score: number;
    pairsFound: number;
    playerName: string;
};

type GameContextType = {
    gameState: GameState;
    setGameState: React.Dispatch<React.SetStateAction<GameState>>;
};

const defaultState: GameState = {
    matrix: null,
    timeLeft: 60,
    score: 0,
    pairsFound: 0,
    playerName: '',
};

const GameContext = createContext({
    gameState: defaultState,
    setGameState: (state: GameState) => {},
});

export const GameProvider = ({ children }: { children: React.ReactNode }) => {
    const [gameState, setGameState] = useState<GameState>(defaultState);

    useEffect(() => {
        const loadGameState = async () => {
            const savedState = await AsyncStorage.getItem('gameState');
            if (savedState) {
                setGameState(JSON.parse(savedState));
            }
        };
        loadGameState();
    }, []);

    useEffect(() => {
        AsyncStorage.setItem('gameState', JSON.stringify(gameState));
    }, [gameState]);

    return (
        <GameContext.Provider value={{ gameState, setGameState }}>
            {children}
        </GameContext.Provider>
    );
};


export const useGameContext = () => useContext(GameContext);
