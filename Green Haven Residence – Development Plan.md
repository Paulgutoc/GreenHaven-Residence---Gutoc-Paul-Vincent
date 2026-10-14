# Green Haven Residence – Development Plan

Oct 6, 2026 · @Paul

This plan covers building the Green Haven Residence website, the Employee Management System, in about 16 weeks, from Oct 12, 2026 to Feb 5, 2027. It delivers the 18 screens already designed in Figma for two roles, Employee and Department Manager.

## Goal and scope

**In scope**

- Account activation by Employee ID and company email, with a default password sent by email
- First-login username and password change, plus later password change
- Employee: profile, attendance view, task list and status update with proof upload, announcements, leave request and status
- Department Manager: dashboard, attendance review, announcements, employee list, leave approval, task assignment
- The site title "Green Haven Residence" on every page

**Out of scope for version 1**

- Payroll, recruitment and performance reviews
- A native mobile app (the site is built responsive instead)
- A separate administrator role. The screens mention an "administrator" for announcements and leave, so this plan treats the Department Manager as that approver.

## Users and permissions

The system has two roles, and a manager can see only their own department.

| Capability | Employee | Department Manager |
| --- | --- | --- |
| Activate account, log in, change username and password | Yes | Yes |
| View and update own profile | Yes | Yes |
| View own attendance | Yes | Own record only |
| Review department attendance | No | Yes |
| View assigned tasks, update status with proof | Yes | No |
| View and assign tasks, approve or reject proof | No | Yes |
| Read announcements | Yes | Yes |
| Post and edit announcements | No | Yes |
| Create leave request, view its status | Yes | No |
| Approve or reject leave | No | Yes |
| View employees in department | No | Yes |

## Modules and screens

The 18 screens group into eight modules. Build order follows the dependencies: nothing works until accounts and roles do.

| # | Module | Screens (numbers from the screen documentation) | Main build work |
| --- | --- | --- | --- |
| 1 | Shared layout | Left menu, logo, background, page header | Responsive layout, role-based menu, site title |
| 2 | Accounts and access | 1 Login, 2 Activate Account, 3 Email Sent, 4 and 5 Change Username and Password | Validation against employee records, email service, unique usernames, password hashing, sessions |
| 3 | Profile | 6 Edit Profile | Edit and save form, password change |
| 4 | Attendance | 7 Employee Attendance, 14 Manager Attendance | Time in and out records, required and actual hours, Present, On Leave and Absent status |
| 5 | Tasks | 8 Assigned Task, 9 Update Task Status, 18 View and Assign Task | Task create and assign, file upload, status flow Assigned, Pending Approval, Completed, Overdue |
| 6 | Announcements | 10 Employee Announcement, 15 Manager Announcement | Create, edit, audience, published status |
| 7 | Leave | 11 Leave Status, 12 New Request, 17 Manager Leave Request | Request form, half-day option, balance calculation, approve and reject |
| 8 | Manager overview | 13 Dashboard, 16 View Employee | Summary cards and chart, department filter, profile view, messaging |

## Timeline

The build runs 16 weeks in five phases, with launch on Feb 5, 2027.

&#91;embedded content: phase timeline · 5 phases, 1 launch\]

Employee and manager modules overlap for one week (Dec 7 to Dec 11), and Phase 1 includes designing the four manager forms that do not exist yet. Dates assume one developer starting Oct 12, 2026.

## Data model and tech stack

The database needs eight core tables. The stack below is a suggestion; swap it for whatever your course or team already uses.

| Table | Key fields |
| --- | --- |
| Employee | Employee ID, name, birthdate, gender, address, province, city, ZIP, contact number, company email, department, role |
| Account | Employee ID, username, password hash, activated flag, must-change-password flag |
| Attendance | Employee ID, date, time in, time out, shift, status |
| Task | Title, description, address, assigned employee, assigned by, due date, status, proof file |
| Announcement | Title, description, audience, date, status, author |
| Leave request | Employee ID, leave type, per-day entries (all day or half day), reason, status, decided by |
| Leave balance | Employee ID, leave type, days allowed, days used |
| Message | Sender, recipient, body, sent time |

**Suggested stack**

- Front end: React (or plain HTML, CSS and JavaScript if the team is small), responsive
- Back end: Node.js with Express, REST API
- Database: MySQL or PostgreSQL
- Email: SMTP service for the default-password message
- File storage: server folder or cloud bucket for task proof uploads
- Hosting: any VPS or platform with HTTPS

## Testing and acceptance

A phase is done when its screens match the Figma designs and every check below passes.

- **Accounts:** an invalid Employee ID or email is rejected; the default password email arrives; a taken username shows "Username is already taken"; wrong passwords cannot log in.
- **Permissions:** an employee cannot open manager pages by typing the address; a manager sees only their department.
- **Tasks:** Submit stays unavailable until a file is attached; the status changes only after Submit; Cancel changes nothing.
- **Leave:** half-day entries reduce the balance by 0.5; approve and reject update the employee's status page.
- **Attendance:** Present, On Leave and Absent show the correct colour and match the records.
- **Devices:** every screen works on a laptop, tablet and phone in current Chrome and Edge.
- **User acceptance:** two employees and one manager complete a full walkthrough with no blocking issues in weeks 14 to 16.

## Risks, assumptions and open questions

| Risk or assumption | Effect | Response |
| --- | --- | --- |
| Email delivery of default passwords fails or lands in spam | New users cannot activate | Use a verified sender domain; add a resend option |
| Manager screens are not yet designed for profile, messaging and new-announcement or assign-task forms | Phase 4 slips | Design these four forms in Phase 1 |
| The dashboard shows revenue and occupancy figures, which no employee data supplies | Cards stay empty | Confirm with the owner which figures are real, or use department metrics only |
| One developer builds everything | Dates move if work is lost | Keep phases independent; cut messaging first if time runs short |

**Open questions**

- Is the Department Manager also the administrator who posts announcements and approves leave?
- Who creates the employee records that activation checks against?
- What are the leave types and yearly balances?
- Does "Forgot Password?" on the login page need a reset flow in version 1?
