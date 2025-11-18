import React, { useState, useEffect } from 'react';
import { Lightbulb, RotateCcw, Trophy, Circle } from 'lucide-react';

const COLORS = [
  { name: 'red', hex: '#EF4444' },
  { name: 'blue', hex: '#3B82F6' },
  { name: 'green', hex: '#10B981' },
  { name: 'yellow', hex: '#F59E0B' },
  { name: 'purple', hex: '#A855F7' },
  { name: 'pink', hex: '#EC4899' },
  { name: 'orange', hex: '#F97316' },
  { name: 'white', hex: '#F3F4F6' }
];

const PEGS = 5;
const MAX_GUESSES = 12;

export default function MastermindGame() {
  const [secret, setSecret] = useState([]);
  const [currentGuess, setCurrentGuess] = useState(Array(PEGS).fill(null));
  const [guessHistory, setGuessHistory] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [showSecret, setShowSecret] = useState(false);


  const navMap = [
    Array.from({ length: PEGS }, () => React.createRef()),
    [React.createRef(), React.createRef()],
    [React.createRef(), React.createRef(), React.createRef(), React.createRef()],
    [React.createRef(), React.createRef(), React.createRef(), React.createRef()],
    [React.createRef()]
  ];

  const handleArrowNav = (e, row, col) => {
    const move = (r, c) => {
      const target = navMap[r]?.[c];
      if (target?.current) target.current.focus();
    };

    if (e.key === "ArrowRight" && navMap[row][col + 1]) {
      move(row, col + 1);
    }
    if (e.key === "ArrowLeft" && navMap[row][col - 1]) {
      move(row, col - 1);
    }
    if (e.key === "ArrowDown" && navMap[row + 1]) {
      const nextRow = row + 1;
      const nextCol = Math.min(col, navMap[nextRow].length - 1);
      move(nextRow, nextCol);
    }
    if (e.key === "ArrowUp" && navMap[row - 1]) {
      const prevRow = row - 1;
      const prevCol = Math.min(col, navMap[prevRow].length - 1);
      move(prevRow, prevCol);
    }

    // ENTER activates button
    if (e.key === "Enter") {
      e.preventDefault();
      e.target.click();
    }
  };


  useEffect(() => {
    initGame();
  }, []);

  const initGame = () => {
    const newSecret = Array(PEGS).fill(0).map(() =>
      Math.floor(Math.random() * COLORS.length)
    );
    setSecret(newSecret);
    setCurrentGuess(Array(PEGS).fill(null));
    setGuessHistory([]);
    setGameOver(false);
    setWon(false);
    setShowSecret(false);
    navMap[2][0].current.focus()
  };

  const evaluateGuess = (guess) => {
    let secretCopy = [...secret];
    let guessCopy = [...guess];
    let exact = 0;
    let colorOnly = 0;

    for (let i = 0; i < PEGS; i++) {
      if (guessCopy[i] === secretCopy[i]) {
        exact++;
        secretCopy[i] = -1;
        guessCopy[i] = -2;
      }
    }

    for (let i = 0; i < PEGS; i++) {
      if (guessCopy[i] >= 0) {
        const idx = secretCopy.indexOf(guessCopy[i]);
        if (idx !== -1) {
          colorOnly++;
          secretCopy[idx] = -1;
        }
      }
    }

    return { exact, colorOnly };
  };

  const submitGuess = () => {
    if (currentGuess.includes(null)) return;

    const feedback = evaluateGuess(currentGuess);
    const newHistory = [...guessHistory, { guess: currentGuess, feedback }];
    setGuessHistory(newHistory);

    if (feedback.exact === PEGS) {
      setGameOver(true);
      setWon(true);
      setShowSecret(true);
    } else if (newHistory.length >= MAX_GUESSES) {
      setGameOver(true);
      setShowSecret(true);
    }

    setCurrentGuess(Array(PEGS).fill(null));
  };

  const selectColor = (colorIdx) => {
    if (gameOver) return;
    const firstEmpty = currentGuess.indexOf(null);
    if (firstEmpty !== -1) {
      const newGuess = [...currentGuess];
      newGuess[firstEmpty] = colorIdx;
      setCurrentGuess(newGuess);
    }
  };

  const clearAllPegs = () => setCurrentGuess(Array(PEGS).fill(null));

  const clearPeg = (idx) => {
    const newGuess = [...currentGuess];
    newGuess[idx] = null;
    setCurrentGuess(newGuess);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 flex items-center justify-center">
      <div className="max-w-md w-full">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Lightbulb className="text-yellow-400" size={32} />
            <h1 className="text-4xl font-bold text-white">Mastermind</h1>
          </div>
          <p className="text-purple-200">Crack the color code!</p>
        </div>

        {/* Secret Display */}
        {showSecret && (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-4 border-2 border-yellow-400">
            <p className="text-center text-white font-semibold mb-2">Secret Code:</p>
            <div className="flex justify-center gap-2">
              {secret.map((colorIdx, i) => (
                <div
                  key={i}
                  className="w-12 h-12 rounded-full shadow-lg border-2 border-white"
                  style={{ backgroundColor: COLORS[colorIdx].hex }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Game Over */}
        {gameOver && (
          <div className={`${won ? 'bg-green-500/20 border-green-400' : 'bg-red-500/20 border-red-400'} backdrop-blur-sm rounded-2xl p-4 mb-4 border-2 text-center`}>
            <Trophy className={`${won ? 'text-green-400' : 'text-red-400'} mx-auto mb-2`} size={40} />
            <p className="text-white text-xl font-bold">
              {won ? `🎉 You won in ${guessHistory.length} guesses!` : '💔 Game Over!'}
            </p>
          </div>
        )}

        {/* Current Guess */}
        {!gameOver && (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-4 border border-white/20">
            <p className="text-center text-white font-semibold mb-3">Your Guess:</p>

            {/* Guess Slots */}
            <div className="flex justify-center gap-3 mb-4">
              {currentGuess.map((colorIdx, i) => (
                <button
                  key={i}
                  ref={navMap[0][i]}
                  tabIndex={0}
                  onKeyDown={(e) => handleArrowNav(e, 0, i)}
                  className="w-14 h-14 rounded-full shadow-lg border-2 border-white/50 flex items-center justify-center transition-all"
                  style={{
                    backgroundColor:
                      colorIdx !== null ? COLORS[colorIdx].hex : "rgba(255,255,255,0.1)"
                  }}
                  onClick={() => clearPeg(i)}
                >
                  {colorIdx === null && <Circle className="text-white/30" size={24} />}
                </button>
              ))}
            </div>

            {/* Clear + Submit */}
            <div className="flex gap-2">
              <button
                ref={navMap[1][0]}
                tabIndex={0}
                onKeyDown={(e) => handleArrowNav(e, 1, 0)}
                onClick={clearAllPegs}
                className="flex-1 bg-red-500/80 hover:bg-red-500 focus:bg-red-500 text-white font-semibold py-2 rounded-xl transition"
              >
                Clear
              </button>

              <button
                ref={navMap[1][1]}
                tabIndex={0}
                onKeyDown={(e) => handleArrowNav(e, 1, 1)}
                onClick={submitGuess}
                className={`
  flex-1 font-semibold py-2 rounded-xl transition
  ${currentGuess.includes(null)
    ? "bg-gray-500/50 cursor-not-allowed text-white/50"
    : "bg-green-500/80 hover:bg-green-500 focus:bg-green-500 text-white"
  }
`}
              >
                Submit
              </button>
            </div>
          </div>
        )}

        {/* Color Palette */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-4 border border-white/20">
          <p className="text-center text-white font-semibold mb-3">Select Colors:</p>

          {/* Palette Row 1 */}
          <div className="grid grid-cols-4 gap-3 mb-3">
            {COLORS.slice(0, 4).map((color, idx) => (
              <button
                key={idx}
                ref={navMap[2][idx]}
                tabIndex={0}
                onKeyDown={(e) => handleArrowNav(e, 2, idx)}
                onClick={() => selectColor(idx)}
                disabled={gameOver}
                className="w-full aspect-square rounded-full shadow-lg border-2 border-white hover:scale-110 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: color.hex }}
              />
            ))}
          </div>

          {/* Palette Row 2 */}
          <div className="grid grid-cols-4 gap-3">
            {COLORS.slice(4, 8).map((color, idx) => (
              <button
                key={idx + 4}
                ref={navMap[3][idx]}
                tabIndex={0}
                onKeyDown={(e) => handleArrowNav(e, 3, idx)}
                onClick={() => selectColor(idx + 4)}
                disabled={gameOver}
                className="w-full aspect-square rounded-full rounded-full shadow-lg border-2 border-white hover:scale-110 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: color.hex }}
              />
            ))}
          </div>
        </div>

        {/* Guess History */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 mb-4 border border-white/20">
          <p className="text-center text-white font-semibold mb-2 text-sm">
            Previous Guesses ({guessHistory.length}/{MAX_GUESSES})
          </p>
          {guessHistory.length === 0 ? (
            <p className="text-center text-white/50 py-4 text-sm">No guesses yet</p>
          ) : (
            <div className="space-y-1.5">
              {[...guessHistory].reverse().map((entry, idx) => (
                <div key={idx} className="bg-white/5 rounded-lg p-2 flex items-center justify-between">
                  <div className="flex gap-1.5">
                    {entry.guess.map((colorIdx, i) => (
                      <div
                        key={i}
                        className="w-6 h-6 rounded-full border border-white/50"
                        style={{ backgroundColor: COLORS[colorIdx].hex }}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2 items-center text-xs font-bold">
                    <span className="text-green-400">● {entry.feedback.exact}</span>
                    <span className="text-yellow-400">○ {entry.feedback.colorOnly}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* New Game */}
        <button
          ref={navMap[4][0]}
          tabIndex={0}
          onKeyDown={(e) => handleArrowNav(e, 4, 0)}
          onClick={initGame}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 transition"
        >
          <RotateCcw size={20} />
          New Game
        </button>

        {/* Instructions */}
        <div className="mt-4 bg-white/5 backdrop-blur-sm rounded-xl p-4 text-white/70 text-sm">
          <p className="font-semibold mb-2">How to Play:</p>
          <ul className="space-y-1 text-xs">
            <li>• Guess the secret 5-color code</li>
            <li>• <span className="text-green-400 font-bold">● Green dots</span> = correct color & position</li>
            <li>• <span className="text-yellow-400 font-bold">○ Yellow dots</span> = correct color, wrong position</li>
            <li>• You have {MAX_GUESSES} attempts to crack the code!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}