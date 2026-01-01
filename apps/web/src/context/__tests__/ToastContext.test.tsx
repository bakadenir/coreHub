import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ToastProvider, useToast, ToastContext } from '../ToastContext';
import { useContext } from 'react';

// Helper component that uses the toast hook
function TestComponent() {
    const { showToast } = useToast();
    return (
        <div>
            <button onClick={() => showToast('Success message', 'success')}>Show Success</button>
            <button onClick={() => showToast('Error message', 'error')}>Show Error</button>
            <button onClick={() => showToast('Info message', 'info')}>Show Info</button>
            <button onClick={() => showToast('Duplicate message')}>Show Duplicate</button>
        </div>
    );
}

// Component that accesses context directly without provider
function BrokenComponent() {
    try {
        useToast();
        return <div>Hook worked</div>;
    } catch (error) {
        return <div>Hook failed: {(error as Error).message}</div>;
    }
}

describe('ToastContext', () => {
    beforeEach(() => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('useToast Hook', () => {
        it('throws error when used outside provider', () => {
            // We expect this to render the error message
            render(<BrokenComponent />);
            expect(screen.getByText(/Hook failed: useToast must be used within a ToastProvider/)).toBeInTheDocument();
        });

        it('works correctly when used inside provider', () => {
            render(
                <ToastProvider>
                    <TestComponent />
                </ToastProvider>
            );
            expect(screen.getByText('Show Success')).toBeInTheDocument();
        });
    });

    describe('showToast Function', () => {
        it('displays success toast', async () => {
            const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
            render(
                <ToastProvider>
                    <TestComponent />
                </ToastProvider>
            );

            await user.click(screen.getByText('Show Success'));

            expect(screen.getByText('Success message')).toBeInTheDocument();
        });

        it('displays error toast with correct styling', async () => {
            const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
            render(
                <ToastProvider>
                    <TestComponent />
                </ToastProvider>
            );

            await user.click(screen.getByText('Show Error'));

            const toast = screen.getByText('Error message').closest('div');
            expect(toast).toHaveClass('bg-red-600');
        });

        it('displays info toast with correct styling', async () => {
            const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
            render(
                <ToastProvider>
                    <TestComponent />
                </ToastProvider>
            );

            await user.click(screen.getByText('Show Info'));

            const toast = screen.getByText('Info message').closest('div');
            expect(toast).toHaveClass('bg-[#fdfdfd]');
        });

        it('defaults to success type', async () => {
            const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

            // Component that uses default type
            function DefaultTypeComponent() {
                const { showToast } = useToast();
                return <button onClick={() => showToast('Default message')}>Show Default</button>;
            }

            render(
                <ToastProvider>
                    <DefaultTypeComponent />
                </ToastProvider>
            );

            await user.click(screen.getByText('Show Default'));

            const toast = screen.getByText('Default message').closest('div');
            expect(toast).toHaveClass('bg-zinc-900');
        });
    });

    describe('Toast Auto-removal', () => {
        it('removes toast after 3 seconds', async () => {
            const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
            render(
                <ToastProvider>
                    <TestComponent />
                </ToastProvider>
            );

            await user.click(screen.getByText('Show Success'));
            expect(screen.getByText('Success message')).toBeInTheDocument();

            // Advance time by 3 seconds
            act(() => {
                vi.advanceTimersByTime(3100);
            });

            await waitFor(() => {
                expect(screen.queryByText('Success message')).not.toBeInTheDocument();
            });
        });
    });

    describe('Duplicate Prevention', () => {
        it('prevents duplicate toasts with same message', async () => {
            const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
            render(
                <ToastProvider>
                    <TestComponent />
                </ToastProvider>
            );

            await user.click(screen.getByText('Show Duplicate'));
            await user.click(screen.getByText('Show Duplicate'));
            await user.click(screen.getByText('Show Duplicate'));

            // Should only show one toast
            const toasts = screen.getAllByText('Duplicate message');
            expect(toasts).toHaveLength(1);
        });
    });

    describe('Multiple Toasts', () => {
        it('can display multiple different toasts', async () => {
            const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
            render(
                <ToastProvider>
                    <TestComponent />
                </ToastProvider>
            );

            await user.click(screen.getByText('Show Success'));
            await user.click(screen.getByText('Show Error'));
            await user.click(screen.getByText('Show Info'));

            expect(screen.getByText('Success message')).toBeInTheDocument();
            expect(screen.getByText('Error message')).toBeInTheDocument();
            expect(screen.getByText('Info message')).toBeInTheDocument();
        });
    });

    describe('ToastProvider', () => {
        it('renders children correctly', () => {
            render(
                <ToastProvider>
                    <div data-testid="child">Child content</div>
                </ToastProvider>
            );

            expect(screen.getByTestId('child')).toBeInTheDocument();
        });

        it('has fixed toast container', () => {
            const { container } = render(
                <ToastProvider>
                    <div>Content</div>
                </ToastProvider>
            );

            const toastContainer = container.querySelector('.fixed.bottom-4.right-4');
            expect(toastContainer).toBeInTheDocument();
        });
    });
});
