# Wrrdle

This is a simple Wordle clone built using React, Next.js, and Tailwind CSS.  It fetches a list of words from a local text file and allows the user to guess a 5-letter word within six attempts. It also fetches the definitions.

### **Website: https://wrrdle.vercel.app**

## Features

*   **Word Guessing:**  Users can input 5-letter words as guesses.
*   **Feedback:**  Provides color-coded feedback on each guess:
    *   **Green:**  The letter is in the correct position.
    *   **Orange:** The letter is in the word but in the wrong position.
    *   **Gray:** The letter is not in the word.
*   **Keyboard Input:**  Supports both on-screen keyboard and physical keyboard input.
*   **Limited Attempts:** Users have six attempts to guess the word.
*   **Word List:** Reads a list of valid words from `/public/files/words.txt`. This file should contain comma-separated 5-letter words (e.g., "apple,baker,cable,dough,eager").  No newlines are needed between words.
*   **Random Word Selection:** Selects a random word from the word list at the start of each game.
*   **New Game Button:** Allows the user to start a new game with a different random word.
*   **Definitions:** Displays the definitions of the word after the game ends (win or lose), fetched from the Dictionary API.
*   **Responsive Design:**  Adjusts the layout for mobile and desktop screens.
*   **Loading State:** Displays a loading spinner while fetching words and initializing the game.
*   **Used Letters:** Keeps track of what letters have been entered and their relevant colors.
*   **API Route:** includes an API route located at `/api/getWords` for fetching word data.

## Project Structure

*   **`index.js`:** The main component that handles the game logic and UI.  It uses `useState` and `useEffect` extensively to manage game state.
*   **`getWords.js`:**  An API route (`/api/getWords`) that reads the word list and returns it as a JSON array.

## Functions Breakdown (index.js)

*   **`Home()`:**  The main functional component that renders the game.

*   **`getDefinition(wrd)`:** Fetches the definition of a given word (`wrd`) from the Dictionary API (`https://api.dictionaryapi.dev/api/v2/entries/en/${wrd}`). Returns a Promise that resolves to the API response data.

*   **`getAllDefinitions(data)`:** Extracts all definitions from the API response data (which can contain multiple meanings and definitions).  Returns a Promise that resolves to an array of definition strings.

*   **`startGame(validWords)`:** Initializes a new game.
    *   Selects a random word from `validWords`.
    *   Fetches and sets the definitions for the selected word.
    *   Initializes the game state (guesses, colors, alphabet colors, etc.).
    *   Removes the chosen word from those that can still be picked.

*   **`changeGuess(value)`:** Updates the current guess based on user input.  Handles length limits and input validation (only letters allowed).

*   **`submitGuess()`:**  Validates the current guess against the word list.  Calculates and updates the color feedback for each letter in the guess.  Checks if the guess is correct and updates the game state accordingly.

*   **`validateLetter(letter, code = null)`:**  Processes individual letter inputs, handling "Enter" (submit), "Backspace", and letter keys. Calls either `submitGuess()` or `changeGuess()` as needed.

*   **`typeMessage(e)`:**  A `useCallback` hook that handles keyboard events (`keydown`).  Calls `validateLetter` to process the key press.  Prevents default behavior for keys like Ctrl, Shift, Alt, Meta.

*   **`onClick(e)`:** Handles clicks on the on-screen keyboard. Calls `validateLetter` with the clicked letter.

*   **`useEffect` Hooks:**
    *   The first `useEffect` fetches the word list from `/api/getWords` when the component mounts and starts the game.
    *   The second `useEffect` adds and removes a window resize listener to update the `mobile` state.
    *   The third `useEffect` adds and removes the `keydown` event listener for keyboard input.

## Setup and Running

1.  **Install Dependencies:**
    Make sure you have Node.js and npm (or yarn) installed. Then, run:

    ```bash
    npm install
    ```

2.  **Run the Development Server:**

    ```bash
    npm run dev
    ```

3.  **Open in Browser:**
    The application will be running at `http://localhost:3000`.

## Potential Improvements

*   **Error Handling:** Add more robust error handling (e.g., for API fetch failures, invalid word list format).
*   **Word List:** Consider using a larger, more comprehensive word list.
*   **Game Difficulty:**  Implement difficulty levels (e.g., by varying the word length or using more obscure words).
*   **Statistics:** Track user statistics (e.g., win rate, guess distribution).
*   **Accessibility:** Improve accessibility (e.g., ARIA attributes, keyboard navigation).
*   **Testing:** Add unit and integration tests.
*   **Caching:** Cache fetched definitions to avoid repeated API calls for the same word.
