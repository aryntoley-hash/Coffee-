import { useEffect, useRef, useState } from 'react'
import { ScanFace, Coffee, Heart, RotateCcw, Sparkles } from 'lucide-react'

const SCAN_LINES = [
  'Измеряю уровень обаяния…',
  'Считаю количество улыбок…',
  'Проверяю чувство юмора…',
  'Найдена ошибка: слишком круто',
  'Система перегружена, держись…',
]

const NO_TEXTS = [
  'Нет',
  'Точно нет?',
  'Подумай ещё',
  'Я угощаю',
  'Ну пожалуйста',
  'Кнопка сломалась',
  'Я стесняюсь, не жми',
  'Ладно, жми «Да»',
]

function getName() {
  try {
    const n = new URLSearchParams(window.location.search).get('name')
    return n ? n.slice(0, 24) : ''
  } catch {
    return ''
  }
}

function Hearts() {
  const items = useRef(
    Array.from({ length: 28 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 2.5,
      duration: 3 + Math.random() * 3,
      size: 18 + Math.random() * 22,
      glyph: ['💖', '☕', '✨', '💜'][i % 4],
    })),
  ).current

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
      {items.map((h) => (
        <span
          key={h.id}
          className="absolute"
          style={{
            left: `${h.left}%`,
            bottom: '-40px',
            fontSize: h.size,
            animation: `rise ${h.duration}s ease-in ${h.delay}s infinite`,
          }}
        >
          {h.glyph}
        </span>
      ))}
    </div>
  )
}

export default function App() {
  const name = getName()
  const [stage, setStage] = useState('start') // start | scan | ask | yes
  const [progress, setProgress] = useState(0)
  const [tries, setTries] = useState(0)
  const [pos, setPos] = useState(null)
  const areaRef = useRef(null)

  useEffect(() => {
    if (stage !== 'scan') return undefined
    setProgress(0)
    const id = setInterval(() => {
      setProgress((p) => {
        const next = Math.min(100, p + 2)
        if (next >= 100) {
          clearInterval(id)
          setTimeout(() => setStage('ask'), 700)
        }
        return next
      })
    }, 90)
    return () => clearInterval(id)
  }, [stage])

  const dodge = (e) => {
    if (e && e.preventDefault) e.preventDefault()
    const area = areaRef.current
    if (!area) return
    const box = area.getBoundingClientRect()
    const w = 150
    const h = 48
    setPos({
      x: Math.max(0, Math.random() * (box.width - w)),
      y: Math.max(0, Math.random() * (box.height - h)),
    })
    setTries((t) => t + 1)
  }

  const reset = () => {
    setStage('start')
    setTries(0)
    setPos(null)
    setProgress(0)
  }

  const lineIndex = Math.min(SCAN_LINES.length - 1, Math.floor(progress / 21))
  const yesScale = Math.min(1.5, 1 + tries * 0.06)
  const noText = NO_TEXTS[Math.min(tries, NO_TEXTS.length - 1)]

  return (
    <main
      className="relative flex min-h-screen items-center justify-center px-4"
      style={{
        paddingTop: 'max(24px, env(safe-area-inset-top))',
        paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
        background:
          'radial-gradient(40rem 24rem at 80% -10%, rgba(168,85,247,.28), transparent 60%), radial-gradient(36rem 22rem at -10% 110%, rgba(236,72,153,.22), transparent 60%), #0b0b12',
      }}
    >
      {stage === 'yes' && <Hearts />}

      <section className="relative z-10 w-full max-w-sm rounded-3xl border border-white/10 bg-white/5 p-6 text-center shadow-2xl backdrop-blur-xl">
        {stage === 'start' && (
          <div className="fade-up flex flex-col items-center gap-5">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-violet-500/20 text-violet-300">
              <ScanFace size={32} />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {name ? `${name}, тебя выбрали` : 'Тебя выбрали'}
            </h1>
            <p className="text-sm leading-relaxed text-white/60">
              Для сверхсекретной проверки. Это займёт пять секунд и ничего не сломает.
            </p>
            <button
              type="button"
              onClick={() => setStage('scan')}
              className="w-full rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-violet-500/30 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              Начать проверку
            </button>
          </div>
        )}

        {stage === 'scan' && (
          <div className="fade-up flex flex-col items-center gap-5">
            <div className="grid h-16 w-16 animate-pulse place-items-center rounded-2xl bg-fuchsia-500/20 text-fuchsia-300">
              <Sparkles size={32} />
            </div>
            <p className="min-h-[3rem] text-lg font-medium">{SCAN_LINES[lineIndex]}</p>
            <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm tabular-nums text-white/50">{progress}%</p>
          </div>
        )}

        {stage === 'ask' && (
          <div className="fade-up flex flex-col items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-amber-400/15 text-amber-300">
              <Coffee size={32} />
            </div>
            <p className="text-xs uppercase tracking-widest text-white/40">Результат проверки</p>
            <h2 className="text-2xl font-semibold leading-snug tracking-tight">
              {name ? `${name}, ты` : 'Ты'} официально классная на 100%
            </h2>
            <p className="text-sm leading-relaxed text-white/60">
              Врач-программист рекомендует срочно сходить со мной на кофе. Ты согласна?
            </p>

            <button
              type="button"
              onClick={() => setStage('yes')}
              className="rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 px-8 py-4 text-base font-semibold text-slate-900 shadow-lg shadow-emerald-400/30 transition-all duration-200 active:scale-95"
              style={{ transform: `scale(${yesScale})`, margin: `${(yesScale - 1) * 24}px 0` }}
            >
              Да, согласна
            </button>

            <div ref={areaRef} className="relative h-44 w-full">
              <button
                type="button"
                onPointerEnter={dodge}
                onPointerDown={dodge}
                onClick={dodge}
                className="absolute rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-medium text-white/80 transition-all duration-300"
                style={
                  pos
                    ? { left: pos.x, top: pos.y, width: 150 }
                    : { left: '50%', top: 8, width: 150, marginLeft: -75 }
                }
              >
                {noText}
              </button>
            </div>
          </div>
        )}

        {stage === 'yes' && (
          <div className="fade-up flex flex-col items-center gap-5">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-pink-500/20 text-pink-300">
              <Heart size={32} fill="currentColor" />
            </div>
            <h2 className="text-2xl font-semibold tracking-tight">Договорились!</h2>
            <p className="text-sm leading-relaxed text-white/60">
              Сделай скриншот и пришли мне. Это был невинный пранк, кофе за мной.
              {tries > 0 ? ` Кстати, кнопка «Нет» от тебя убегала ${tries} раз.` : ''}
            </p>
            <button
              type="button"
              onClick={reset}
              className="flex items-center gap-2 rounded-2xl border border-white/15 px-5 py-3 text-sm text-white/80 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <RotateCcw size={16} />
              Пройти заново
            </button>
          </div>
        )}
      </section>
    </main>
  )
}
