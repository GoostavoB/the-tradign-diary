import { motion } from 'framer-motion';

export const GlowingLogo = () => {
  return (
    <motion.div
      className="relative flex items-center justify-center"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
    >
      {/* Orange glow orb */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="absolute w-64 h-64 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(251, 146, 60, 0.4) 0%, rgba(251, 146, 60, 0.2) 30%, rgba(251, 146, 60, 0) 70%)',
            filter: 'blur(40px)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.6, 0.8, 0.6],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Light beam underneath */}
      <div className="absolute top-32 left-1/2 -translate-x-1/2 w-1 h-96 pointer-events-none">
        <motion.div
          className="w-full h-full"
          style={{
            background: 'linear-gradient(to bottom, rgba(251, 146, 60, 0.8) 0%, rgba(251, 146, 60, 0.4) 50%, rgba(251, 146, 60, 0) 100%)',
            filter: 'blur(20px)',
          }}
          animate={{
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Dark circle with logo */}
      <motion.div
        className="relative z-10 w-48 h-48 rounded-full flex items-center justify-center"
        style={{
          background: 'radial-gradient(circle, rgba(10, 10, 10, 1) 0%, rgba(20, 20, 20, 0.95) 100%)',
          boxShadow: '0 0 80px rgba(251, 146, 60, 0.5), inset 0 0 40px rgba(0, 0, 0, 0.8)',
        }}
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* Border glow */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.3), rgba(251, 146, 60, 0.1))',
            padding: '2px',
          }}
        >
          <div className="w-full h-full rounded-full bg-[#0a0a0a]" />
        </div>

        {/* TD Logo */}
        <div className="relative z-10 text-center">
          <motion.div
            className="text-6xl font-bold"
            style={{
              background: 'linear-gradient(135deg, #fb923c 0%, #fdba74 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 0 20px rgba(251, 146, 60, 0.5))',
            }}
            animate={{
              filter: [
                'drop-shadow(0 0 20px rgba(251, 146, 60, 0.5))',
                'drop-shadow(0 0 30px rgba(251, 146, 60, 0.7))',
                'drop-shadow(0 0 20px rgba(251, 146, 60, 0.5))',
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            TD
          </motion.div>
          <div className="text-xs text-orange-400/70 font-semibold tracking-wider mt-1">
            TRADING DIARY
          </div>
        </div>
      </motion.div>

      {/* Orbital rings */}
      <motion.div
        className="absolute inset-0 w-64 h-64"
        style={{
          border: '1px solid rgba(251, 146, 60, 0.2)',
          borderRadius: '50%',
        }}
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(251, 146, 60, 1), rgba(251, 146, 60, 0))',
            boxShadow: '0 0 10px rgba(251, 146, 60, 0.8)',
          }}
        />
      </motion.div>
    </motion.div>
  );
};
