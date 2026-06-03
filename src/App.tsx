import React, { useEffect, useRef, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import ArcadeCabinet from './components/ArcadeCabinet';
import Playfield from './components/Playfield';
import NextPiecePanel from './components/NextPiecePanel';
import Scoreboard from './components/Scoreboard';
import ControlLegend from './components/ControlLegend';
import TouchControls from './components/TouchControls';
import StartScreen from './components/StartScreen';
import GameOverModal from './components/GameOverModal';
import PauseOverlay from './components/PauseOverlay';
import Leaderboard from './components/Leaderboard';
import SoundToggle from './components/SoundToggle';
import { useTetris } from './hooks/useTetris';
import { useKeyboardControls } from './hooks/useKeyboardControls';
import { useHighScores } from './hooks/useHighScores';
import { useIsTouch } from './hooks/useIsTouch';

export default function App() {
  const game = useTetris();
  const isTouch = useIsTouch();
  const highScores = useHighScores();

  const [shakeKey, setShakeKey] = useState(0);
  const [levelUpKey, setLevelUpKey] = useState(0);
  const lastClearId = useRef(0);
  const prevLevel = useRef(game.level);

  // Screen-shake + flash on line clear
  useEffect(() => {
    if (game.clearEvent && game.clearEvent.id !== lastClearId.current) {
      lastClearId.current = game.clearEvent.id;
      if (game.clearEvent.lines >= 1) {
        setShakeKey((k) => k + 1);
      }
    }
  }, [game.clearEvent]);

  // Level-up border pulse
  useEffect(() => {
    if (game.level > prevLevel.current) {
      prevLevel.current = game.level;
      setLevelUpKey((k) => k + 1);
    } else {
      prevLevel.current = game.level;
    }
  }, [game.level]);

  // Keyboard controls
  useKeyboardControls({
    enabled: game.status === 'playing' || game.status === 'paused',
    actions: {
      moveLeft: game.moveLeft,
      moveRight: game.moveRight,
      rotateCW: game.rotateCW,
      rotateCCW: game.rotateCCW,
      softDrop: game.softDrop,
      hardDrop: game.hardDrop,
      togglePause: game.togglePause,
      toggleMute: game.toggleMute,
    },
  });

  // Global ENTER/SPACE to start from attract mode
  useEffect(() => {
    if (game.status !== 'attract') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        game.start();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [game.status, game.start]);

  const showStart = game.status === 'attract';
  const showPause = game.status === 'paused';
  const showGameOver = game.status === 'over';

  return (
    <div className="min-h-screen w-full overflow-x-hidden" style={{ backgroundColor: 'var(--gt-bg)' }}>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: 'var(--gt-surface)',
            color: 'var(--gt-text)',
            border: '4px solid var(--gt-accent)',
            borderRadius: 0,
            fontFamily: 'VT323, monospace',
            fontSize: '18px',
          },
        }}
      />

      <ArcadeCabinet shakeKey={shakeKey} levelUpKey={levelUpKey}>
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 items-stretch justify-center">
          {/* LEFT panel: NEXT + sound (desktop) */}
          <aside className="hidden lg:flex flex-col gap-3 w-44 order-1">
            <NextPiecePanel next={game.next} />
            <SoundToggle muted={game.muted} onToggle={game.toggleMute} />
            <ControlLegend />
          </aside>

          {/* CENTER: playfield well */}
          <main className="relative flex-shrink-0 mx-auto order-2 w-full max-w-[320px] sm:max-w-[360px]">
            <div className="relative">
              <Playfield
                board={game.board}
                active={game.active}
                ghost={game.ghost}
                status={game.status}
                flashRows={game.flashRows}
              />
              {showStart && (
                <StartScreen
                  hi={highScores.hi}
                  topScores={highScores.scores}
                  onStart={game.start}
                />
              )}
              {showPause && <PauseOverlay />}
            </div>

            {/* Mobile-only: NEXT + score row below well */}
            <div className="lg:hidden mt-3 grid grid-cols-2 gap-3 items-start">
              <div className="flex flex-col gap-3">
                <NextPiecePanel next={game.next} />
                <SoundToggle muted={game.muted} onToggle={game.toggleMute} />
              </div>
              <Scoreboard
                score={game.score}
                level={game.level}
                lines={game.lines}
                hi={highScores.hi}
                levelUpKey={levelUpKey}
              />
            </div>

            {/* Touch controls below well */}
            {isTouch && (game.status === 'playing' || game.status === 'paused') && (
              <TouchControls
                onLeft={game.moveLeft}
                onRight={game.moveRight}
                onSoftDrop={game.softDrop}
                onRotate={game.rotateCW}
                onHardDrop={game.hardDrop}
                onPause={game.togglePause}
              />
            )}
          </main>

          {/* RIGHT panel: scoreboard + leaderboard (desktop) */}
          <aside className="hidden lg:flex flex-col gap-3 w-64 order-3">
            <Scoreboard
              score={game.score}
              level={game.level}
              lines={game.lines}
              hi={highScores.hi}
              levelUpKey={levelUpKey}
            />
            <Leaderboard
              scores={highScores.scores}
              status={highScores.status}
              onRefresh={highScores.refresh}
            />
          </aside>
        </div>

        {/* Mobile leaderboard + controls below everything */}
        <div className="lg:hidden mt-4 flex flex-col gap-3">
          {!isTouch && <ControlLegend />}
          <Leaderboard
            scores={highScores.scores}
            status={highScores.status}
            onRefresh={highScores.refresh}
          />
        </div>
      </ArcadeCabinet>

      <GameOverModal
        open={showGameOver}
        score={game.score}
        level={game.level}
        lines={game.lines}
        onRestart={game.restart}
      />
    </div>
  );
}
