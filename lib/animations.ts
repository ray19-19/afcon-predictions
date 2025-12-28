// Animation variants for Framer Motion
export const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
};

export const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 }
};

export const scaleIn = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 }
};

export const slideInFromLeft = {
    initial: { opacity: 0, x: -50 },
    animate: { opacity: 1, x: 0 }
};

export const slideInFromRight = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 }
};

// Stagger children animation
export const staggerContainer = {
    animate: {
        transition: {
            staggerChildren: 0.1
        }
    }
};

// Button press animation
export const buttonTap = {
    scale: 0.95
};

// Hover lift animation - fixed for Framer Motion types
export const hoverLift = {
    y: -4,
    transition: {
        duration: 0.2,
        ease: [0.4, 0, 0.2, 1] as const // cubic-bezier easeOut
    }
};

// Number count animation helper
export const animateNumber = (from: number, to: number, duration: number = 1000): Promise<number> => {
    return new Promise((resolve) => {
        const startTime = Date.now();
        const step = () => {
            const now = Date.now();
            const progress = Math.min((now - startTime) / duration, 1);
            const current = Math.floor(from + (to - from) * progress);

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                resolve(to);
            }
        };
        step();
    });
};

// Transition configs
export const springTransition = {
    type: 'spring' as const,
    stiffness: 300,
    damping: 30
};

export const smoothTransition = {
    duration: 0.3,
    ease: [0.4, 0, 0.2, 1] as const // Tailwind's ease-in-out cubic-bezier
};
