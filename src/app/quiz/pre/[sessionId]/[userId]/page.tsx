// Pre-Quiz Page 
// File: /app/quiz/pre/[sessionId]/[userId]/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { db } from '@/firebase';
import { 
  collection, query, where, getDocs, getDoc, doc, addDoc, Timestamp 
} from 'firebase/firestore';

interface QuizQuestion {
  id: string;
  text: string;
  answers: string[];
  correctAnswerIndex: number;
}

export default function PreQuizPage() {
  const { sessionId, userId } = useParams<{ sessionId: string; userId: string }>();

  const [quizContent, setQuizContent] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<{ [key: string]: number }>({});
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadQuiz = async () => {
      if (!sessionId || !userId) {
        setMessage('Invalid quiz link.');
        setLoading(false);
        return;
      }

      // Check if quiz already completed
      const quizAttemptQuery = query(
        collection(db, 'quizAttempts'),
        where('userId', '==', userId),
        where('sessionId', '==', sessionId),
        where('quizType', '==', 'pre')
      );

      const attemptSnapshot = await getDocs(quizAttemptQuery);
      if (!attemptSnapshot.empty) {
        setCompleted(true);
        setLoading(false);
        return;
      }

      // Fetch Session to get Round
      const sessionSnap = await getDoc(doc(db, 'Sessions', sessionId));
      if (!sessionSnap.exists()) {
        setMessage('Session not found.');
        setLoading(false);
        return;
      }

      const roundId = sessionSnap.data().roundId;

      // Fetch Round to get Pre-Quiz ID
      const roundSnap = await getDoc(doc(db, 'Rounds', roundId));
      if (!roundSnap.exists()) {
        setMessage('Round not found.');
        setLoading(false);
        return;
      }

      const preQuizId = roundSnap.data().preQuizId;
      if (!preQuizId) {
        setMessage('No Pre-Quiz assigned for this round.');
        setLoading(false);
        return;
      }

      // ✅ Fetch Quiz Questions from Subcollection
      const questionsSnapshot = await getDocs(collection(db, 'Quizzes', preQuizId, 'Questions'));
      const questions = questionsSnapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as QuizQuestion[];

      if (questions.length === 0) {
        setMessage('No questions found for this quiz.');
      } else {
        setQuizContent(questions);
      }

      setLoading(false);
    };

    loadQuiz();
  }, [sessionId, userId]);

  const handleAnswerChange = (questionId: string, selectedIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: selectedIndex }));
  };

  const handleSubmit = async () => {
    const totalQuestions = quizContent.length;
    const correctAnswers = quizContent.filter(
      (q) => answers[q.id] === q.correctAnswerIndex
    ).length;

    const score = Math.round((correctAnswers / totalQuestions) * 100);

    await addDoc(collection(db, 'quizAttempts'), {
      userId,
      sessionId,
      quizType: 'pre',
      score,
      completedAt: Timestamp.now(),
    });

    setCompleted(true);
  };

  if (loading) return <p>Loading quiz...</p>;
  if (message) return <p>{message}</p>;
  if (completed) return <p>You have already completed this quiz. Thank you!</p>;

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Pre-Game Quiz</h1>

      {quizContent.map((question) => (
        <div key={question.id} className="mb-4 p-4 border rounded">
          <p className="font-semibold">{question.text}</p>
          {question.answers.map((option, index) => (
            <label key={index} className="block mt-2">
              <input
                type="radio"
                name={question.id}
                value={index}
                checked={answers[question.id] === index}
                onChange={() => handleAnswerChange(question.id, index)}
                className="mr-2"
              />
              {option}
            </label>
          ))}
        </div>
      ))}

      <button
        onClick={handleSubmit}
        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        disabled={Object.keys(answers).length !== quizContent.length}
      >
        Submit Quiz
      </button>
    </div>
  );
}
