'use client'
export const dynamic = 'force-dynamic'

import { useSearchParams } from 'next/navigation'
import { useState, Suspense } from 'react'


function PostGameQuizInner() {
    const searchParams = useSearchParams()
    const id = searchParams.get('id')
  
    const [submitted, setSubmitted] = useState(false)
    const [answers, setAnswers] = useState({
      q1: '',
      q2: '',
      q3: ''
    })
  
    const handleChange = (question: string, value: string) => {
      setAnswers((prev) => ({ ...prev, [question]: value }))
    }
  
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      console.log('POST Submitted:', { id, ...answers })
      setSubmitted(true)
    }
  
    if (!id) {
      return <div className="text-red-500 font-medium">Invalid or missing session link.</div>
    }
  
    return (
      <div className="space-y-6">
        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block font-medium mb-2">
                1. What did you learn about cybersecurity today?
              </label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={answers.q1}
                onChange={(e) => handleChange('q1', e.target.value)}
                required
              />
            </div>
  
            <div>
              <label className="block font-medium mb-2">
                2. What would you do differently now online?
              </label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={answers.q2}
                onChange={(e) => handleChange('q2', e.target.value)}
                required
              />
            </div>
  
            <div>
              <label className="block font-medium mb-2">
                3. Do you feel more confident about cybersecurity now?
              </label>
              <select
                className="w-full p-2 border rounded"
                value={answers.q3}
                onChange={(e) => handleChange('q3', e.target.value)}
                required
              >
                <option value="">Select an answer</option>
                <option value="Yes, definitely">Yes, definitely</option>
                <option value="A little more">A little more</option>
                <option value="Not really">Not really</option>
              </select>
            </div>
  
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Submit Answers
            </button>
          </form>
        ) : (
          <div className="text-green-700 font-semibold">
            Thanks for completing the post-game quiz! 🎉
          </div>
        )}
      </div>
    )
  }
  

  export default function PostGameQuizPage() {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
        <div className="w-full max-w-2xl bg-white p-8 rounded-lg shadow">
          <h1 className="text-2xl font-bold mb-6">✅ Post-Game Questionnaire</h1>
          <Suspense fallback={<div>Loading quiz...</div>}>
            <PostGameQuizInner />
          </Suspense>
        </div>
      </div>
    )
  }
  