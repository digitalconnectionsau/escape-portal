'use client'

import { useEffect, useState } from 'react'
import { collection, addDoc, getDocs, updateDoc, doc } from 'firebase/firestore'
import { db } from '@/firebase'



interface Game {
  id: string
  name: string
  version: string
  url: string
  status: 'Active' | 'Not Active'
}

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([])
  const [showModal, setShowModal] = useState(false)
  const [newGame, setNewGame] = useState({ name: '', version: '', url: '' })
  const [editingId, setEditingId] = useState<string | null>(null)
const [editFields, setEditFields] = useState({ name: '', version: '', url: '' })

const startEdit = (game: Game) => {
  setEditingId(game.id)
  setEditFields({ name: game.name, version: game.version, url: game.url })
}

const cancelEdit = () => {
  setEditingId(null)
  setEditFields({ name: '', version: '', url: '' })
}

const saveEdit = async (id: string) => {
  await updateDoc(doc(db, 'Games', id), {
    name: editFields.name,
    version: editFields.version,
    url: editFields.url,
  })
  setGames(prev =>
    prev.map(game =>
      game.id === id ? { ...game, ...editFields } : game
    )
  )
  cancelEdit()
}


  useEffect(() => {
    const fetchGames = async () => {
      const snapshot = await getDocs(collection(db, 'Games'))
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<Game, 'id'>),
      }))
      setGames(list)
    }

    fetchGames()
  }, [])

  const handleAddGame = async () => {
    const docRef = await addDoc(collection(db, 'Games'), {
      name: newGame.name,
      version: newGame.version,
      url: newGame.url,
      status: 'Active',
    })
    setGames(prev => [...prev, { ...newGame, id: docRef.id, status: 'Active' }])
    setNewGame({ name: '', version: '', url: '' })
    setShowModal(false)
  }

  const toggleStatus = async (game: Game) => {
    const newStatus = game.status === 'Active' ? 'Not Active' : 'Active'
    await updateDoc(doc(db, 'Games', game.id), { status: newStatus })
    setGames(prev => prev.map(g => g.id === game.id ? { ...g, status: newStatus } : g))
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Games</h1>
      <button className="mb-4 bg-blue-600 text-white px-4 py-2 rounded" onClick={() => setShowModal(true)}>
        Add Game
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded">
            <h2 className="text-xl font-bold mb-4">Add New Game</h2>
            <input
              className="border p-2 w-full mb-2"
              placeholder="Game Name"
              value={newGame.name}
              onChange={e => setNewGame({ ...newGame, name: e.target.value })}
            />
            <input
              className="border p-2 w-full mb-2"
              placeholder="Version"
              value={newGame.version}
              onChange={e => setNewGame({ ...newGame, version: e.target.value })}
            />
            <input
              className="border p-2 w-full mb-4"
              placeholder="URL"
              value={newGame.url}
              onChange={e => setNewGame({ ...newGame, url: e.target.value })}
            />
            <div className="flex justify-end gap-2">
              <button className="px-4 py-2 bg-gray-400 rounded" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={handleAddGame}>Save</button>
            </div>
          </div>
        </div>
      )}

      <table className="w-full text-left border mt-4">
        <thead>
          <tr>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Version</th>
            <th className="p-2 border">URL</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
        {games.map(game => {
  const isEditing = editingId === game.id
  return (
    <tr key={game.id}>
      <td className="p-2 border">
        {isEditing ? (
          <input
            className="border p-1 w-full"
            value={editFields.name}
            onChange={e => setEditFields({ ...editFields, name: e.target.value })}
          />
        ) : (
          game.name
        )}
      </td>
      <td className="p-2 border">
        {isEditing ? (
          <input
            className="border p-1 w-full"
            value={editFields.version}
            onChange={e => setEditFields({ ...editFields, version: e.target.value })}
          />
        ) : (
          game.version
        )}
      </td>
      <td className="p-2 border">
        {isEditing ? (
          <input
            className="border p-1 w-full"
            value={editFields.url}
            onChange={e => setEditFields({ ...editFields, url: e.target.value })}
          />
        ) : (
          <a href={game.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
            Visit
          </a>
        )}
      </td>
      <td className="p-2 border">{game.status}</td>
      <td className="p-2 border space-x-2">
        <button
          className="text-sm px-2 py-1 bg-yellow-400 rounded"
          onClick={() => toggleStatus(game)}
        >
          Toggle Status
        </button>
        {isEditing ? (
          <>
            <button
              className="text-sm px-2 py-1 bg-green-500 text-white rounded"
              onClick={() => saveEdit(game.id)}
            >
              Save
            </button>
            <button
              className="text-sm px-2 py-1 bg-gray-400 rounded"
              onClick={() => cancelEdit()}
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            className="text-sm px-2 py-1 bg-blue-500 text-white rounded"
            onClick={() => startEdit(game)}
          >
            Edit
          </button>
        )}
      </td>
    </tr>
  )
})}

        </tbody>
      </table>
    </div>
  )
}
