// TeamMembersModal.tsx
// src/app/components/modals/TeamMembersModal.tsx

'use client';

import React from 'react';
import { TeamMemberInput } from '@/types/interfaces';

interface TeamMembersModalProps {
  members: TeamMemberInput[];
  sessionId: string;
  gameId: string;
  onClose: () => void;
}

const generateQuizLink = (type: 'pre' | 'post', sessionId: string, playerId: string) => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/quiz/${type}/${sessionId}/${playerId}`;
};

const openQuizLink = (type: 'pre' | 'post', sessionId: string, playerId: string) => {
  const url = generateQuizLink(type, sessionId, playerId);
  window.open(url, '_blank'); // Open in a new tab or window
};

export default function TeamMembersModal({ members, sessionId, gameId, onClose }: TeamMembersModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg overflow-y-auto max-h-screen">
        <h2 className="text-xl font-bold mb-4">Team Members</h2>

        <div className="space-y-4">
          {members.map((member, index) => (
            <div key={index} className="border p-4 rounded bg-gray-100">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">
                    {member.firstName} {member.lastName} {member.isLeader && '⭐'}
                  </p>
                  <p className="text-gray-600 text-sm">{member.email}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    className="text-blue-600 hover:underline"
                    onClick={() => openQuizLink('pre', sessionId, member.id || '')}
                  >
                    Pre-Quiz
                  </button>
                  <button
                    className="text-green-600 hover:underline"
                    onClick={() => openQuizLink('post', sessionId, member.id || '')}
                  >
                    Post-Quiz
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end mt-6">
          <button className="px-4 py-2 bg-gray-400 rounded" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
