const COLOR_MAP = {
  blue:   'av-blue',
  teal:   'av-teal',
  amber:  'av-amber',
  purple: 'av-purple',
  red:    'av-red',
}

export default function Avatar({ initials, color = 'blue', size = 32 }) {
  return (
    <div className={`av ${COLOR_MAP[color] || 'av-blue'}`}
      style={{ width: size, height: size, fontSize: size * 0.34 }}
      aria-hidden="true">
      {initials}
    </div>
  )
}
