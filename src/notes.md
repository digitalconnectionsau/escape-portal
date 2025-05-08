# 🧠 Escape Portal Project Notes

## 🔐 User Roles & Permissions

### 1. `super-admin`
- Full control of the system
- Can manage all organisations, rounds, sessions, and users
- Can add/remove admins and manage settings globally

### 2. `company-admin`
- Manages a single organisation
- Can add/edit sessions, rounds, teams, and members for their org
- Assigned during organisation creation as the primary contact
- Cannot see or edit other organisations

### 3. `player`
- Participates in rounds or sessions
- May complete quizzes or be part of a team
- No access to admin portal

---

## 🗃️ Firebase Collections Overview

### 🔸 `Users`
- Stores user data like first name, last name, email, role, organisationId
- Linked to Firebase Auth via UID

```json
{
  "uid": "abc123",
  "firstName": "Craig",
  "lastName": "Parker",
  "email": "craig@company.com",
  "role": "company-admin",
  "organisationId": "xyz789"
}
```

### 🔸 `Organisations`
- Stores company-level information
- Links to primary contact via `organisationAdminId`

```json
{
  "organisationName": "Cool Company",
  "organisationAdminId": "abc123",
  "status": "active"
}
```

### 🔸 `Rounds`
- Represents a window of activity for an organisation
- Has a start and end date
- Linked to `organisationId`

### 🔸 `Sessions`
- Events within a round
- Have dates and may contain multiple teams
- Linked to both `organisationId` and `roundId`

### 🔸 `Teams`
- Group of players under one session
- May have a unique code and name

### 🔸 `TeamMembers`
- Players assigned to teams
- Stores name, email, and teamId

### 🔸 `Games`
- Static list of game types (e.g. phishing, password challenge)
- Each game can be selected when setting up sessions

### 🔸 `Quizzes`
- Pre or post quizzes tied to users and/or sessions
- Can be stored as templates or actual submissions

### 🔸 `PhishingTests`
- Optional phishing campaigns tied to an org or user group
- Future expansion for simulation tracking

---

## 📌 Next Up
- Build modal for adding new organisation + company admin
- Handle login check or user creation in Users + Firebase Auth
- Store user role as `company-admin` during organisation creation

Let me know when we should define the schema for each collection in more detail.
