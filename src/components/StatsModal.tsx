import { useMemo } from 'react'
import type { ReactNode, CSSProperties } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatDuration } from '../hooks/useTimer'
import { computeGameStats, computeGlobalStats, computeSuperlatives } from '../lib/stats'
import type { GameStats } from '../lib/stats'
import type { GauntletSession, RunHistory, GameAttempt, Game } from '../types'

interface Props {
  open: boolean
  onClose: () => void
  session: GauntletSession
  history: RunHistory[]
  gameAttempts: GameAttempt[]
}

const ORANGE = '#f97316'
const EMERALD = '#34d399'
const RED = '#f87171'
const AMBER = '#fbbf24'
const BLUE = '#60a5fa'
const PURPLE = '#a78bfa'

export default function StatsModal({ open, onClose, session, history, gameAttempts }: Props) {
  const gameStats = useMemo(() => computeGameStats(session.games, gameAttempts), [session.games, gameAttempts])
  const global = useMemo(() => computeGlobalStats(session, history, gameAttempts), [session, history, gameAttempts])
  const records = useMemo(() => computeSuperlatives(gameStats), [gameStats])

  const hasData = gameAttempts.length > 0

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            onClick={e => e.stopPropagation()}
            className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl w-full max-w-5xl max-h-[88vh] flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a2a] shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${ORANGE}1a`, color: ORANGE }}>
                  <IconChartBar className="w-4 h-4" />
                </div>
                <p className="text-sm font-semibold text-[#e8e8e8]">Statistiques</p>
              </div>
              <button onClick={onClose} className="text-[#6b6b6b] hover:text-[#e8e8e8] transition-colors">
                <IconClose className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto px-6 py-6 space-y-8">
              {!hasData ? (
                <div className="text-center py-16 space-y-3">
                  <div className="w-12 h-12 rounded-xl mx-auto flex items-center justify-center" style={{ background: `${ORANGE}1a`, color: ORANGE }}>
                    <IconChartBar className="w-5 h-5" />
                  </div>
                  <p className="text-sm text-[#e8e8e8] font-medium">Pas encore de statistiques</p>
                  <p className="text-xs text-[#6b6b6b]">Bats ou perds un jeu pour voir les stats apparaître ici.</p>
                </div>
              ) : (
                <>
                  <Section title="Vue d'ensemble">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                      <StatTile icon={<IconRepeat className="w-4 h-4" />} accent={BLUE} label="Tentatives" value={String(global.totalRuns)} />
                      <StatTile icon={<IconXCircle className="w-4 h-4" />} accent={RED} label="Défaites" value={String(global.totalLosses)} />
                      <StatTile icon={<IconTrophy className="w-4 h-4" />} accent={ORANGE} label="Meilleure run" value={`${global.bestRun}/${session.games.length}`} />
                      <StatTile icon={<IconTrendDown className="w-4 h-4" />} accent={RED} label="Pire run" value={global.worstRun !== null ? `${global.worstRun}/${session.games.length}` : '—'} />
                      <StatTile icon={<IconChartBar className="w-4 h-4" />} accent={BLUE} label="Progression moy." value={global.avgGamesPerRun !== null ? `${global.avgGamesPerRun.toFixed(1)}/${session.games.length}` : '—'} />
                      <StatTile icon={<IconCheckBadge className="w-4 h-4" />} accent={EMERALD} label="Réussite / jeu" value={global.globalWinRate !== null ? `${Math.round(global.globalWinRate * 100)}%` : '—'} />
                      <StatTile icon={<IconClock className="w-4 h-4" />} accent={AMBER} label="Temps de jeu" value={formatDuration(global.totalPlayTime)} />
                      <StatTile icon={<IconClock className="w-4 h-4" />} accent={AMBER} label="Run moyenne" value={global.avgRunDuration !== null ? formatDuration(Math.round(global.avgRunDuration)) : '—'} />
                      <StatTile icon={<IconHourglass className="w-4 h-4" />} accent={AMBER} label="Run la + longue" value={global.longestRunDuration !== null ? formatDuration(global.longestRunDuration) : '—'} />
                      <StatTile icon={<IconBolt className="w-4 h-4" />} accent={PURPLE} label="Run la + rapide" value={global.shortestRunDuration !== null ? formatDuration(global.shortestRunDuration) : '—'} />
                    </div>
                  </Section>

                  <Section title="Records">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {records.mostTime && (
                        <RecordCard icon={<IconClock className="w-4 h-4" />} accent={AMBER} label="Le plus chronophage" game={records.mostTime.game} valueLabel={formatDuration(records.mostTime.value)} />
                      )}
                      {records.mostAttempts && (
                        <RecordCard icon={<IconRepeat className="w-4 h-4" />} accent={BLUE} label="Le plus rejoué" game={records.mostAttempts.game} valueLabel={`${records.mostAttempts.value}×`} />
                      )}
                      {records.mostLosses && (
                        <RecordCard icon={<IconXCircle className="w-4 h-4" />} accent={RED} label="Le plus de défaites" game={records.mostLosses.game} valueLabel={`${records.mostLosses.value} défaite${records.mostLosses.value !== 1 ? 's' : ''}`} />
                      )}
                      {records.bestWinRate && (
                        <RecordCard icon={<IconCheckBadge className="w-4 h-4" />} accent={EMERALD} label="Le mieux maîtrisé" game={records.bestWinRate.game} valueLabel={`${Math.round(records.bestWinRate.value * 100)}%`} />
                      )}
                      {records.worstWinRate && (
                        <RecordCard icon={<IconFire className="w-4 h-4" />} accent={RED} label="La bête noire" game={records.worstWinRate.game} valueLabel={`${Math.round(records.worstWinRate.value * 100)}%`} />
                      )}
                      {records.fastestClear && (
                        <RecordCard icon={<IconBolt className="w-4 h-4" />} accent={PURPLE} label="Clear le plus rapide" game={records.fastestClear.game} valueLabel={formatDuration(records.fastestClear.value)} />
                      )}
                      {records.slowestAttempt && (
                        <RecordCard icon={<IconHourglass className="w-4 h-4" />} accent={AMBER} label="Tentative la plus longue" game={records.slowestAttempt.game} valueLabel={formatDuration(records.slowestAttempt.value)} />
                      )}
                    </div>
                    {records.flawless.length > 0 && (
                      <div className="mt-3 flex items-center gap-2 flex-wrap rounded-lg border border-[#2a2a2a] bg-[#141414] px-3 py-2.5">
                        <IconTrophy className="w-3.5 h-3.5 shrink-0" style={{ color: AMBER }} />
                        <span className="text-xs text-[#6b6b6b]">Battu{records.flawless.length > 1 ? 's' : ''} du premier coup :</span>
                        <span className="text-xs text-[#e8e8e8] font-medium">
                          {records.flawless.map(g => g.name).join(', ')}
                        </span>
                      </div>
                    )}
                  </Section>

                  <Section title="Détail par jeu">
                    <div className="space-y-2">
                      {gameStats.map((gs, i) => (
                        <GameStatRow key={gs.game.rawg_id} stats={gs} index={i} />
                      ))}
                    </div>
                  </Section>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <p className="text-xs font-semibold text-[#6b6b6b] uppercase tracking-wider mb-3">{title}</p>
      {children}
    </section>
  )
}

function StatTile({ icon, label, value, accent }: { icon: ReactNode; label: string; value: string; accent: string }) {
  return (
    <div className="rounded-lg border border-[#2a2a2a] bg-[#141414] p-3 flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${accent}1a`, color: accent }}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-[#6b6b6b] uppercase tracking-wide truncate">{label}</p>
        <p className="text-base font-semibold text-[#e8e8e8] tabular-nums truncate">{value}</p>
      </div>
    </div>
  )
}

