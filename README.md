# Google Drive Folder Creator

A Node.js application designed to create standardized organization folder structures within a Google Shared Drive. This tool is containerized and ready for deployment on Google Cloud Run.

## Features

- **Automated Folder Creation**: Creates a top-level folder for a new organization.
- **Standardized Structure**: Automatically generates a predefined set of subfolders:
  - Sales/Pre-sales
  - Onboarding
  - Post Onboarding
  - Legal Notices
- **Cloud Ready**: Built with Express.js, ready for Docker and Cloud Run.

## Prerequisites

1.  **Google Cloud Project**: Enable the **Google Drive API**.
2.  **Service Account**: Create a service account and download the JSON key file.
3.  **Permissions**: Grant the service account access (e.g., "Content Manager") to the target Google Shared Drive.
4.  **Shared Drive ID**: Obtain the ID of the Shared Drive where folders should be created.

## Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd drive-folder-creator-js
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

## Configuration

Set the following environment variables:

-   `GOOGLE_SHARED_DRIVE_ID`: (Required) The ID of the Google Shared Drive.
-   `GOOGLE_SERVICE_ACCOUNT_JSON`: (Required) Base64 encoded content of the Service Account JSON key file.
    -   Generate the base64 string: `base64 -i path/to/key.json` (Linux/macOS) or using PowerShell on Windows.
-   `PORT`: (Optional) Port to listen on (default: 8080).

## Usage

### Local Development

1.  Set the environment variables (e.g., in a `.env` file or export them).
2.  Run the application:
    ```bash
    npm start
    ```
3.  Send a POST request:
    ```bash
    curl -X POST http://localhost:8080/ \
         -H "Content-Type: application/json" \
         -d '{"organizationName": "My New Organization"}'
    ```

### Docker

1.  **Build the container**:
    ```bash
    docker build -t drive-folder-creator .
    ```

2.  **Run the container**:
    ```bash
    docker run -p 8080:8080 \
      -e GOOGLE_SHARED_DRIVE_ID="your_drive_id" \
      -e GOOGLE_SERVICE_ACCOUNT_JSON="base64_encoded_json" \
      drive-folder-creator
    ```

## API Reference

**Endpoint**: `POST /`

**Request Body**:
```json
{
  "organizationName": "String"
}
```

**Success Response (200 OK)**:
```json
{
  "id": "folder_id_string",
  "url": "https://drive.google.com/..."
}
```

**Error Response (400/500)**:
```json
{
  "error": "Error description"
}
```
