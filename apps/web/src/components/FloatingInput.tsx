
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
                        : 'border-gray-300 focus:border-black'
                    } 
                    appearance-none focus:outline-none focus:ring-0 peer transition-colors
                `}
            />
            <label
                htmlFor={props.id}
                className={`
                    absolute text-[15px] duration-300 transform -translate-y-4 scale-90 top-2 z-10 origin-[0] bg-white px-2
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
                >
                    <span className="material-icons-outlined text-[20px]">
                        {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                </button>
            )}

            {/* Error message removed from here, handled by parent */}
            <div className={`absolute bottom-0 left-0 w-full h-[1px] transition-colors duration-300 ${error ? 'bg-red-600' : 'bg-transparent'}`}></div>
        </div>
    );
}
