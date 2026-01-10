import { useState } from 'react';
import { User, Check, X } from 'lucide-react';

interface AvatarPickerProps {
    currentAvatar?: string;
    onAvatarChange: (avatarUrl: string) => void;
    size?: 'sm' | 'md' | 'lg';
}

// Avatar names from DiceBear notionists style
const AVATAR_SEEDS = [
    'Aiden', 'Mason', 'Sara', 'Aidan',
    'Oliver', 'Jack', 'Vivian', 'Ryan',
    'Chase', 'Riley', 'Jade', 'Luis',
    'Sophia', 'Emma', 'Liam', 'Noah',
];

// Generate avatar options using only notionists style
const generateAvatarOptions = () => {
    return AVATAR_SEEDS.map(seed => ({
        url: `https://api.dicebear.com/7.x/notionists/svg?seed=${seed}&backgroundColor=ffffff`,
        seed,
    }));
};

const AVATAR_OPTIONS = generateAvatarOptions();

export default function AvatarPicker({
    currentAvatar,
    onAvatarChange,
    size = 'lg',
}: AvatarPickerProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar || '');

    const sizeClasses = {
        sm: 'h-12 w-12',
        md: 'h-16 w-16',
        lg: 'h-20 w-20',
    };

    const hasAvatar = currentAvatar && currentAvatar.trim() !== '';

    const handleSelectAvatar = (url: string) => {
        setSelectedAvatar(url);
    };

    const handleConfirm = () => {
        onAvatarChange(selectedAvatar);
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setSelectedAvatar(currentAvatar || '');
        setIsModalOpen(false);
    };

    return (
        <>
            {/* Avatar Preview - Click to open picker */}
            <div
                className={`relative ${sizeClasses[size]} rounded-full overflow-hidden cursor-pointer group`}
                onClick={() => setIsModalOpen(true)}
            >
                {hasAvatar ? (
                    <img
                        src={currentAvatar}
                        alt="Profile"
                        className="w-full h-full object-cover border border-gray-200 rounded-full transition-all duration-200"
                    />
                ) : (
                    <div className="w-full h-full rounded-full border border-gray-200 bg-gray-900 flex items-center justify-center">
                        <User size={32} className="text-white" />
                    </div>
                )}

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-zinc-900/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="material-icons-outlined text-white text-xl">edit</span>
                </div>
            </div>

            {/* Avatar Picker Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={handleCancel}
                    />

                    {/* Modal */}
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900">Choose Avatar</h3>
                            <button
                                onClick={handleCancel}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>

                        {/* Avatar Grid */}
                        <div className="p-5 overflow-y-auto max-h-[50vh]">
                            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                                {AVATAR_OPTIONS.map((avatar, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleSelectAvatar(avatar.url)}
                                        className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all hover:scale-105 ${selectedAvatar === avatar.url
                                            ? 'border-zinc-900 ring-2 ring-zinc-900/20'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <img
                                            src={avatar.url}
                                            alt={`Avatar ${index + 1}`}
                                            className="w-full h-full object-cover bg-gray-50"
                                        />
                                        {selectedAvatar === avatar.url && (
                                            <div className="absolute inset-0 bg-zinc-900/20 flex items-center justify-center">
                                                <div className="bg-zinc-900 rounded-full p-1">
                                                    <Check size={14} className="text-white" />
                                                </div>
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100 bg-gray-50">
                            <button
                                onClick={handleCancel}
                                className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={!selectedAvatar}
                                className="px-5 py-2.5 text-sm font-medium bg-zinc-900 text-white rounded-xl hover:bg-zinc-800 transition-colors disabled:opacity-50"
                            >
                                Select Avatar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
