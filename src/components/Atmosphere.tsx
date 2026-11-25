/**
 * Fixed atmosphere layer: near-black base, soft top cone lights, vignette and grain.
 * Everything here is CSS — no images.
 */
export function Atmosphere() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      {/* base wash */}
      <div className="absolute inset-0 bg-ink" />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 80% at 50% -10%, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.03) 28%, rgba(6,6,7,0) 62%)',
        }}
      />
      {/* soft top cone lights */}
      {[
        { left: '12%', width: '16vw', opacity: 0.16, rotate: '-7deg' },
        { left: '33%', width: '20vw', opacity: 0.11, rotate: '3deg' },
        { left: '58%', width: '22vw', opacity: 0.13, rotate: '-4deg' },
        { left: '82%', width: '15vw', opacity: 0.09, rotate: '6deg' },
      ].map((cone, index) => (
        <div
          key={index}
          className="absolute -top-[12vh] h-[78vh] blur-2xl"
          style={{
            left: cone.left,
            width: cone.width,
            opacity: cone.opacity,
            transform: `rotate(${cone.rotate})`,
            transformOrigin: 'top center',
            background:
              'linear-gradient(to bottom, rgba(255,246,235,0.9) 0%, rgba(255,240,225,0.35) 34%, rgba(255,235,220,0.05) 72%, rgba(6,6,7,0) 100%)',
            clipPath: 'polygon(46% 0%, 54% 0%, 100% 100%, 0% 100%)',
          }}
        />
      ))}
      {/* ember floor haze */}
      <div
        className="absolute inset-x-0 bottom-0 h-[42vh]"
        style={{
          background:
            'radial-gradient(70% 100% at 50% 130%, rgba(255,107,44,0.13) 0%, rgba(255,107,44,0.04) 40%, rgba(6,6,7,0) 72%)',
        }}
      />
      {/* vignette */}
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(110% 90% at 50% 45%, rgba(0,0,0,0) 42%, rgba(0,0,0,0.55) 88%, rgba(0,0,0,0.8) 100%)' }}
      />
      {/* grain */}
      <div
        className="absolute inset-0 opacity-[0.05] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  )
}
