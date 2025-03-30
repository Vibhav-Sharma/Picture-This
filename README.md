# Picture This 🖼️✨
An AI-powered image generation app that creates beautiful visuals from text prompts using Stability AI's API.

## Features
- Generate high-quality AI images from text descriptions
- Cumulative prompting: build on previous prompts to refine your images
- Modern WhatsApp-inspired UI with chat interface
- Secure authentication with Google OAuth and Firebase
- Responsive design for both desktop and mobile

## Tech Stack
- **Frontend:** HTML5, CSS3, JavaScript
- **Backend:** Node.js, Express.js
- **Authentication:** Firebase Auth, Google OAuth 2.0
- **AI Image Generation:** Stability AI API
- **Session Management:** Express Session

## Prerequisites
- Node.js and npm installed
- Google Cloud account (for OAuth)
- Firebase account
- Stability AI API key

## Setup & Installation

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/picture-this.git
cd picture-this
```

### 2. Create environment variables
Copy the example environment file and fill in your credentials:
```bash
cp .env.example .env
```

Edit the `.env` file with your actual credentials:
- Firebase configuration (for client-side auth)
- Google OAuth credentials (for server-side auth)
- Stability AI API key (for image generation)

### 3. Install dependencies
```bash
npm install
```

### 4. Start the server
```bash
npm start
```

The application will be available at http://localhost:3000

## Environment Variables Setup

### Required API Keys:

#### Stability AI API
1. Visit https://platform.stability.ai/
2. Sign up for an account and verify your email
3. Navigate to Account → API Keys
4. Copy your API key
5. Add it to your .env file as `STABILITY_API_KEY=your_key_here`

#### Google OAuth
1. Go to the Google Cloud Console: https://console.cloud.google.com/
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" → "Credentials"
4. Create an OAuth 2.0 Client ID for a Web application
5. Add authorized redirect URI: http://localhost:3000/oauth2callback
6. Copy the Client ID and Client Secret
7. Add them to your .env file:
   - `GOOGLE_CLIENT_ID=your_client_id`
   - `GOOGLE_CLIENT_SECRET=your_client_secret`

#### Firebase Configuration
1. Go to the Firebase Console: https://console.firebase.google.com/
2. Create a new project or select an existing one
3. Add a web app to your project
4. Copy the Firebase configuration object
5. Add the values to your .env file:
   - `FIREBASE_API_KEY=your_api_key`
   - `FIREBASE_AUTH_DOMAIN=your_auth_domain`
   - `FIREBASE_PROJECT_ID=your_project_id`
   - `FIREBASE_STORAGE_BUCKET=your_storage_bucket`
   - `FIREBASE_MESSAGING_SENDER_ID=your_sender_id`
   - `FIREBASE_APP_ID=your_app_id`
   - `FIREBASE_MEASUREMENT_ID=your_measurement_id`

## Usage
1. Register or log in with Google authentication
2. Enter a text prompt describing the image you want to generate
3. Wait for the AI to generate your image
4. Continue entering new prompts to build upon your previous image
5. Use "modify:" prefix to make specific changes to the previous image

## License
This project is licensed under the MIT License.

## Contributing
Pull requests are welcome! Feel free to fork the repository and submit your improvements.
