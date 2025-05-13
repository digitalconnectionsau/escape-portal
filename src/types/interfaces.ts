//src/types/interfaces.ts

export interface Session {
    id: string;
    date: string;
    startTime: string;
    teamName: string;
    facilitatorName: string;
    teamMembersCount: number;
    teamId?: string;
    roundId: string;
    results?: {
      durationMinutes: number;
      durationSeconds: number;
      engagementRating: number;
      participationRating: number;
      submittedAt: any;
    };
    teamMembers?: TeamMemberInput[];
  }
  
  export interface Round {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    gameId?: string;
    preQuizId?: string;
    postQuizId?: string;
    gameName?: string;
    preQuizTitle?: string;
    postQuizTitle?: string;
  }
  
  export interface Organisation {
    id: string;
    organisationName: string;

  }
  
  export interface Game {
    id: string;
    name: string;
  }
  
  export interface TeamMemberInput {
    id?: string;
    firstName: string;
    lastName?: string;
    email: string;
    mobile?: string;
    roundId?: string;
  }
  
  export interface Quiz {
    id: string;
    title: string;
    type: 'Pre' | 'Post';
  }

  export interface SessionModalProps {
    show: boolean;
    onClose: () => void;
    onCompleted: () => void;
    organisationId: string;
    roundId: string;
    sessionToEdit?: Session;
    teamMembers: TeamMemberInput[];
    handleTeamMemberChange: (index: number, field: keyof TeamMemberInput, value: string) => void;
    handleAddTeamMember: () => void;
    handleRemoveTeamMember: (index: number) => void;
    handleSaveSession: () => void;
    sessionDate: string;
    startTime: string;
    facilitatorName: string;
    teamName: string;
    setSessionDate: (value: string) => void;
    setStartTime: (value: string) => void;
    setFacilitatorName: (value: string) => void;
    setTeamName: (value: string) => void;
  }
  
  export interface RoundCardProps {
    label: string;
    round: Round;
    sessions: Session[];
    openSessionModal: (round: Round) => void;
    openEditSessionModal: (session: Session) => void;
    handleShowResults: (sessionId: string) => void;
    handleEditRound: (round: Round) => void; 
  }
  
  export interface ParticipationRecord {
    roundId: string;
    sessionId: string;
    date: string;
    role: 'Leader' | 'Standard';
    attended: boolean;
    certificationValidUntil?: string;
    preQuizCompleted: boolean;
    postQuizCompleted: boolean;
  }
  
  export interface TeamMember {
    id: string;
    firstName: string;
    lastName?: string;
    email: string;
    mobile?: string;
    currentSessionId?: string;
    participationHistory: ParticipationRecord[];
  }

  export interface TeamMemberInput {
    id?: string;
    firstName: string;
    lastName?: string;
    email: string;
    mobile?: string;
    roundId?: string;
    isLeader?: boolean;
    attended?: boolean;
    certified?: boolean;
}
  
  
  
  