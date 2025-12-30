
import React, { useState } from 'react';

interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
}

export default function FloatingInput({ label, error, className = '', value, ...props }: FloatingInputProps) {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = props.type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : props.type;

    return (
        <div className={`relative mb-5 ${className}`}>
            <input
                {...props}
                type={inputType}
                value={value}
                placeholder=" " // Required for :placeholder-shown to work effectively
                className={`
                    block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-xl border 
                    ${error
                        ? 'border-red-600 focus:border-red-600'
                        : 'border-gray-300 focus:border-zinc-900'
                    } 
                    appearance-none focus:outline-none focus:ring-0 peer transition-colors
                `}
            />
            <label
                htmlFor={props.id}
                className={`
                    absolute text-[15px] duration-300 transform -translate-y-4 scale-90 top-2 z-10 origin-[0] bg-[#fdfdfd] px-2
                    peer-focus:px-2 
                    ${error ? 'text-red-600 peer-focus:text-red-600' : 'text-gray-500 peer-focus:text-black'}
                    peer-placeholder-shown:scale-100 
                    peer-placeholder-shown:-translate-y-1/2 
                    peer-placeholder-shown:top-1/2 
                    peer-focus:top-2 
                    peer-focus:scale-90 
                    peer-focus:-translate-y-4 
                    rtl:peer-focus:translate-x-1/4 
                    rtl:peer-focus:left-auto 
                    start-1
                    pointer-events-none
                `}
            >
                {label}
            </label>

            {isPassword && (
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black cursor-pointer focus:outline-none"
                    tabIndex={-1}
                >
                    {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    )}
                </button>
            )}

            {/* Error message removed from here, handled by parent */}
            <div className={`absolute bottom-0 left-0 w-full h-[1px] transition-colors duration-300 ${error ? 'bg-red-600' : 'bg-transparent'}`}></div>
        </div>
    );
}
