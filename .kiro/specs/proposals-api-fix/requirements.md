# Requirements Document

## Introduction

The application is experiencing 404 errors when trying to fetch fiber proposals from the `/api/proposals?type=FIBER` endpoint. The frontend components are making API calls to endpoints that don't exist, causing the application to fail when loading proposal data. This feature needs to implement the missing API routes to support proposal management functionality.

## Requirements

### Requirement 1

**User Story:** As a user of the fiber link calculator, I want to view existing fiber proposals, so that I can review and manage previously created proposals.

#### Acceptance Criteria

1. WHEN a user accesses the fiber link calculator THEN the system SHALL fetch existing fiber proposals from `/api/proposals?type=FIBER`
2. WHEN the API endpoint `/api/proposals?type=FIBER` is called THEN the system SHALL return a list of fiber proposals in JSON format
3. IF no fiber proposals exist THEN the system SHALL return an empty array with HTTP status 200
4. WHEN the API request fails THEN the system SHALL return appropriate error status codes and messages

### Requirement 2

**User Story:** As a user of the proposal system, I want to create new proposals, so that I can save and manage my proposal data.

#### Acceptance Criteria

1. WHEN a user submits a new proposal THEN the system SHALL accept POST requests to `/api/proposals`
2. WHEN a valid proposal is submitted THEN the system SHALL save the proposal data and return the created proposal with HTTP status 201
3. WHEN invalid proposal data is submitted THEN the system SHALL return validation errors with HTTP status 400
4. WHEN the proposal creation fails THEN the system SHALL return appropriate error messages with HTTP status 500

### Requirement 3

**User Story:** As a system administrator, I want the API to handle different proposal types, so that the system can support multiple calculator types (FIBER, VM, etc.).

#### Acceptance Criteria

1. WHEN querying proposals with a type parameter THEN the system SHALL filter results by the specified type
2. WHEN no type parameter is provided THEN the system SHALL return all proposals
3. WHEN an invalid type is provided THEN the system SHALL return an empty array with HTTP status 200
4. WHEN the system supports multiple proposal types THEN each type SHALL be properly categorized and retrievable

### Requirement 4

**User Story:** As a developer, I want proper error handling and logging, so that API issues can be diagnosed and resolved quickly.

#### Acceptance Criteria

1. WHEN API errors occur THEN the system SHALL log detailed error information
2. WHEN invalid requests are made THEN the system SHALL return descriptive error messages
3. WHEN database operations fail THEN the system SHALL handle errors gracefully and return appropriate HTTP status codes
4. WHEN authentication is required THEN the system SHALL validate tokens and return 401 for unauthorized requests