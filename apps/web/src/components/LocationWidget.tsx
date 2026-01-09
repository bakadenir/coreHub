import { useState, useEffect } from 'react';
import { MapPin, RefreshCw } from 'lucide-react';

interface LocationData {
    city: string;
    region: string;
    country: string;
    postalCode: string;
    isLoading: boolean;
    error: string | null;
}

export default function LocationWidget() {
    const [location, setLocation] = useState<LocationData>({
        city: '',
        region: '',
        country: '',
        postalCode: '',
        isLoading: true,
        error: null,
    });

    useEffect(() => {
        const fetchLocation = async () => {
            try {
                // First, try to get geolocation from browser
                if ('geolocation' in navigator) {
                    navigator.geolocation.getCurrentPosition(
                        async (position) => {
                            const { latitude, longitude } = position.coords;
                            try {
                                // Use reverse geocoding API (free, no key required)
                                const response = await fetch(
                                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=en`
                                );
                                const data = await response.json();
                                const address = data.address || {};
                                setLocation({
                                    city: address.city || address.town || address.village || address.suburb || 'Unknown',
                                    region: address.state || address.county || '',
                                    country: address.country || '',
                                    postalCode: address.postcode || '',
                                    isLoading: false,
                                    error: null,
                                });
                            } catch {
                                // Fallback: show coordinates
                                setLocation({
                                    city: `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`,
                                    region: '',
                                    country: '',
                                    postalCode: '',
                                    isLoading: false,
                                    error: null,
                                });
                            }
                        },
                        () => {
                            // Geolocation denied or failed
                            setLocation({
                                city: 'Location access denied',
                                region: '',
                                country: '',
                                postalCode: '',
                                isLoading: false,
                                error: 'Please enable location in browser settings',
                            });
                        },
                        { timeout: 10000 }
                    );
                } else {
                    setLocation({
                        city: 'Geolocation not supported',
                        region: '',
                        country: '',
                        postalCode: '',
                        isLoading: false,
                        error: 'Browser does not support geolocation',
                    });
                }
            } catch {
                setLocation({
                    city: 'Error',
                    region: '',
                    country: '',
                    postalCode: '',
                    isLoading: false,
                    error: 'Failed to get location',
                });
            }
        };

        fetchLocation();
    }, []);

    const formatLocation = () => {
        if (location.isLoading) return 'Getting location...';
        if (location.error) return location.city;

        const parts = [
            location.city,
            location.postalCode,
            location.region,
            location.country,
        ].filter(Boolean);

        return parts.join(', ');
    };

    return (
        <div className="flex items-center justify-center gap-1.5 text-gray-400 text-[13px] font-medium tracking-wide">
            {location.isLoading ? <RefreshCw size={14} className="animate-spin" /> : <MapPin size={14} />}
            <span className={location.isLoading ? 'animate-pulse' : ''}>
                {formatLocation()}
            </span>
        </div>
    );
}
