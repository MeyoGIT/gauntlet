import { motion, AnimatePresence } from 'framer-motion'
import { useGauntlet } from '../hooks/useGauntlet'
import SetupMode from '../components/SetupMode'
import ChallengeMode from '../components/ChallengeMode'
import AdminButton from '../components/AdminButton'
import AdminModal from '../components/AdminModal'
import AdminOnly from '../components/AdminOnly'

export default function Home() {
  const {
    session,
    history,
    gameAttempts,
    loading,
    error,
    createSession,
    updateGames,
    startChallenge,
    nextGame,
    failRun,
    adjustTries,
    resetChallenge,
  } = useGauntlet()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-6 h-6 border-2 border-[#2a2a2a] border-t-[#f97316] rounded-full"
        />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-3">
          <p className="text-[#e8e8e8] font-medium">Erreur de connexion</p>
          <p className="text-sm text-[#6b6b6b]">{error}</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <>
        <AdminButton />
        <AdminModal />
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center space-y-6 max-w-sm">
            <div>
              <h1 className="text-3xl font-bold text-[#e8e8e8] tracking-tight">Gauntlet</h1>
              <p className="text-sm text-[#6b6b6b] mt-2">10 jeux. 0 défaite. Le challenge en duo ultime.</p>
            </div>
            <AdminOnly>
              <motion.button
                onClick={createSession}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="w-full py-3 rounded-lg bg-[#f97316] text-white text-sm font-medium hover:bg-[#ea6c10] transition-colors"
              >
                Créer une session
              </motion.button>
            </AdminOnly>
          </div>
        </div>
      </>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <AdminButton />
      <AdminModal />
      <AnimatePresence mode="wait">
        {session.status === 'setup' ? (
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <SetupMode
              games={session.games}
              onGamesChange={updateGames}
              onStart={startChallenge}
            />
          </motion.div>
        ) : (
          <motion.div
            key="challenge"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <ChallengeMode
              session={session}
              history={history}
              gameAttempts={gameAttempts}
              onNextGame={nextGame}
              onFailRun={failRun}
              onAdjustTries={adjustTries}
              onReset={resetChallenge}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
