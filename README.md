# 🍽️ MessMates v5 - Smart Hub

<div align="center">
  <img src="assets/Logo.png" alt="MessMates v5 Logo" width="120" height="120">
  
  <h3>Advanced Mess Management System</h3>
  <p>Complete solution for hostel and organizational meal management with real-time notifications, QR attendance, payment processing, and comprehensive admin controls</p>

  ![React](https://img.shields.io/badge/React-18.3.1-blue.svg)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue.svg)
  ![Firebase](https://img.shields.io/badge/Firebase-Latest-orange.svg)
  ![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4.11-green.svg)
  ![Vite](https://img.shields.io/badge/Vite-5.4.10-purple.svg)
  ![Mobile Responsive](https://img.shields.io/badge/Mobile-Responsive-brightgreen.svg)
  ![License](https://img.shields.io/badge/License-MIT-yellow.svg)
  
  ### 🚀 [Live Demo - MessMates v5](https://mess-mates-v5.vercel.app)
  
  <p>✨ <strong>Real-time Updates</strong> | 📱 Mobile-First Design | 🔔 Push Notifications | 💰 Payment Integration</p>
</div>

## 🌟 Features

### 👤 **User Features**
- **📱 QR Code Attendance**: Mark meal attendance by scanning QR codes or uploading QR images
- **📅 Weekly Menu Viewing**: Access updated weekly meal menus
- **💰 Bill Estimation**: Automatic tracking of monthly meal expenses
- **📝 Feedback System**: Submit feedback and complaints easily
- **🏖️ Leave Management**: Request leaves for meal deductions
- **💳 Payment Tracking**: Monitor payment status and history
- **🔔 Real-time Notifications**: Stay updated with important announcements
- **📲 Mobile Optimized**: Responsive design for seamless mobile experience

### 👨‍💼 **Admin Features**
- **👥 User Management**: Add, edit, and remove users
- **📋 Menu Management**: Create and update weekly meal menus
- **📊 Attendance Tracking**: Monitor meal attendance across all users
- **💰 Payment Management**: Track payments and generate reports
- **🔄 QR Code Generation**: Generate and manage QR codes for attendance
- **📈 Analytics Dashboard**: Comprehensive reports and statistics
- **📢 Notifications**: Send announcements to all users
- **🗂️ Data Export**: Export attendance and payment data

## 🚀 Tech Stack

- **Frontend**: React 18.3.1 with TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Backend**: Firebase (Firestore, Authentication)
- **QR Code**: Multiple QR libraries for scanning and generation
- **Charts**: Recharts for data visualization
- **State Management**: React Query (TanStack Query)
- **Build Tool**: Vite
- **Package Manager**: Bun/NPM

## � Mobile Responsive Design

MessMate Smart Hub is built with a **mobile-first approach**, ensuring a seamless experience across all devices:

### Responsive Features
- ✅ **Touch-Friendly**: All interactive elements meet 44x44px minimum touch target
- ✅ **Adaptive Layouts**: Grid systems that adjust from 1 column (mobile) to 5 columns (desktop)
- ✅ **Flexible Typography**: Text sizes automatically scale based on screen size
- ✅ **Smart Navigation**: Dropdown menus on mobile, horizontal tabs on desktop
- ✅ **Optimized Tables**: Traditional tables on desktop, card views on mobile
- ✅ **Responsive Forms**: Stack vertically on mobile, row layout on desktop
- ✅ **Smooth Animations**: Hardware-accelerated transitions for better performance

### Breakpoints
```
xs: 475px   - Small phones
sm: 640px   - Phones landscape / Small tablets
md: 768px   - Tablets
lg: 1024px  - Small laptops
xl: 1280px  - Desktops
2xl: 1536px - Large screens
```

### Documentation
- 📖 [Mobile Responsive Guide](MOBILE_RESPONSIVE_GUIDE.md) - Complete implementation guide
- 🎨 [UI/UX Improvements](UI_UX_IMPROVEMENTS.md) - Design system documentation

## �📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- Bun or NPM package manager
- Firebase project with Firestore and Authentication enabled

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/Meghraj2004/Mess-Mates-v4.git
   cd messmate-smart-hub
   ```

2. **Install dependencies**
   ```bash
   # Using Bun (recommended)
   bun install
   
   # Or using NPM
   npm install
   ```

3. **Firebase Configuration**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Firestore Database and Authentication
   - Add your Firebase config to `src/lib/firebase.ts`
   
   ```typescript
   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-auth-domain",
     projectId: "your-project-id",
     storageBucket: "your-storage-bucket",
     messagingSenderId: "your-sender-id",
     appId: "your-app-id"
   };
   ```

4. **Start the development server**
   ```bash
   # Using Bun
   bun run dev
   
   # Or using NPM
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 🏗️ Project Structure

```
messmate-smart-hub/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── ui/           # shadcn/ui components
│   │   ├── AdminNotifications.tsx
│   │   ├── FeedbackForm.tsx
│   │   ├── QRCodeScanner.tsx
│   │   └── ...
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility libraries
│   │   ├── firebase.ts   # Firebase configuration
│   │   └── utils.ts      # Helper functions
│   ├── pages/            # Page components
│   │   ├── Dashboard.tsx
│   │   ├── AdminDashboard.tsx
│   │   └── ...
│   ├── App.tsx           # Main app component
│   └── main.tsx          # Entry point
├── assets/               # Static assets
├── firebase.rules        # Firestore security rules
└── package.json
```

## 🔧 Configuration

### Admin Setup
To set up admin users, update the `ADMIN_EMAILS` array in `src/pages/Index.tsx`:

```typescript
const ADMIN_EMAILS = [
  'admin1@example.com',
  'admin2@example.com',
  'admin3@example.com'
];
```

### Firebase Rules
Update your Firestore security rules using the provided `firestore.rules` file to ensure proper data security.

## 🎯 Usage

### For Users
1. **Sign up/Login** with your email address
2. **Dashboard Access** - View your personalized dashboard
3. **QR Attendance** - Scan QR codes or upload QR images to mark attendance
4. **Menu Viewing** - Check weekly meal menus
5. **Leave Requests** - Submit leave requests for meal deductions
6. **Feedback** - Provide feedback about meals and services
7. **Payment Tracking** - Monitor your payment status and history

### For Admins
1. **Admin Dashboard** - Access comprehensive management tools
2. **User Management** - Add, edit, or remove users
3. **Menu Management** - Create and update weekly menus
4. **QR Generation** - Generate QR codes for attendance
5. **Reports** - View attendance and payment analytics
6. **Notifications** - Send announcements to users

## 🏃‍♂️ Available Scripts

```bash
# Development
bun run dev          # Start development server
npm run dev

# Build
bun run build        # Build for production
npm run build

# Preview
bun run preview      # Preview production build
npm run preview

# Linting
bun run lint         # Run ESLint
npm run lint

# Type Checking
npm run type-check   # Check TypeScript types
```

## 🌐 Deployment

### Deploy to Vercel (Recommended)

This project is configured for easy deployment to Vercel:

```bash
# Install Vercel CLI (if not already installed)
npm install -g vercel

# Deploy to production
vercel --prod

# Deploy to preview
vercel
```

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md)

### Other Platforms

You can also deploy to:
- **Netlify**: Use the `dist` folder after running `npm run build`
- **GitHub Pages**: Configure with GitHub Actions
- **Firebase Hosting**: Use Firebase CLI
- **AWS S3**: Upload the `dist` folder

**Note**: Remember to configure environment variables for Firebase on your hosting platform.

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/Meghraj2004/Mess-Mates-v4/issues) page
2. Create a new issue if your problem isn't already reported
3. Provide detailed information about the problem

## 🎨 Screenshots

<div align="center">
  <h3>🏠 Landing Page</h3>
  <p><em>Clean and modern interface showcasing key features</em></p>
  
  <h3>📊 User Dashboard</h3>
  <p><em>Personalized dashboard with QR attendance, menu viewing, and payment tracking</em></p>
  
  <h3>👨‍💼 Admin Dashboard</h3>
  <p><em>Comprehensive admin panel for managing users, menus, and generating reports</em></p>
</div>

## 🏆 Team

Developed with ❤️ by the **Megharaj Dandgavhal**

---

<div align="center">
  <p>⭐ Star this repository if you find it helpful!</p>
  <p>🍽️ Happy Mess Management! 🍽️</p>
</div>
