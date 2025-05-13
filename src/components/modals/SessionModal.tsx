// SessionModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, doc, getDoc, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { Session, TeamMemberInput } from '@/types/interfaces';

export interface SessionModalProps {
  organisationId: string;
  roundId: string;
  sessionToEdit?: Session;
  onClose: () => void;
  onCompleted: () => void;
}

export default function SessionModal({
  organisationId,
  roundId,
  sessionToEdit,
  onClose,
  onCompleted,
}: SessionModalProps) {
  const [sessionDate, setSessionDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [facilitatorName, setFacilitatorName] = useState('');
  const [teamName, setTeamName] = useState('');
  const [teamMembers, setTeamMembers] = useState<TeamMemberInput[]>([]);

  useEffect(() => {
    const loadExistingData = async () => {
      if (sessionToEdit) {
        setSessionDate(sessionToEdit.date);
        setStartTime(sessionToEdit.startTime);
        setFacilitatorName(sessionToEdit.facilitatorName);
        setTeamName(sessionToEdit.teamName);

        if (sessionToEdit.teamId) {
          const teamMembersQuery = query(collection(db, 'TeamMembers'), where('teamId', '==', sessionToEdit.teamId));
          const teamMembersSnap = await getDocs(teamMembersQuery);
          const members = teamMembersSnap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as TeamMemberInput));
          setTeamMembers(members);
        }
      } else {
        setSessionDate('');
        setStartTime('');
        setFacilitatorName('');
        setTeamName('');
        setTeamMembers([
          { firstName: '', lastName: '', email: '', mobile: '', isLeader: false, attended: false, certified: false },
        ]);
      }
    };

    loadExistingData();
  }, [sessionToEdit]);

  const handleTeamMemberChange = <K extends keyof TeamMemberInput>(index: number, field: K, value: TeamMemberInput[K]) => {
    const updated = [...teamMembers];
    updated[index][field] = value;
    setTeamMembers(updated);
  };

  const handleAddTeamMember = () => {
    setTeamMembers([...teamMembers, { firstName: '', lastName: '', email: '', mobile: '', isLeader: false, attended: false, certified: false }]);
  };

  const handleRemoveTeamMember = (index: number) => {
    const updated = [...teamMembers];
    updated.splice(index, 1);
    setTeamMembers(updated);
  };

  const handleSave = async () => {
    try {
      let sessionId = sessionToEdit?.id || '';
      let teamId = sessionToEdit?.teamId || '';

      // 1. Create or Update Session
      if (!sessionId) {
        const sessionRef = await addDoc(collection(db, 'Sessions'), {
          orgId: organisationId,
          roundId,
          date: sessionDate,
          startTime,
          facilitatorName,
          teamId: '', // To be updated after team creation
        });
        sessionId = sessionRef.id;
      } else {
        await updateDoc(doc(db, 'Sessions', sessionId), {
          date: sessionDate,
          startTime,
          facilitatorName,
        });
      }

      // 2. Create or Update Team
      if (!teamId) {
        const teamRef = await addDoc(collection(db, 'Teams'), {
          orgId: organisationId,
          roundId,
          sessionId,
          teamName,
        });
        teamId = teamRef.id;

        // Update Session with new teamId
        await updateDoc(doc(db, 'Sessions', sessionId), { teamId });
      } else {
        await updateDoc(doc(db, 'Teams', teamId), { teamName });
      }

      // 3. Manage Team Members
      const existingMembersQuery = query(collection(db, 'TeamMembers'), where('teamId', '==', teamId));
      const existingMembersSnap = await getDocs(existingMembersQuery);

      const existingMemberIds = existingMembersSnap.docs.map(docSnap => docSnap.id);
      const currentMemberIds = teamMembers.filter(m => m.id).map(m => m.id);
      const membersToDelete = existingMemberIds.filter(id => !currentMemberIds.includes(id));

      for (const memberId of membersToDelete) {
        await deleteDoc(doc(db, 'TeamMembers', memberId));
      }

      for (const member of teamMembers) {
        const memberData = {
          teamId,
          firstName: member.firstName || '',
          lastName: member.lastName || '',
          email: member.email || '',
          mobile: member.mobile || '',
          isLeader: member.isLeader ?? false,
          attended: member.attended ?? false,
          certified: member.certified ?? false,
        };

        if (member.id) {
          await updateDoc(doc(db, 'TeamMembers', member.id), memberData);
        } else {
          await addDoc(collection(db, 'TeamMembers'), memberData);
        }
      }
        // Ensure teamMembersCount is updated after saving members
await updateDoc(doc(db, 'Sessions', sessionId), {
  teamMembersCount: teamMembers.length,
});

      onCompleted();
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-2xl overflow-y-auto max-h-screen">
        <h2 className="text-xl font-bold mb-4">{sessionToEdit ? 'Edit' : 'Create'} Session</h2>

        <input className="border p-2 w-full mb-3" type="date" value={sessionDate} onChange={(e) => setSessionDate(e.target.value)} />
        <input className="border p-2 w-full mb-3" placeholder="Start Time (HH:mm)" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
        <input className="border p-2 w-full mb-3" placeholder="Facilitator Name" value={facilitatorName} onChange={(e) => setFacilitatorName(e.target.value)} />
        <input className="border p-2 w-full mb-3" placeholder="Team Name" value={teamName} onChange={(e) => setTeamName(e.target.value)} />

        <div className="mb-4">
          <h3 className="font-semibold text-lg mb-2">Team Members</h3>
          {teamMembers.map((member, index) => (
            <div key={index} className="mb-2 grid grid-cols-4 gap-2 items-center">
              <input className="border p-2" placeholder="First Name" value={member.firstName} onChange={(e) => handleTeamMemberChange(index, 'firstName', e.target.value)} />
              <input className="border p-2" placeholder="Last Name" value={member.lastName || ''} onChange={(e) => handleTeamMemberChange(index, 'lastName', e.target.value)} />
              <input className="border p-2" placeholder="Email" value={member.email} onChange={(e) => handleTeamMemberChange(index, 'email', e.target.value)} />
              <input className="border p-2" placeholder="Mobile" value={member.mobile || ''} onChange={(e) => handleTeamMemberChange(index, 'mobile', e.target.value)} />

              <div className="flex gap-2 items-center col-span-4">
                <label>
                  <input type="checkbox" checked={member.isLeader ?? false} onChange={(e) => handleTeamMemberChange(index, 'isLeader', e.target.checked)} /> Leader
                </label>
                <label>
                  <input type="checkbox" checked={member.attended ?? false} onChange={(e) => handleTeamMemberChange(index, 'attended', e.target.checked)} /> Present
                </label>
                <label>
                  <input type="checkbox" checked={member.certified ?? false} onChange={(e) => handleTeamMemberChange(index, 'certified', e.target.checked)} /> Certified
                </label>
                <button onClick={() => handleRemoveTeamMember(index)} className="text-red-600 hover:underline" title="Remove">✖</button>
              </div>
            </div>
          ))}
          <button onClick={handleAddTeamMember} className="mt-2 px-3 py-1 bg-blue-500 text-white rounded">➕ Add Team Member</button>
        </div>

        <div className="flex justify-end gap-2">
          <button className="px-4 py-2 bg-gray-400 rounded" onClick={onClose}>Cancel</button>
          <button className="px-4 py-2 bg-green-600 text-white rounded" onClick={handleSave}>{sessionToEdit ? 'Update' : 'Save'}</button>
        </div>
      </div>
    </div>
  );
}
