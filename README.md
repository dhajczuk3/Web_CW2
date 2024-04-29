Installing Visual Studio Code
Visual Studio Code (VS Code) is a popular, lightweight code editor that supports a variety of programming languages and technologies. Here’s how you can install it:

Step 1: Download
Go to the Visual Studio Code official website.
Download the version of VS Code suitable for your operating system (Windows, macOS, or Linux).

Step 2: Install
Windows: Run the downloaded installer — this will guide you through the necessary steps to install VS Code on your PC. It’s recommended to check the boxes that add VS Code to your path and create a desktop icon for easy access.
macOS: Open the downloaded .zip file, extract it, and drag the Visual Studio Code application to your Applications folder.
Linux: Depending on your distribution, you can use snap, apt, or yum to install VS Code. For instance, if you’re on Ubuntu, you can install it via the terminal with the following command:
bash
Copy code
sudo snap install --classic code

Step 3: Launch VS Code
Open Visual Studio Code from your applications or search for it in your OS.
Once opened, you can customize your setup by installing extensions for different languages and tools via the Extensions Marketplace, accessible from the sidebar.

Step 4: Configure (Optional)
Customize settings by clicking on the gear icon in the lower left corner and selecting Settings.
You can adjust themes, configure preferences, and install additional extensions as needed.


How to Run the Site

Prerequisites
Ensure you have Node.js and npm installed. You can check if Node.js is installed by running node -v in your terminal. If you need to install these, visit Node.js's official website.

Installation

Clone the repository:
bash
Copy code
git clone https://yourrepositorylink.com/project.git

Navigate to the project directory:
bash

Copy code
cd project

Install dependencies:
bash

Copy code
npm install

Start the server
bash

Copy code
npm start

This command will start the server, typically on http://localhost:3000, unless configured otherwise.


Features Implemented

User Authentication: Secure login and logout, with bcrypt for password hashing and JWT for session management.
User and Admin Roles: Distinct user roles where admins have privileges for managing the system.
Inventory Management: Functionality to add, update, and delete stock items using an embedded NeDB database.
Dynamic Session Handling: Using express-session to manage user sessions effectively across the application.
Message Management: Allows users to send messages which are stored and managed within a local NeDB database.
Error Handling: Middleware to catch and respond to errors and invalid routes.
Security Enhancements: Middleware to verify user authentication tokens for accessing protected routes.