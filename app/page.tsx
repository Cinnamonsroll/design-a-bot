"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useLocalStorage from "@/app/hooks/useLocalStorage";
import { gameData } from "@/app/constants";

export default function Component() {
  const [selectedGame, setSelectedGame] = useLocalStorage<
    { year: number; name: string } | null
  >("selectedGame", null);
  const [selectedTeam, setSelectedTeam] = useLocalStorage<number | null>(
    "selectedTeam",
    null
  );
  const [availableGames, setAvailableGames] = useLocalStorage<
    { year: number; name: string }[]
  >("availableGames", [...gameData]);
  const [availableTeams, setAvailableTeams] = useLocalStorage<number[]>(
    "availableTeams",
    Array.from({ length: 20 }, (_, i) => i + 1) // Default to 20 teams
  );
  const [isSpinningGame, setIsSpinningGame] = useState(false);
  const [isSpinningTeam, setIsSpinningTeam] = useState(false);
  const [spinningTeam, setSpinningTeam] = useState<number | null>(null); // NEW
  const [selections, setSelections] = useLocalStorage<
    Array<{ game: { year: number; name: string }; team: number }>
  >("selections", []);
  const [totalTeams, setTotalTeams] = useLocalStorage<number>("totalTeams", 20);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!hasMounted) return;
    if (availableGames.length === 0) {
      setAvailableGames([...gameData]);
    }
    if (availableTeams.length === 0) {
      setAvailableTeams(Array.from({ length: totalTeams }, (_, i) => i + 1));
    }
  }, [hasMounted, availableGames.length, availableTeams.length, totalTeams, setAvailableGames, setAvailableTeams]);

  const selectRandomGame = () => {
    if (availableGames.length === 0) return;
    setIsSpinningGame(true);
    setTimeout(() => {
      const randomIndex = ~~(Math.random() * availableGames.length);
      const game = availableGames[randomIndex];
      setSelectedGame(game);
      setAvailableGames(availableGames.filter((g) => g.year !== game.year));
      setIsSpinningGame(false);
    }, 2000);
  };

  const selectRandomTeam = () => {
    if (availableTeams.length === 0) return;
    setIsSpinningTeam(true);

    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * availableTeams.length);
      setSpinningTeam(availableTeams[randomIndex]);
    }, 100);

    setTimeout(() => {
      clearInterval(interval);
      const randomIndex = Math.floor(Math.random() * availableTeams.length);
      const team = availableTeams[randomIndex];
      setAvailableTeams(availableTeams.filter((t) => t !== team));
      setIsSpinningTeam(false);
      setSelectedTeam(team);
      setSpinningTeam(team); // Ensure displayed number matches selected team
      if (selectedGame) {
        setSelections([...selections, { game: selectedGame, team }]);
      }
    }, 2000);
  };

  useEffect(() => {
    if (!isSpinningTeam) {
      setSpinningTeam(null); // Clear spinning number when not spinning
    }
  }, [isSpinningTeam]);

  useEffect(() => {
    if (isSpinningGame) {
      const interval = setInterval(() => {
        setSelectedGame(
          availableGames[Math.floor(Math.random() * availableGames.length)]
        );
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isSpinningGame, availableGames]);

  const handleTotalTeamsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setTotalTeams(isNaN(value) || value < 1 ? 1 : value);
    setAvailableTeams(Array.from({ length: isNaN(value) || value < 1 ? 1 : value }, (_, i) => i + 1));
  };

  if (!hasMounted) {
    return null;
  }
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-start p-4 relative text-black">
      <div className="absolute top-4 right-4 flex items-center gap-4">
        <div>
          <label htmlFor="totalTeams" className="block text-sm font-medium text-gray-700 mb-1">
            Total Teams:
          </label>
          <input
            type="number"
            id="totalTeams"
            value={totalTeams}
            onChange={handleTotalTeamsChange}
            className="w-24 px-2 py-1 text-black text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="1"
          />
        </div>
      </div>

      <h1 className="text-4xl font-bold mb-8 text-blue-600">FRC Game and Team Selector</h1>
      
      <div className="flex flex-col md:flex-row gap-8 mb-8 w-full max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg p-6 flex-1">
          <h2 className="text-2xl font-semibold mb-4 text-center">Random Game Selector</h2>
          <div className="flex flex-col items-center justify-center mb-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedGame?.year || 'empty'}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                className="text-6xl font-bold text-blue-500 mb-2"
              >
                {selectedGame?.year || '????'}
              </motion.div>
            </AnimatePresence>
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedGame?.name || 'empty'}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                className="text-2xl font-semibold text-blue-400 text-center"
              >
                {selectedGame?.name || 'Game Name'}
              </motion.div>
            </AnimatePresence>
          </div>
          <button
            onClick={selectRandomGame}
            disabled={isSpinningGame || availableGames.length === 0}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300 disabled:bg-gray-400"
          >
            {isSpinningGame ? 'Selecting...' : 'Get Random Game'}
          </button>
          <p className="mt-2 text-sm text-gray-600 text-center">
            {availableGames.length} games remaining
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 flex-1">
          <h2 className="text-2xl font-semibold mb-4 text-center">Random Team Selector</h2>
          <div className="flex flex-col items-center justify-center mb-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={spinningTeam || selectedTeam || 'empty'}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                className="text-6xl font-bold text-green-500 mb-2"
              >
                {spinningTeam || selectedTeam || '????'}
              </motion.div>
            </AnimatePresence>
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedGame?.name || 'empty'}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                className="text-2xl font-semibold text-green-400 text-center"
              >
                {selectedGame?.name || 'Select a game first'}
              </motion.div>
            </AnimatePresence>
          </div>
          <button
            onClick={selectRandomTeam}
            disabled={isSpinningTeam || !selectedGame}
            className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition duration-300 disabled:bg-gray-400"
          >
            {isSpinningTeam ? 'Selecting...' : 'Get Random Team'}
          </button>
        </div>
      </div>


      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl">
        <h2 className="text-2xl font-semibold mb-4 text-center">Selected Games and Teams</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border-b">Year</th>
                <th className="py-2 px-4 border-b">Game Name</th>
                <th className="py-2 px-4 border-b">Team Number</th>
              </tr>
            </thead>
            <tbody>
              {selections.map((selection, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                  <td className="py-2 px-4 border-b">{selection.game.year}</td>
                  <td className="py-2 px-4 border-b">{selection.game.name}</td>
                  <td className="py-2 px-4 border-b">{selection.team}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {selections.length === 0 && (
          <p className="text-center text-gray-500 mt-4">No selections yet</p>
        )}
      </div>
    </div>
  )
}
