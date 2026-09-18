// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  // This 'content' array is CRUCIAL for both Tailwind's build and IntelliSense
  // It tells Tailwind where to scan for your utility classes
  content: [
    // Adjust these paths based on where your React components are located
    "./src/**/*.{js,jsx,ts,tsx}", // Common path for Create React App projects
    "./public/index.html",       // If you use Tailwind classes in index.html
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}


