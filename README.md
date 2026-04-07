# HomeAway – Peer Support Platform for International Students (PWA)

HomeAway is a Progressive Web Application (PWA) designed to support international students in the UK by providing a safe and supportive digital space where they can connect, share experiences, and seek help from peers.

This project was developed as part of a final-year Computer Science dissertation at Leeds Beckett University.

---

## Live Demo

🔗 https://homeaway-ab63f.web.app/

> Note: Access is currently restricted to Leeds Beckett University students for testing purposes.

---

##  Project Aim

The aim of HomeAway is to reduce feelings of isolation among international students by enabling peer-to-peer support through a trusted and moderated platform.

---

##  Features

- **University Email Authentication**  
  Only verified students can access the platform.

- **Community Feed**  
  Users can create posts, share experiences, and ask for help.

- **Real-Time Messaging**  
  Private chat between users using Firebase.

- **Notifications System**  
  Users receive updates on interactions such as replies and messages.

- **AI-Based Content Moderation**  
   AI-based content moderation is implemented using Google Perspective API to detect and filter toxic, insulting, or harmful content before it is published.

- **Online Presence Indicator**  
  Shows which users are currently active.

- **Support Section**  
  Includes verified university resources (wellbeing, careers, academic support).

---

##  Progressive Web App (PWA)

HomeAway is implemented as a PWA, meaning:

- Installable on mobile and desktop devices  
- Works across multiple screen sizes  
- Provides an app-like user experience  
- Supports offline capabilities (limited functionality)

---

## Cross-Platform Integration

An Android prototype was also developed using Kotlin and Firebase.

Both the PWA and Android application share the same Firebase backend, enabling real-time synchronisation of post data and a consistent database across platforms.



## Tech Stack

### Frontend
- React
- TypeScript
- Tailwind CSS
- Vite

### Backend (Firebase)
- Firebase Authentication
- Firestore Database
- Firebase Hosting
- Firebase Storage
- Firebase Realtime Database (presence system)

### AI Moderation
- Google Perspective API

---

##  Architecture Overview

The system uses Firebase as a Backend-as-a-Service (BaaS), allowing real-time communication between clients without the need for a custom server.

Firestore is used for storing posts, messages, and notifications, while Realtime Database is used for tracking user presence.

---

## 📌 Project Scope

This project focuses on creating a safe, scalable, and accessible support system for international students.

While the PWA includes full functionality, the Android application was developed as a prototype to demonstrate cross-platform backend integration.


---

##  Author

Shubhechchha Hamal  
BSc (Hons) Computer Science  
Leeds Beckett University  

---

##  Acknowledgements

Special thanks to my supervisor, Dr Pooneh Bagheri Zadeh, for guidance and support throughout this project.