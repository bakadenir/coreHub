import { useState, useRef, useEffect, type KeyboardEvent, type ClipboardEvent } from 'react';

interface OTPInputProps {
    length?: number;
    onComplete: (code: string) => void;
    disabled?: boolean;
}

export default function OTPInput({ length = 6, onComplete, disabled = false }: OTPInputProps) {
    const [values, setValues] = useState<string[]>(Array(length).fill(''));
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Auto-focus first input on mount
    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    // Notify when complete
    useEffect(() => {
        const code = values.join('');
        if (code.length === length && !values.includes('')) {
            onComplete(code);
        }
    }, [values, length, onComplete]);

    const handleChange = (index: number, value: string) => {
        // Only allow digits
        const digit = value.replace(/\D/g, '').slice(-1);

        const newValues = [...values];
        newValues[index] = digit;
        setValues(newValues);

        // Auto-advance to next input
        if (digit && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace') {
            if (!values[index] && index > 0) {
                // Move to previous input if current is empty
                inputRefs.current[index - 1]?.focus();
                const newValues = [...values];
                newValues[index - 1] = '';
                setValues(newValues);
            } else {
                // Clear current input
                const newValues = [...values];
                newValues[index] = '';
                setValues(newValues);
            }
        } else if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === 'ArrowRight' && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);

        if (pastedData) {
            const newValues = [...values];
            for (let i = 0; i < pastedData.length; i++) {
                newValues[i] = pastedData[i];
            }
            setValues(newValues);

            // Focus last filled input or the next empty one
            const focusIndex = Math.min(pastedData.length, length - 1);
            inputRefs.current[focusIndex]?.focus();
        }
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        e.target.select();
    };

    return (
        <div className="flex gap-2 justify-center">
            {values.map((value, index) => (
                <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={value}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    onFocus={handleFocus}
                    disabled={disabled}
                    className={`
                        w-10 h-10 sm:w-11 sm:h-11 text-center text-lg font-bold
                        border rounded-xl
                        transition-all duration-200 ease-in-out
                        shadow-sm hover:shadow
                        focus:outline-none focus:border-black focus:ring-4 focus:ring-black/5 focus:scale-105
                        disabled:opacity-50 disabled:cursor-not-allowed
                        ${value ? 'border-zinc-800 bg-white text-black' : 'border-zinc-200 bg-zinc-50 text-zinc-400'}
                    `}
                    aria-label={`Digit ${index + 1}`}
                />
            ))}
        </div>
    );
}
