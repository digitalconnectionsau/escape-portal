'use client';

import { useEffect, useState } from 'react';
import { collection, addDoc, updateDoc, doc, getDoc, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import { useAuth } from '@/context/AuthProvider';
import { Round, Game, Quiz, AddRoundModalProps } from '@/types/interfaces';

export default function AddRoundModal({ organisationId, roundToEdit, onClose, onCompleted }: AddRoundModalProps) {
  const [roundName, setRoundName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [timezone, setTimezone] = useState('Australia/Brisbane');
  const [error, setError] = useState('');

  const [games, setGames] = useState<Game[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedGame, setSelectedGame] = useState('');
  const [selectedPreQuiz, setSelectedPreQuiz] = useState('');
  const [selectedPostQuiz, setSelectedPostQuiz] = useState('');

  const { role, loading } = useAuth();

  useEffect(() => {
    fetchGames();
    fetchQuizzes();
    fetchOrganisationTimezone();

    if (roundToEdit) {
      setRoundName(roundToEdit.name || '');
      setStartDate(roundToEdit.startDate);
      setEndDate(roundToEdit.endDate);
      setSelectedGame(roundToEdit.gameId || '');
      setSelectedPreQuiz(roundToEdit.preQuizId || '');
      setSelectedPostQuiz(roundToEdit.postQuizId || '');
      if (roundToEdit.timezone) setTimezone(roundToEdit.timezone);
    }
  }, [roundToEdit]);

  const fetchGames = async () => {
    const snapshot = await getDocs(collection(db, 'Games'));
    const gameList: Game[] = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as Omit<Game, 'id'>) }));
    setGames(gameList);
  };

  const fetchQuizzes = async () => {
    const snapshot = await getDocs(collection(db, 'Quizzes'));
    const quizList: Quiz[] = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as Omit<Quiz, 'id'>) }));
    setQuizzes(quizList);
  };

  const fetchOrganisationTimezone = async () => {
    try {
      const orgRef = doc(db, 'Organisations', organisationId);
      const orgSnap = await getDoc(orgRef);
      if (orgSnap.exists()) {
        const data = orgSnap.data();
        if (data.timezone) {
          setTimezone(data.timezone);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch organisation timezone', err);
    }
  };

  const handleSubmit = async () => {
    if (!startDate || !endDate) {
      setError('Start and end dates are required.');
      return;
    }

    try {
      const start = Timestamp.fromDate(new Date(startDate));
      const end = Timestamp.fromDate(new Date(endDate));

      const roundDoc = {
        organisationId,
        roundName: roundName || `${startDate} Round`,
        startDate: start,
        endDate: end,
        status: 'active',
        gameId: selectedGame || null,
        preQuizId: selectedPreQuiz || null,
        postQuizId: selectedPostQuiz || null,
        timezone,
      };

      if (roundToEdit) {
        const roundRef = doc(db, 'Rounds', roundToEdit.id);
        await updateDoc(roundRef, roundDoc);
      } else {
        await addDoc(collection(db, 'Rounds'), roundDoc);
      }

      onCompleted();
      onClose();
    } catch (err) {
      console.error(err);
      setError('Failed to save round.');
    }
  };

  if (loading) return null;
  if (!role || !['super-admin', 'company-admin', 'org-manager'].includes(role)) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 w-full max-w-lg text-center">
          <h2 className="text-xl font-bold mb-4 text-red-600">Permission Denied</h2>
          <p className="mb-4">You do not have permission to manage rounds.</p>
          <button className="px-4 py-2 bg-gray-200 rounded" onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">
          {roundToEdit ? 'Edit Round' : 'Add New Round'}
        </h2>

        <div className="mb-3">
          <label className="block text-sm font-medium">Round Name (optional)</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={roundName}
            onChange={e => setRoundName(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium">Start Date</label>
          <input
            type="date"
            className="w-full p-2 border rounded"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium">End Date</label>
          <input
            type="date"
            className="w-full p-2 border rounded"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium">Timezone</label>
          <select
            className="w-full p-2 border rounded"
            value={timezone}
            onChange={e => setTimezone(e.target.value)}
          >
            {[
              'Australia/Brisbane',
              'Australia/Sydney',
              'Australia/Melbourne',
              'Australia/Perth',
              'Australia/Adelaide',
              'Australia/Darwin',
              'Australia/Hobart',
            ].map(tz => (
              <option key={tz} value={tz}>{tz}</option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium">Select Game</label>
          <select
            className="w-full p-2 border rounded"
            value={selectedGame}
            onChange={e => setSelectedGame(e.target.value)}
          >
            <option value="">None</option>
            {games.map(game => (
              <option key={game.id} value={game.id}>{game.name}</option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium">Select Pre-Game Quiz</label>
          <select
            className="w-full p-2 border rounded"
            value={selectedPreQuiz}
            onChange={e => setSelectedPreQuiz(e.target.value)}
          >
            <option value="">None</option>
            {quizzes.filter(q => q.type === 'Pre').map(quiz => (
              <option key={quiz.id} value={quiz.id}>{quiz.title}</option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium">Select Post-Game Quiz</label>
          <select
            className="w-full p-2 border rounded"
            value={selectedPostQuiz}
            onChange={e => setSelectedPostQuiz(e.target.value)}
          >
            <option value="">None</option>
            {quizzes.filter(q => q.type === 'Post').map(quiz => (
              <option key={quiz.id} value={quiz.id}>{quiz.title}</option>
            ))}
          </select>
        </div>

        {error && <div className="text-red-600 text-sm mb-3">{error}</div>}

        <div className="flex justify-end gap-2">
          <button className="px-4 py-2 bg-gray-200 rounded" onClick={onClose}>Cancel</button>
          <button className="px-4 py-2 bg-orange-500 text-white font-bold rounded" onClick={handleSubmit}>
            {roundToEdit ? 'Update' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}