import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'

// Shown while the 3D room mounts. No fake progress numbers — just an
// honest, elegant "preparing" state (the room builds almost instantly
// because all geometry is procedural and media loads progressively).
export default function LoadingScreen() {
  return (
    <div className="loading">
      <motion.div
        animate={{ scale: [1, 1.18, 1] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        className="loading-heart"
      >
        <Heart size={44} fill="currentColor" strokeWidth={1} />
      </motion.div>
      <p>Preparing our little world…</p>
      <div className="loading-bar" aria-hidden="true">
        <motion.div
          className="loading-bar-fill"
          animate={{ x: ['-100%', '220%'] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
    </div>
  )
}
