import * as LucideIcons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// Map Material Icons names to Lucide React components
const iconMap: Record<string, LucideIcon> = {
    // Navigation & Layout
    'dashboard': LucideIcons.LayoutDashboard,
    'hub': LucideIcons.Workflow,
    'home': LucideIcons.Home,
    'menu': LucideIcons.Menu,
    'close': LucideIcons.X,
    'more_vert': LucideIcons.MoreVertical,
    'more_horiz': LucideIcons.MoreHorizontal,
    'expand_more': LucideIcons.ChevronDown,
    'expand_less': LucideIcons.ChevronUp,
    'chevron_left': LucideIcons.ChevronLeft,
    'chevron_right': LucideIcons.ChevronRight,
    'arrow_back': LucideIcons.ArrowLeft,
    'arrow_forward': LucideIcons.ArrowRight,

    // Actions
    'add': LucideIcons.Plus,
    'edit': LucideIcons.Pencil,
    'delete': LucideIcons.Trash2,
    'delete_forever': LucideIcons.Trash2,
    'save': LucideIcons.Save,
    'search': LucideIcons.Search,
    'search_off': LucideIcons.SearchX,
    'copy': LucideIcons.Copy,
    'content_copy': LucideIcons.Copy,
    'download': LucideIcons.Download,
    'upload': LucideIcons.Upload,
    'refresh': LucideIcons.RefreshCw,
    'sort': LucideIcons.ArrowUpDown,
    'filter': LucideIcons.Filter,

    // Status & Feedback
    'check': LucideIcons.Check,
    'check_circle': LucideIcons.CheckCircle,
    'cancel': LucideIcons.XCircle,
    'error': LucideIcons.AlertCircle,
    'warning': LucideIcons.AlertTriangle,
    'info': LucideIcons.Info,
    'help': LucideIcons.HelpCircle,

    // Features
    'calendar_today': LucideIcons.Calendar,
    'event': LucideIcons.CalendarDays,
    'event_available': LucideIcons.CalendarCheck,
    'event_busy': LucideIcons.CalendarX,
    'schedule': LucideIcons.Clock,
    'timer': LucideIcons.Timer,
    'alarm': LucideIcons.AlarmClock,
    'description': LucideIcons.FileText,
    'article': LucideIcons.FileText,
    'note_add': LucideIcons.FilePlus,
    'edit_note': LucideIcons.FileEdit,
    'link': LucideIcons.Link,
    'open_in_new': LucideIcons.ExternalLink,

    // User & Profile
    'person': LucideIcons.User,
    'manage_accounts': LucideIcons.UserCog,
    'settings': LucideIcons.Settings,
    'lock': LucideIcons.Lock,
    'public': LucideIcons.Globe,
    'privacy_tip': LucideIcons.Shield,
    'security': LucideIcons.ShieldCheck,
    'logout': LucideIcons.LogOut,

    // Notifications
    'notifications': LucideIcons.Bell,
    'notifications_off': LucideIcons.BellOff,
    'notifications_active': LucideIcons.BellRing,

    // Content
    'push_pin': LucideIcons.Pin,
    'archive': LucideIcons.Archive,
    'unarchive': LucideIcons.ArchiveRestore,
    'inventory_2': LucideIcons.Package,
    'folder': LucideIcons.Folder,
    'image': LucideIcons.Image,

    // Charts & Data
    'bar_chart': LucideIcons.BarChart3,
    'insights': LucideIcons.LineChart,
    'percent': LucideIcons.Percent,
    'date_range': LucideIcons.CalendarRange,

    // Communication
    'volunteer_activism': LucideIcons.Heart,
    'feedback': LucideIcons.MessageSquare,
    'keyboard_return': LucideIcons.CornerDownLeft,

    // Location
    'location_on': LucideIcons.MapPin,

    // Media
    'self_improvement': LucideIcons.Sparkles,
    'add_circle': LucideIcons.PlusCircle,
    'radio_button_unchecked': LucideIcons.Circle,

    // Legal
    'gavel': LucideIcons.Scale,

    // Misc
    'inbox': LucideIcons.Inbox,
    'error_outline': LucideIcons.AlertCircle,
    'open_in_full': LucideIcons.Maximize2,
    'close_fullscreen': LucideIcons.Minimize2,
    'drag_indicator': LucideIcons.GripVertical,
    'arrow_outward': LucideIcons.ArrowUpRight,
};

// Default icon if not found
const DefaultIcon = LucideIcons.HelpCircle;

/**
 * Get a Lucide icon component by Material Icons name
 */
export function getIcon(name: string): LucideIcon {
    return iconMap[name] || DefaultIcon;
}

/**
 * Render a Lucide icon by Material Icons name
 */
export function renderIcon(name: string, props?: { size?: number; className?: string }) {
    const Icon = getIcon(name);
    return <Icon size={props?.size || 18} className={props?.className} />;
}

export { iconMap };
export type { LucideIcon };
