// Types for Green Haven Residence Employee Management System (EMS)

export interface EmployeeProfile {
  id?: string;
  employeeId: string;
  name: string;
  birthdate?: string;
  gender?: string;
  address?: string;
  province?: string;
  city?: string;
  zip?: string;
  contactNumber?: string;
  companyEmail: string;
  department: string;
  role: "Employee" | "Department Manager" | string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName?: string;
  date: string;
  timeIn?: string;
  timeOut?: string;
  shift?: string;
  status: "Present" | "On Leave" | "Absent";
}

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  address?: string;
  assignedEmployeeId: string;
  assignedEmployeeName?: string;
  assignedBy?: string;
  dueDate?: string;
  status: "Assigned" | "Pending Approval" | "Completed" | "Overdue";
  proofFileUrl?: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName?: string;
  leaveType: "Vacation Leave" | "Sick Leave" | "Emergency Leave" | string;
  startDate: string;
  endDate: string;
  isHalfDay?: boolean;
  totalDays: number;
  reason?: string;
  status: "Pending" | "Approved" | "Rejected";
  decidedBy?: string;
}

export interface AnnouncementItem {
  id: string;
  title: string;
  description: string;
  audience: string;
  date: string;
  status: "Draft" | "Published";
  author: string;
}
