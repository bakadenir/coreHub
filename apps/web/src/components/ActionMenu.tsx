import { useState, useRef, useEffect } from 'react';

export interface ActionMenuItem {
    label: string;
    icon: string;
    onClick: () => void;
    variant?: 'default' | 'danger';
    disabled?: boolean;
}

interface ActionMenuProps {
    items: ActionMenuItem[];
    trigger?: React.ReactNode;
    className?: string;
}

export default function ActionMenu({ items, trigger, className = '' }: ActionMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleItemClick = (item: ActionMenuItem) => {
        if (!item.disabled) {
            item.onClick();
            setIsOpen(false);
        }
    };

    return (
        <div ref={menuRef} className={`relative ${className}`}>
            {/* Trigger Button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
                className="p-1 rounded-md text-text-secondary hover:text-text-primary hover:bg-gray-100 transition-colors"
            >
                {trigger || (
                    <span className="material-icons-outlined text-[20px]">more_vert</span>
                )}
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-border-light rounded-lg shadow-lg z-50 py-1 animate-in fade-in slide-in-from-top-2 duration-150">
                    {items.map((item, index) => (
                        <button
                            key={index}
                            onClick={() => handleItemClick(item)}
                            disabled={item.disabled}
                            className={`w-full flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors
                                ${item.variant === 'danger'
                                    ? 'text-red-600 hover:bg-red-50'
                                    : 'text-text-primary hover:bg-gray-50'
                                }
                                ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                            `}
                        >
                            <span className="material-icons-outlined text-[18px]">{item.icon}</span>
                            {item.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