function RecordCard({ icon, label, accent, game, valueLabel }: { icon: ReactNode; label: string; accent: string; game: Game; valueLabel: string }) {
  return (
    <div className="rounded-lg border border-[#2a2a2a] bg-[#141414] p-3 flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${accent}1a`, color: accent }}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] text-[#6b6b6b] uppercase tracking-wide truncate">{label}</p>
        <div className="flex items-center gap-1.5 mt-0.5 min-w-0">
          {game.cover_url ? (
            <img src={game.cover_url} alt="" className="w-5 h-5 rounded object-cover shrink-0" />
          ) : (
            <div className="w-5 h-5 rounded bg-[#2a2a2a] shrink-0" />
          )}
          <p className="text-sm font-semibold text-[#e8e8e8] truncate">{game.name}</p>
        </div>
      </div>
      <p className="text-sm font-bold shrink-0 tabular-nums" style={{ color: accent }}>{valueLabel}</p>
    </div>
  )
}

function GameStatRow({ stats, index }: { stats: GameStats; index: number }) {
  const { game, attempts, wins, losses, winRate, totalDuration, fastestClear } = stats
  const rateColor = winRate === null ? '#6b6b6b' : winRate >= 0.66 ? EMERALD : winRate >= 0.34 ? AMBER : RED

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-lg border border-[#2a2a2a] bg-[#141414] p-3">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <span className="text-xs text-[#6b6b6b] tabular-nums w-4 shrink-0 text-center">{index + 1}</span>
        {game.cover_url ? (
          <img src={game.cover_url} alt="" className="w-10 h-10 rounded-md object-cover shrink-0" />
        ) : (
          <div className="w-10 h-10 rounded-md bg-[#2a2a2a] shrink-0" />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-[#e8e8e8] truncate">{game.name}</p>
          {attempts > 0 ? (
            <div className="flex items-center gap-2 mt-1.5">
              <div className="h-1 rounded-full bg-[#2a2a2a] overflow-hidden w-full max-w-[160px]">
                <div className="h-full rounded-full transition-all" style={{ width: `${(winRate ?? 0) * 100}%`, background: rateColor }} />
              </div>
              <span className="text-xs font-semibold tabular-nums shrink-0" style={{ color: rateColor }}>
                {Math.round((winRate ?? 0) * 100)}%
              </span>
            </div>
          ) : (
            <p className="text-xs text-[#6b6b6b] mt-0.5">Pas encore joué</p>
          )}
        </div>
      </div>

      {attempts > 0 && (
        <div className="flex items-center gap-4 flex-wrap pl-7 sm:pl-0 shrink-0 text-xs">
          <Metric icon={<IconRepeat className="w-3.5 h-3.5" />} value={attempts} title="Tentatives" />
          <Metric icon={<IconCheck className="w-3.5 h-3.5" />} value={wins} title="Battu" color={EMERALD} />
          <Metric icon={<IconXCircle className="w-3.5 h-3.5" />} value={losses} title="Perdu" color={RED} />
          <Metric icon={<IconClock className="w-3.5 h-3.5" />} value={formatDuration(totalDuration)} title="Temps total" mono />
          {fastestClear !== null && (
            <Metric icon={<IconBolt className="w-3.5 h-3.5" />} value={formatDuration(fastestClear)} title="Clear le plus rapide" mono />
          )}
        </div>
      )}
    </div>
  )
}

function Metric({ icon, value, title, color, mono }: { icon: ReactNode; value: string | number; title: string; color?: string; mono?: boolean }) {
  return (
    <span className="flex items-center gap-1" title={title} style={{ color: color ?? '#9ca3af' }}>
      {icon}
      <span className={`font-medium ${mono ? 'tabular-nums' : ''}`}>{value}</span>
    </span>
  )
}

function IconClose({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12" />
    </svg>
  )
}

function IconChartBar({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.5h3.75v6.75H3v-6.75zm7.125-4.5h3.75v11.25h-3.75V9zm7.125-5.25H21v16.5h-3.75V3.75z" />
    </svg>
  )
}

function IconRepeat({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  )
}

function IconXCircle({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function IconCheck({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}

function IconTrophy({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21h7.5m-7.5 0a3 3 0 003-3v-1.5m4.5 4.5a3 3 0 01-3-3v-1.5m0 0a6.75 6.75 0 006.75-6.75V4.5H5.25v3.75a6.75 6.75 0 006.75 6.75zM5.25 4.5H3v1.5a2.25 2.25 0 002.25 2.25M18.75 4.5H21v1.5a2.25 2.25 0 01-2.25 2.25" />
    </svg>
  )
}

function IconTrendDown({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898m0 0l3.182-5.511m-3.182 5.51l-5.511-3.181" />
    </svg>
  )
}

function IconCheckBadge({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
    </svg>
  )
}

function IconFire({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.468 5.99 5.99 0 00-1.925 3.547 5.975 5.975 0 01-2.133-1.001A3.75 3.75 0 0012 18z" />
    </svg>
  )
}

function IconBolt({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  )
}

function IconClock({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function IconHourglass({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3h10.5M6.75 21h10.5M8.25 3c0 4 2.5 5 3.75 6 1.25-1 3.75-2 3.75-6M8.25 21c0-4 2.5-5 3.75-6 1.25 1 3.75 2 3.75 6" />
    </svg>
  )
}
