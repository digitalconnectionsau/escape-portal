'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { db } from '@/firebase'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
} from 'firebase/firestore'

interface Question {
  id: string
  text: string
  answers: string[]
  correctAnswerIndex: number
}

export default function QuizDetailPage() {
  const { quizId } = useParams()
  const [quizTitle, setQuizTitle] = useState('')
  const [questions, setQuestions] = useState<Question[]>([])
  const [newQuestion, setNewQuestion] = useState('')
  const [answers, setAnswers] = useState(['', '', '', '']) // default 4
  const [correctIndex, setCorrectIndex] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      const quizRef = doc(db, 'Quizzes', String(quizId))
      const quizSnap = await getDoc(quizRef)
      if (quizSnap.exists()) {
        setQuizTitle(quizSnap.data().title)
      }

      const questionsSnap = await getDocs(collection(quizRef, 'Questions'))
      const list: Question[] = questionsSnap.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<Question, 'id'>),
      }))
      setQuestions(list)
    }

    fetchData()
  }, [quizId])

  const handleAddQuestion = async () => {
    const validAnswers = answers.filter(a => a.trim() !== '')
    if (!newQuestion.trim() || validAnswers.length < 2) return alert('You need at least 2 answers.')

    const questionData = {
      text: newQuestion,
      answers: validAnswers,
      correctAnswerIndex: correctIndex,
    }

    const quizRef = doc(db, 'Quizzes', String(quizId))
    const questionsCol = collection(quizRef, 'Questions')
    const newDoc = await addDoc(questionsCol, questionData)

    setQuestions(prev => [...prev, { id: newDoc.id, ...questionData }])
    setNewQuestion('')
    setAnswers(['', '', '', ''])
    setCorrectIndex(0)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Manage Quiz: {quizTitle}</h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Add New Question</h2>
        <input
          className="border p-2 w-full mb-2"
          placeholder="Enter question text"
          value={newQuestion}
          onChange={e => setNewQuestion(e.target.value)}
        />
        <div className="space-y-2 mb-4">
          {answers.map((answer, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="radio"
                name="correct"
                checked={correctIndex === i}
                onChange={() => setCorrectIndex(i)}
              />
              <input
                className="border p-1 flex-1"
                placeholder={`Answer ${i + 1}`}
                value={answer}
                onChange={e => {
                  const updated = [...answers]
                  updated[i] = e.target.value
                  setAnswers(updated)
                }}
              />
            </div>
          ))}
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleAddQuestion}>
          Add Question
        </button>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Existing Questions</h2>
        {questions.map(q => (
          <div key={q.id} className="border p-4 mb-4">
            <p className="font-bold">{q.text}</p>
            <ul className="list-disc ml-6 mt-2">
              {q.answers.map((a, i) => (
                <li key={i} className={i === q.correctAnswerIndex ? 'text-green-600 font-semibold' : ''}>
                  {a}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
