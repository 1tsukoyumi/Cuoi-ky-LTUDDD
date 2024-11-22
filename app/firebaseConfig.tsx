import { initializeApp } from 'firebase/app';
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, getDocs, deleteDoc, doc, addDoc, onSnapshot, query, orderBy, limit } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCVWx0KDEqBN0ezujskV5p-FdMSg8RbjEc",
  authDomain: "lttbdd-pikachu.firebaseapp.com",
  projectId: "lttbdd-pikachu",
  storageBucket: "lttbdd-pikachu.firebasestorage.app",
  messagingSenderId: "722506564360",
  appId: "1:722506564360:android:141f35f4a6e1e1abe9a2bd",
  measurementId: "G-CSXSRFQVQF"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export const saveScore = async (username: any, score: any) => {
  try {
    await addDoc(collection(db, 'scores'), {
      username,
      score,
      timestamp: new Date(),
    });
    console.log('Score saved successfully!');
  } catch (error) {
    console.error('Error saving score:', error);
  }
};

export const fetchTopScoresRealtime = (callback : any) => {
  const scoresQuery = query(
    collection(db, 'scores'),
    orderBy('score', 'desc'), // Sắp xếp điểm từ cao đến thấp
    limit(5) // Lấy tối đa 5 người chơi
  );

  // Lắng nghe dữ liệu từ Firestore
  const unsubscribe = onSnapshot(scoresQuery, (snapshot) => {
    const scores : any = [];
    snapshot.forEach((doc) => {
      scores.push({ id: doc.id, ...doc.data() });
    });
    callback(scores); // Trả kết quả qua callback
  });

  return unsubscribe; // Hủy listener khi không dùng nữa
};

export const resetScores = async () => {
  try {
    const scoresCollection = collection(db, 'scores');
    const snapshot = await getDocs(scoresCollection);

    // Duyệt qua tất cả các document và xóa từng cái
    const deletePromises = snapshot.docs.map((document) =>
      deleteDoc(doc(db, 'scores', document.id))
    );

    await Promise.all(deletePromises);
    console.log('All scores have been reset.');
  } catch (error) {
    console.error('Error resetting scores:', error);
  }
};

export { db };