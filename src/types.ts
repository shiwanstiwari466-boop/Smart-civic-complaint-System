export type ComplaintStatus = "Pending" | "In Progress" | "Resolved";
export type Priority = "High" | "Medium" | "Low";

export interface Complaint {
  id: string;
  userId: string;
  title: string;
  description: string;
  issueType: string;
  priority: Priority;
  department: string;
  status: ComplaintStatus;
  location: {
    lat?: number;
    lng?: number;
    address: string;
  };
  imageUrl?: string;
  adminNotes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: "user" | "admin";
}
