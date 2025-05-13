'use client';

import React from 'react';
import { RoundCardProps } from '@/types/interfaces';

export default function RoundCard({
  label,
  round,
  sessions,
  openSessionModal,
  openEditSessionModal,
  handleShowResults, // ✅ Receives the openResultsModal function from parent
  handleEditRound
}: RoundCardProps) {
  // Debug: Show round ID and compare with session round IDs
  console.log('%c[DEBUG] Current Round ID:', 'color: orange; font-weight: bold;', round.id);
  sessions.forEach(session => {
    console.log('%c[DEBUG] Session:', 'color: green;', {
      sessionId: session.id,
      roundId: session.roundId,
      matches: session.roundId === round.id
    });
  });

  const filteredSessions = sessions.filter(s => s.roundId === round.id);

  return (
    <div className="bg-white shadow p-4 rounded mt-4">
      {/* Round Header */}
      <div className="flex justify-between items-center mb-2">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{round.name}</h3>
          <p className="text-sm text-gray-500">{round.startDate} – {round.endDate}</p>
          <div className="mt-1 text-sm text-gray-600 space-y-1">
            <p>🎮 Game: {round.gameName || 'No Game Assigned'}</p>
            <p>📝 Pre-Quiz: {round.preQuizTitle || 'None'}</p>
            <p>📝 Post-Quiz: {round.postQuizTitle || 'None'}</p>
          </div>
        </div>
        <div className="space-x-2 flex items-center">
          {label !== '📜 Past Rounds' && (
            <button
              onClick={() => openSessionModal(round)}
              className="text-blue-600 text-xl"
              title="Add Session"
            >
              ➕
            </button>
          )}
          <button
            onClick={() => handleEditRound(round)}
            className="text-yellow-600 text-xl"
            title="Edit Round"
          >
            ✏️
          </button>
          <a
            href={`/scoreboard/${round.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-600 text-xl"
            title="Leaderboard"
          >
            🏆
          </a>
        </div>
      </div>

      {/* Sessions Section */}
      <ul className="mt-3 space-y-2">
        {filteredSessions.map(session => (
          <li
            key={session.id}
            className="border p-3 rounded flex justify-between items-center bg-gray-50 text-sm text-gray-700"
          >
            <div>
              <div className="font-semibold">📅 {session.date} at {session.startTime}</div>
              <div>🏷️ Team: {session.teamName || 'Unnamed Team'}</div>
              <div>👨‍💼 Facilitator: {session.facilitatorName || 'Not Assigned'}</div>
              <div>👥 Members: {session.teamMembersCount}</div>
            </div>
            <div className="flex gap-2">
              <button
                className="text-blue-600 text-lg"
                onClick={() => openEditSessionModal(session)}
                title="Edit Session"
              >
                ✏️
              </button>
              <button
                className="text-green-600 text-lg"
                onClick={() => handleShowResults(session.id)} 
                title="View Results"
              >
                📊
              </button>
            </div>
          </li>
        ))}

        {filteredSessions.length === 0 && (
          <li className="text-gray-500 italic text-center mt-2">
            No sessions added for this round yet.
          </li>
        )}
      </ul>
    </div>
  );
}
