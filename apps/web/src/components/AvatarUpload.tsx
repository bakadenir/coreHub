import { useRef, useState, useCallback, useEffect } from 'react';
import { User } from 'lucide-react';

interface AvatarUploadProps {
    currentAvatar?: string;
    onAvatarChange: (base64: string) => void;
    size?: 'sm' | 'md' | 'lg';
}

export default function AvatarUpload({
    currentAvatar,
    onAvatarChange,
    size = 'lg',
}: AvatarUploadProps) {
    const [isDragOver, setIsDragOver] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const sizeClasses = {
        sm: 'h-12 w-12',
        md: 'h-16 w-16',
        lg: 'h-20 w-20',
    };

    const iconSizes = {
        sm: 20,
        md: 24,
        lg: 32,
    };

    const hasAvatar = currentAvatar && currentAvatar.trim() !== '';

    // Reset image loading state when avatar URL changes
    useEffect(() => {
        if (hasAvatar) {
            setIsImageLoaded(false);
        }
    }, [currentAvatar, hasAvatar]);

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
        <div>
            {/* Avatar Preview */}
            <div
                className={`relative ${sizeClasses[size]} rounded-full overflow-hidden cursor-pointer group`}
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
            >
                {/* Skeleton loading state */}
                {(hasAvatar && !isImageLoaded) && (
                    <div className="absolute inset-0 rounded-full bg-gray-200 animate-pulse" />
                )}

                {/* Actual avatar or default icon */}
                {hasAvatar ? (
                    <img
                        src={currentAvatar}
                        alt="Profile"
                        className={`w-full h-full object-cover border border-gray-200 rounded-full transition-all duration-200 ${isDragOver ? 'scale-105 border-primary' : ''} ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
                        onLoad={() => setIsImageLoaded(true)}
                        onError={() => setIsImageLoaded(true)}
                    />
                ) : (
                    <div className={`w-full h-full rounded-full border border-gray-200 bg-gray-900 flex items-center justify-center ${isDragOver ? 'scale-105 border-primary' : ''}`}>
                        <User size={iconSizes[size]} className="text-white" />
                    </div>
                )}

                {/* Overlay */}
                <div className={`absolute inset-0 bg-zinc-900/50 flex items-center justify-center transition-opacity ${isLoading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}>
                    {isLoading ? (
                        <span className="material-icons-outlined text-white text-2xl animate-spin">refresh</span>
                    ) : (
                        <span className="material-icons-outlined text-white text-2xl">camera_alt</span>
                    )}
                </div>
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
