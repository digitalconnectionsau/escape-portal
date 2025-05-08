'use client'

import { useEffect, useState } from 'react'
import { db } from '@/firebase'
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  getDoc,
} from 'firebase/firestore'
import Link from 'next/link'

interface Quiz {
  id: string
  title: string
  type: 'Pre' | 'Post'
  questions?: number
}

export default function QuizzesPage() {
  const [tab, setTab] = useState<'Pre' | 'Post'>('Pre')
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [showModal, setShowModal] = useState(false)
  const [newQuizTitle, setNewQuizTitle] = useState('')

  useEffect(() => {
    fetchQuizzes()
  }, [tab])

  const fetchQuizzes = async () => {
    const q = query(collection(db, 'Quizzes'), where('type', '==', tab))
    const snapshot = await getDocs(q)
    const list: Quiz[] = []
    for (const d of snapshot.docs) {
      const quizId = d.id
      const quizData = d.data() as Omit<Quiz, 'id' | 'questions'>
      // Optional: fetch questions count from subcollection
      const questionsSnapshot = await getDocs(collection(db, 'Quizzes', quizId, 'Questions'))
      list.push({ id: quizId, ...quizData, questions: questionsSnapshot.size })
    }
    setQuizzes(list)
  }

  const handleCreateQuiz = async () => {
    const docRef = await addDoc(collection(db, 'Quizzes'), {
      title: newQuizTitle,
      type: tab,
    })
    setNewQuizTitle('')
    setShowModal(false)
    fetchQuizzes()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Quizzes</h1>

      <div className="flex gap-4 mb-4">
        <button onClick={() => setTab('Pre')} className={tab === 'Pre' ? 'font-bold' : ''}>Pre</button>
        <button onClick={() => setTab('Post')} className={tab === 'Post' ? 'font-bold' : ''}>Post</button>
      </div>

      <button
        className="mb-4 bg-blue-600 text-white px-4 py-2 rounded"
        onClick={() => setShowModal(true)}
      >
        Add Quiz
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded">
            <h2 className="text-xl font-bold mb-4">Add {tab} Game Quiz</h2>
            <input
              className="border p-2 w-full mb-4"
              placeholder="Quiz Title"
              value={newQuizTitle}
              onChange={(e) => setNewQuizTitle(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button className="px-4 py-2 bg-gray-400 rounded" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={handleCreateQuiz}>Save</button>
            </div>
          </div>
        </div>
      )}

      <table className="w-full text-left border mt-4">
        <thead>
          <tr>
            <th className="p-2 border">Title</th>
            <th className="p-2 border">Questions</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {quizzes.map(quiz => (
            <tr key={quiz.id}>
              <td className="p-2 border">{quiz.title}</td>
              <td className="p-2 border">{quiz.questions ?? 0}</td>
              <td className="p-2 border">
  <Link
    href={`/admin-portal/quizzes/${quiz.id}`}
    className="text-sm bg-green-500 px-2 py-1 rounded text-white inline-block"
  >
    Manage Questions
  </Link>
</td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
