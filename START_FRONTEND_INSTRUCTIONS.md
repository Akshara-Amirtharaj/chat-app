# How to Start the Frontend

## Problem
PowerShell execution policy is preventing npm from running.

## Solutions (Choose ONE of these methods):

### Method 1: Use the Batch File (Easiest)
I've created a `start-frontend.bat` file in the frontend directory.

**Steps:**
1. Open File Explorer
2. Navigate to: `C:\Users\aksha\OneDrive - SSN Trust\Desktop\AKSHARA\COLLEGE\random\CHAT-APP\frontend`
3. Double-click `start-frontend.bat`
4. The frontend will start and open at http://localhost:5173

### Method 2: Use Command Prompt (CMD)
1. Press `Windows + R`
2. Type `cmd` and press Enter
3. Run these commands:
```cmd
cd "C:\Users\aksha\OneDrive - SSN Trust\Desktop\AKSHARA\COLLEGE\random\CHAT-APP\frontend"
npm run dev
```

### Method 3: Enable PowerShell Execution (Permanent Fix)
1. Open PowerShell as Administrator (right-click PowerShell → Run as Administrator)
2. Run:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```
3. Type `Y` to confirm
4. Now you can use npm normally in PowerShell:
```powershell
cd "C:\Users\aksha\OneDrive - SSN Trust\Desktop\AKSHARA\COLLEGE\random\CHAT-APP\frontend"
npm run dev
```

### Method 4: Use Node Directly
1. In PowerShell or Command Prompt, navigate to frontend:
```cmd
cd "C:\Users\aksha\OneDrive - SSN Trust\Desktop\AKSHARA\COLLEGE\random\CHAT-APP\frontend"
```
2. Run vite directly:
```cmd
node_modules\.bin\vite
```

## After Starting
Once the frontend starts, you should see:
```
VITE v7.1.7  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Then open your browser and go to **http://localhost:5173**

## Current Status
- ✅ **Backend**: Running on port 5000
- ⏳ **Frontend**: Needs to be started using one of the methods above

The frontend app will connect to the backend API at http://localhost:5000/api



