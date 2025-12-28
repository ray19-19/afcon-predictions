import toast from 'react-hot-toast';

// Success notification
export const showSuccess = (message: string) => {
    toast.success(message, {
        duration: 3000,
        position: 'top-center',
        style: {
            background: '#10b981',
            color: '#fff',
            fontWeight: '600',
            borderRadius: '0.75rem',
            padding: '1rem 1.5rem',
        },
        iconTheme: {
            primary: '#fff',
            secondary: '#10b981',
        },
    });
};

// Error notification
export const showError = (message: string) => {
    toast.error(message, {
        duration: 4000,
        position: 'top-center',
        style: {
            background: '#ef4444',
            color: '#fff',
            fontWeight: '600',
            borderRadius: '0.75rem',
            padding: '1rem 1.5rem',
        },
        iconTheme: {
            primary: '#fff',
            secondary: '#ef4444',
        },
    });
};

// Info notification
export const showInfo = (message: string) => {
    toast(message, {
        duration: 3000,
        position: 'top-center',
        icon: '📢',
        style: {
            background: '#3b82f6',
            color: '#fff',
            fontWeight: '600',
            borderRadius: '0.75rem',
            padding: '1rem 1.5rem',
        },
    });
};

// Loading notification
export const showLoading = (message: string) => {
    return toast.loading(message, {
        position: 'top-center',
        style: {
            background: '#6b7280',
            color: '#fff',
            fontWeight: '600',
            borderRadius: '0.75rem',
            padding: '1rem 1.5rem',
        },
    });
};

// Prediction saved notification with confetti
export const showPredictionSaved = () => {
    toast.success('Prediction saved!', {
        duration: 2000,
        position: 'top-center',
        icon: '⚽',
        style: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#fff',
            fontWeight: '700',
            borderRadius: '0.75rem',
            padding: '1rem 1.5rem',
        },
    });
};

// Points earned notification
export const showPointsEarned = (points: number) => {
    const emoji = points === 5 ? '🎉' : points === 3 ? '🎯' : points === 1 ? '👍' : '💪';
    const message = points === 0 ? 'Better luck next time!' : `+${points} points earned!`;

    toast.success(message, {
        duration: 3000,
        position: 'top-center',
        icon: emoji,
        style: {
            background: points === 5 ? '#10b981' : points === 3 ? '#3b82f6' : points === 1 ? '#f59e0b' : '#6b7280',
            color: '#fff',
            fontWeight: '700',
            borderRadius: '0.75rem',
            padding: '1rem 1.5rem',
        },
    });
};
