---
layout: default
title: User & Team Management Guide
nav_order: 17
---

# NFlow User & Team Management Guide

## Overview

NFlow supports multi-user and team-based collaboration. Users can create, join, and manage teams, share knowledge bases, and assign permissions for collaborative document processing and AI agent usage.

## User Management

### User Roles

- **Regular User**: Can create and manage their own knowledge, files, and agents.
- **Team Member**: Can access and contribute to team resources.
- **Admin**: Has elevated permissions for managing users, teams, and system settings.

### Creating a User

- Users can register via the web interface or be invited by an admin.
- Authentication supports email/password, OAuth, or SSO (depending on configuration).

### User Profile

- Update name, email, password, and preferences in the profile section.
- View assigned roles and team memberships.

## Team Management

### Creating a Team

1. Go to the **Teams** section in the dashboard.
2. Click **Create Team**.
3. Enter the team name and description.
4. Add members by email or user ID.
5. Assign roles (member, admin) as needed.

### Managing Team Members

- **Invite**: Add new members via email invitation.
- **Remove**: Remove members from the team.
- **Change Role**: Promote/demote members between admin and regular roles.

### Team Permissions

- Teams can own knowledge bases and agents.
- All team members can access shared resources.
- Only team admins can edit team settings or remove members.

## Permission System

NFlow implements a flexible permission and access control system:

### Permission Levels

- **Owner**: Full control over the resource (edit, delete, share, manage permissions).
- **Admin**: Manage users, teams, and system settings. Can assign/revoke permissions.
- **Editor**: Can modify content (edit knowledge, upload/delete files, configure agents).
- **Viewer**: Read-only access to knowledge, files, and agents.
- **Team Member**: Inherits permissions assigned to the team for shared resources.

### Permission Features

- **Resource Ownership**: Each knowledge base, file, or agent has an owner (user or team).
- **Granular Sharing**: Share resources with specific users or teams, assigning roles (viewer/editor).
- **Role-Based Access Control (RBAC)**: Permissions are enforced at the API and UI level.
- **Team-Based Access**: Team members automatically inherit access to team-owned resources.
- **Admin Controls**: Admins can manage all users, teams, and global settings.
- **Audit Logging**: All permission changes and access events are logged for traceability.

### Permission Matrix (Examples)

| Action                | Owner | Admin | Editor | Viewer | Team Member |
|-----------------------|:-----:|:-----:|:------:|:------:|:-----------:|
| View Knowledge        |   ✓   |   ✓   |   ✓    |   ✓    |      ✓      |
| Edit Knowledge        |   ✓   |   ✓   |   ✓    |        |      ✓*     |
| Delete Knowledge      |   ✓   |   ✓   |        |        |      ✓*     |
| Share Knowledge       |   ✓   |   ✓   |        |        |      ✓*     |
| Upload Files          |   ✓   |   ✓   |   ✓    |        |      ✓*     |
| Delete Files          |   ✓   |   ✓   |   ✓    |        |      ✓*     |
| Configure Agent       |   ✓   |   ✓   |   ✓    |        |      ✓*     |
| Chat with Agent       |   ✓   |   ✓   |   ✓    |   ✓    |      ✓      |
| Manage Team Members   |       |   ✓   |        |        |             |
| Change Permissions    |   ✓   |   ✓   |        |        |             |

\* If the resource is owned by the team and the member has the appropriate team role.

### Permission Management UI

- **Resource Sharing Dialog**: Assign users/teams and set their roles (viewer/editor).
- **Team Settings**: Manage team members and their roles (admin/member).
- **Profile Page**: View your permissions and team memberships.

## Feature List

Below is a detailed list of user and team features in NFlow:

### User Features

- Register and authenticate (email/password, OAuth, SSO)
- Update profile information (name, email, password)
- View and manage own knowledge bases, files, and agents
- Share resources with other users or teams
- View assigned roles and permissions
- Join or leave teams
- View activity logs and notifications

### Team Features

- Create and manage teams
- Invite/remove team members
- Assign admin/member roles within the team
- Team chat and collaboration (if enabled)
- Team dashboard: overview of shared knowledge, files, and agents
- Team-based permissions for resources
- Audit logs for team activities

### Knowledge Base Features

- Create, edit, and delete knowledge bases
- Assign ownership to user or team
- Share with users/teams (viewer/editor roles)
- Upload, parse, and manage files
- Configure chunking and processing settings
- Search and filter documents
- View statistics and usage analytics

### File Management Features

- Upload files (PDF, DOCX, XLSX, TXT, etc.)
- Parse and process files for embedding
- Configure file-specific settings
- Delete files
- View file status and processing logs

### Agent Features

- Create, edit, and delete AI agents
- Assign agent ownership (user/team)
- Configure agent flows and logic
- Share agents with users/teams
- Chat with agents (streaming, context-aware)
- View agent activity and usage

### Admin Features

- Manage all users and teams
- Assign/revoke admin roles
- Configure system-wide settings
- Monitor system health and logs
- View and manage all resources
- Access audit logs and reports

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/user` | GET | List users |
| `/api/user/:id` | GET | Get user details |
| `/api/user` | POST | Create user |
| `/api/user/:id` | PUT | Update user |
| `/api/user/:id` | DELETE | Delete user |
| `/api/team` | GET | List teams |
| `/api/team/:id` | GET | Get team details |
| `/api/team` | POST | Create team |
| `/api/team/:id` | PUT | Update team |
| `/api/team/:id` | DELETE | Delete team |

## Troubleshooting

- If you cannot access a team resource, check your membership and permissions.
- Only admins can delete teams or remove users.
- For SSO/OAuth issues, verify provider configuration.

## Further Reading

- [Knowledge Management Guide](knowledge-guide.md)
- [Agent Usage Guide](agent-guide.md)
- [Integration Guide](integration-guide.md)
