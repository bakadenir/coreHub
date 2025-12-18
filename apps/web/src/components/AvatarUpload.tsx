import { useRef, useState, useCallback } from 'react';

interface AvatarUploadProps {
    currentAvatar?: string;
    name: string;
    onAvatarChange: (base64: string) => void;
    size?: 'sm' | 'md' | 'lg';
}

export default function AvatarUpload({
    currentAvatar,
    name,
    onAvatarChange,
    size = 'lg',
}: AvatarUploadProps) {
    const [isDragOver, setIsDragOver] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const sizeClasses = {
        sm: 'h-12 w-12',
        md: 'h-16 w-16',
        lg: 'h-20 w-20',
    };

    const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'U')}&background=000&color=fff`;
    const displayAvatar = (currentAvatar && currentAvatar.trim() !== '') ? currentAvatar : defaultAvatar;

    const processFile = useCallback((file: File) => {
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('Image size must be less than 5MB');
            return;
        }

        setIsLoading(true);

        const reader = new FileReader();
        reader.onload = (e) => {
            const base64 = e.target?.result as string;

            // Resize image to max 200x200 for efficiency
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const maxSize = 200;
                let { width, height } = img;

                if (width > height) {
                    if (width > maxSize) {
                        height = (height * maxSize) / width;
                        width = maxSize;
                    }
                } else {
                    if (height > maxSize) {
                        width = (width * maxSize) / height;
                        height = maxSize;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);

                const resizedBase64 = canvas.toDataURL('image/jpeg', 0.8);
                onAvatarChange(resizedBase64);
                setIsLoading(false);
            };
            img.src = base64;
        };
        reader.onerror = () => {
            alert('Failed to read file');
            setIsLoading(false);
        };
        reader.readAsDataURL(file);
    }, [onAvatarChange]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            processFile(file);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            processFile(file);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    return (
        <div className="flex items-center gap-4">
            {/* Avatar Preview */}
            <div
                className={`relative ${sizeClasses[size]} rounded-full overflow-hidden cursor-pointer group`}
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
            >
                <img
                    src={displayAvatar}
                    alt="Profile"
                    className={`w-full h-full object-cover border border-gray-200 rounded-full transition-all ${isDragOver ? 'scale-105 border-primary' : ''
                        }`}
                />

                {/* Overlay */}
                <div className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity ${isLoading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}>
                    {isLoading ? (
                        <span className="material-icons-outlined text-white text-2xl animate-spin">refresh</span>
                    ) : (
                        <span className="material-icons-outlined text-white text-2xl">camera_alt</span>
                    )}
                </div>
            </div>

            {/* Upload Actions */}
            <div className="flex flex-col gap-1">
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-sm font-medium text-primary hover:text-blue-700 transition-colors text-left"
                >
                    Change Photo
                </button>
                <p className="text-xs text-gray-400">JPG, PNG. Max 5MB</p>
            </div>

            {/* Hidden File Input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
            />
        </div>
    );
}
