import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import {
    Skeleton,
    SkeletonText,
    SkeletonCircle,
    ActivityCardSkeleton,
    ActivityCardsSkeleton,
    WidgetSkeleton,
    DashboardSkeleton,
} from '../Skeleton';

describe('Skeleton Component', () => {
    it('renders with default classes', () => {
        const { container } = render(<Skeleton />);
        const skeleton = container.firstChild as HTMLElement;
        expect(skeleton).toHaveClass('animate-pulse', 'bg-gray-200', 'rounded');
    });

    it('renders with custom className', () => {
        const { container } = render(<Skeleton className="w-20 h-4" />);
        const skeleton = container.firstChild as HTMLElement;
        expect(skeleton).toHaveClass('w-20', 'h-4');
    });
});

describe('SkeletonText Component', () => {
    it('renders default single line', () => {
        const { container } = render(<SkeletonText />);
        const lines = container.querySelectorAll('.animate-pulse');
        expect(lines).toHaveLength(1);
    });

    it('renders correct number of lines', () => {
        const { container } = render(<SkeletonText lines={3} />);
        const lines = container.querySelectorAll('.animate-pulse');
        expect(lines).toHaveLength(3);
    });

    it('applies custom className to container', () => {
        const { container } = render(<SkeletonText className="my-4" />);
        const wrapper = container.firstChild as HTMLElement;
        expect(wrapper).toHaveClass('my-4');
    });

    it('last line has w-3/4 width', () => {
        const { container } = render(<SkeletonText lines={2} />);
        const lines = container.querySelectorAll('.animate-pulse');
        expect(lines[1]).toHaveClass('w-3/4');
    });
});

describe('SkeletonCircle Component', () => {
    it('renders small size correctly', () => {
        const { container } = render(<SkeletonCircle size="sm" />);
        const circle = container.firstChild as HTMLElement;
        expect(circle).toHaveClass('w-6', 'h-6', 'rounded-full');
    });

    it('renders medium size (default) correctly', () => {
        const { container } = render(<SkeletonCircle />);
        const circle = container.firstChild as HTMLElement;
        expect(circle).toHaveClass('w-10', 'h-10', 'rounded-full');
    });

    it('renders large size correctly', () => {
        const { container } = render(<SkeletonCircle size="lg" />);
        const circle = container.firstChild as HTMLElement;
        expect(circle).toHaveClass('w-16', 'h-16', 'rounded-full');
    });
});

describe('ActivityCardSkeleton Component', () => {
    it('renders skeleton structure', () => {
        const { container } = render(<ActivityCardSkeleton />);
        expect(container.firstChild).toHaveClass('bg-[#fdfdfd]', 'border', 'rounded-xl');
    });

    it('contains multiple skeleton elements', () => {
        const { container } = render(<ActivityCardSkeleton />);
        const skeletons = container.querySelectorAll('.animate-pulse');
        expect(skeletons.length).toBeGreaterThan(3);
    });
});

describe('ActivityCardsSkeleton Component', () => {
    it('renders grid with 4 activity cards', () => {
        const { container } = render(<ActivityCardsSkeleton />);
        const cards = container.querySelectorAll('.min-h-\\[160px\\]');
        expect(cards).toHaveLength(4);
    });
});

describe('WidgetSkeleton Component', () => {
    it('renders with default height', () => {
        const { container } = render(<WidgetSkeleton />);
        expect(container.firstChild).toHaveClass('h-32');
    });

    it('renders with custom height', () => {
        const { container } = render(<WidgetSkeleton height="h-48" />);
        expect(container.firstChild).toHaveClass('h-48');
    });
});

describe('DashboardSkeleton Component', () => {
    it('renders complete dashboard skeleton structure', () => {
        const { container } = render(<DashboardSkeleton />);
        expect(container.firstChild).toHaveClass('flex', 'flex-col');
    });

    it('contains activity cards skeleton', () => {
        const { container } = render(<DashboardSkeleton />);
        // Should have 4 activity card skeletons
        const cards = container.querySelectorAll('.min-h-\\[160px\\]');
        expect(cards).toHaveLength(4);
    });
});
