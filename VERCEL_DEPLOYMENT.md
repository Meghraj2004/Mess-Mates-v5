# MessMates v5 Deployment Guide

## 🚀 Vercel Deployment

### Prerequisites
1. GitHub repository: `https://github.com/Meghraj2004/Mess-Mates-v5.git`
2. Firebase project with Firestore enabled
3. Vercel account

### Step 1: Connect to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import from GitHub: `Meghraj2004/Mess-Mates-v5`
4. Select the repository

### Step 2: Configure Environment Variables
In Vercel project settings, add these environment variables:

```
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_APP_NAME=MessMates v5
VITE_APP_VERSION=5.0.0
VITE_ENVIRONMENT=production
```

### Step 3: Build Settings
Vercel should automatically detect the settings, but verify:
- **Framework Preset**: Vite
- **Root Directory**: `./`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### Step 4: Deploy
1. Click "Deploy"
2. Wait for the build to complete
3. Your app will be live at `https://your-project-name.vercel.app`

## 🔧 Firebase Configuration

### Firestore Security Rules
The project includes updated `firestore.rules` that allow:
- Admin users to create notifications for all users
- Real-time data synchronization
- Secure user authentication

### Firebase Hosting (Alternative)
If you prefer Firebase hosting:
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

## 📱 Features Included in v5

### Admin Features
- ✅ User management and notifications
- ✅ Payment tracking and QR code generation
- ✅ Real-time announcements
- ✅ Leave request management
- ✅ Comprehensive dashboard

### User Features
- ✅ Real-time notifications
- ✅ QR code payments
- ✅ Leave requests
- ✅ Profile management
- ✅ Mobile-responsive design

### Technical Improvements
- ✅ Enhanced Firebase security rules
- ✅ Optimized real-time data sync
- ✅ Better error handling
- ✅ Mobile-first responsive design
- ✅ TypeScript integration

## 🔍 Troubleshooting

### Build Issues
- Ensure all environment variables are set
- Check Firebase configuration
- Verify Node.js version compatibility (16+)

### Runtime Issues
- Check browser console for errors
- Verify Firebase project permissions
- Ensure Firestore rules are deployed

## 📞 Support
For deployment issues, check:
1. Vercel deployment logs
2. Firebase console errors
3. Browser developer tools
4. GitHub Actions (if configured)

---
**MessMates v5** - Smart Mess Management System
Repository: https://github.com/Meghraj2004/Mess-Mates-v5.git