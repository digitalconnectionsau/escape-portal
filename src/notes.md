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


## 📚 Escape Portal – Firebase Database Quick Reference

---

### ✅ **Collections Overview**

#### 1. **Organisations**

* **Purpose:** Stores high-level organisation data.
* **Fields:**

  * `id`: Document ID (Auto-generated)
  * `organisationName`: Name of the organisation
* **Usage:** Used to group rounds, sessions, and users under a business entity.

---

#### 2. **Rounds**

* **Purpose:** Represents a group of sessions linked to an organisation.
* **Fields:**

  * `id`: Document ID
  * `organisationId`: Reference to the owning Organisation
  * `roundName`: Name of the round
  * `startDate`: Start date (Timestamp)
  * `endDate`: End date (Timestamp)
  * `gameId`: (Optional) Linked Game ID
  * `preQuizId`: (Optional) Linked Pre-Quiz ID
  * `postQuizId`: (Optional) Linked Post-Quiz ID
* **Usage:** Organises sessions within time-bound events; defines which game and quizzes are associated.

---

#### 3. **Sessions**

* **Purpose:** Tracks individual sessions within a round.
* **Fields:**

  * `id`: Document ID
  * `orgId`: Organisation ID
  * `roundId`: Linked Round ID
  * `date`: Session Date
  * `startTime`: Start Time
  * `teamName`: Name of the team attending
  * `facilitatorName`: Facilitator assigned to the session
  * `teamId`: (Optional) Linked Team ID
  * `teamMembersCount`: Number of members in the session
  * `results`: Object containing session results (duration, engagement, participation, submission timestamp)
* **Usage:** Stores data about each individual event where a team participates in the game.

---

#### 4. **TeamMembers**

* **Purpose:** Stores individual participant data.
* **Fields:**

  * `id`: Document ID
  * `firstName`: Participant’s First Name
  * `lastName`: (Optional) Participant’s Last Name
  * `email`: Participant’s Email
  * `mobile`: (Optional) Mobile Number
  * `teamId`: Linked Team ID
* **Usage:** Used to track players across sessions for attendance, pre/post quizzes, and scoring.

---

#### 5. **Games**

* **Purpose:** Defines the different cybersecurity escape games available.
* **Fields:**

  * `id`: Document ID
  * `name`: Game Name
  * `description`: (Optional) Game Description
* **Usage:** Linked to Rounds to determine which game is played during sessions.

---

#### 6. **Quizzes**

* **Purpose:** Stores quiz templates for pre- and post-session assessments.
* **Fields:**

  * `id`: Document ID
  * `title`: Quiz Title
  * `questions`: Array of questions
* **Usage:** Linked to Rounds for pre- and post-evaluation of participants.

---

### 📌 **General Notes:**

* IDs are auto-generated unless explicitly defined.
* Date fields are stored as Timestamps for consistent formatting.
* All sensitive actions are validated by user roles (e.g., Admin, Facilitator).
* Future collections to consider: `AuditLogs`, `AgentCommands`, `Imports` (for Excel uploads).

---

**Document Last Updated:** \[Auto-update this with date manually when changes occur]

