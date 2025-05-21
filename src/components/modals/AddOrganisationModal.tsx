// AddOrganisationsModal.tsx
// src/app/components/modals/AddOrganisationsModal.tsx
'use client';

import { useState } from 'react';
import { query, where, getDocs, collection } from 'firebase/firestore';
import { db, auth, functions } from '@/firebase';
import { useAuth } from '@/context/AuthProvider';
import { httpsCallable } from 'firebase/functions';

interface Props {
  onClose: () => void;
  onCreated?: () => void;
}

export default function NewOrganisationModal({ onClose, onCreated }: Props) {
  const [orgName, setOrgName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedTimezone, setSelectedTimezone] = useState('Australia/Brisbane');
  const [existingUser, setExistingUser] = useState<any>(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { role, loading } = useAuth();

  // Access Control
  if (loading) return null;
  if (role !== 'super-admin') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 w-full max-w-lg text-center">
          <h2 className="text-xl font-bold mb-4 text-red-600">Permission Denied</h2>
          <p className="mb-4">You do not have permission to add new organisations.</p>
          <button className="px-4 py-2 bg-gray-200 rounded" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    );
  }

  const handleEmailBlur = async () => {
    if (!email) return;
    setChecking(true);
    setError('');
    try {
      const q = query(collection(db, 'Users'), where('email', '==', email));
      const snap = await getDocs(q);
      setExistingUser(snap.empty ? null : snap.docs[0]);
    } catch (err) {
      setError('Error checking email.');
    } finally {
      setChecking(false);
    }
  };

  const validateForm = () => {
    if (!orgName.trim()) return 'Organisation name is required.';
    if (!firstName.trim()) return 'First name is required.';
    if (!lastName.trim()) return 'Last name is required.';
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) return 'Valid email is required.';
    if (!existingUser && calculatePasswordStrength() < 3) return 'Password is too weak.';
    return '';
  };

  const calculatePasswordStrength = () => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const getStrengthColor = () => {
    const strength = calculatePasswordStrength();
    if (strength <= 1) return 'bg-red-500';
    if (strength === 2) return 'bg-yellow-500';
    if (strength >= 3) return 'bg-green-500';
    return 'bg-gray-300';
  };

  const handleSubmit = async () => {
    try {
      if (!auth.currentUser) {
        setError('User not authenticated.');
        return;
      }

      const idTokenResult = await auth.currentUser.getIdTokenResult(true);
      if (idTokenResult.claims.role !== 'super-admin') {
        setError('You do not have permission to create an organisation.');
        return;
      }

      const validationError = validateForm();
      if (validationError) {
        setError(validationError);
        return;
      }

      const createOrganisation = httpsCallable(functions, 'createOrganisationWithAdmin');
      const result = await createOrganisation({
        orgName,
        firstName,
        lastName,
        email,
        password,
        timezone: selectedTimezone,
      });

      console.log('[DEBUG] Organisation Created:', result.data);
      onCreated?.();
      onClose();
    } catch (err: any) {
      console.error('[ERROR] Create Org:', err);
      setError(err?.message || 'Failed to create organisation.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">Add New Organisation</h2>

        <InputField label="Organisation Name" value={orgName} onChange={setOrgName} />
        <InputField label="First Name" value={firstName} onChange={setFirstName} />
        <InputField label="Last Name" value={lastName} onChange={setLastName} />
        <InputField label="Email" value={email} onChange={setEmail} onBlur={handleEmailBlur} type="email" />

        {!existingUser && (
          <div className="mb-3 relative">
            <label className="block text-sm font-medium">Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              className="w-full p-2 border rounded pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
            <div className="w-full h-2 bg-gray-300 rounded mt-2">
              <div
                className={`h-2 rounded ${getStrengthColor()}`}
                style={{ width: `${calculatePasswordStrength() * 25}%` }}
              ></div>
            </div>
            <PasswordHints password={password} />
          </div>
        )}

        {existingUser && (
          <div className="text-green-700 text-sm mb-3">User already exists and will be linked.</div>
        )}

        <div className="mb-3">
          <label className="block text-sm font-medium">Timezone</label>
          <select
            className="w-full p-2 border rounded"
            value={selectedTimezone}
            onChange={(e) => setSelectedTimezone(e.target.value)}
          >
            {[
              'Australia/Brisbane',
              'Australia/Sydney',
              'Australia/Perth',
              'Australia/Adelaide',
              'Australia/Darwin',
              'Australia/Melbourne',
              'Australia/Hobart',
            ].map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
        </div>

        {error && <div className="text-red-600 text-sm mb-3">{error}</div>}

        <div className="flex justify-end gap-2">
          <button className="px-4 py-2 bg-gray-200 rounded" onClick={onClose}>
            Cancel
          </button>
          <button className="px-4 py-2 bg-orange-500 text-white font-bold rounded" onClick={handleSubmit}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

// ✅ Reusable Input Field Component
const InputField = ({
  label,
  value,
  onChange,
  type = 'text',
  onBlur,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  type?: string;
  onBlur?: () => void;
}) => (
  <div className="mb-3">
    <label className="block text-sm font-medium">{label}</label>
    <input
      type={type}
      className="w-full p-2 border rounded"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
    />
  </div>
);

// ✅ Password Hints Component
const PasswordHints = ({ password }: { password: string }) => (
  <ul className="text-xs text-gray-600 mt-1 space-y-1">
    <li className={password.length >= 8 ? 'text-green-600' : ''}>• At least 8 characters</li>
    <li className={/[A-Z]/.test(password) ? 'text-green-600' : ''}>• Contains uppercase letter</li>
    <li className={/[0-9]/.test(password) ? 'text-green-600' : ''}>• Contains number</li>
    <li className={/[^A-Za-z0-9]/.test(password) ? 'text-green-600' : ''}>• Contains special character</li>
  </ul>
);
