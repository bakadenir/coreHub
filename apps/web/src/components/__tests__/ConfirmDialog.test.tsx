import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ConfirmDialog from '../ConfirmDialog';

describe('ConfirmDialog Component', () => {
    const defaultProps = {
        isOpen: true,
        onClose: vi.fn(),
        onConfirm: vi.fn(),
        title: 'Confirm Action',
        message: 'Are you sure you want to proceed?',
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Rendering', () => {
        it('renders when isOpen is true', () => {
            render(<ConfirmDialog {...defaultProps} />);
            expect(screen.getByText('Confirm Action')).toBeInTheDocument();
            expect(screen.getByText('Are you sure you want to proceed?')).toBeInTheDocument();
        });

        it('does not render when isOpen is false', () => {
            render(<ConfirmDialog {...defaultProps} isOpen={false} />);
            expect(screen.queryByText('Confirm Action')).not.toBeInTheDocument();
        });

        it('displays custom confirm label', () => {
            render(<ConfirmDialog {...defaultProps} confirmLabel="Delete Forever" />);
            expect(screen.getByText('Delete Forever')).toBeInTheDocument();
        });

        it('displays title with item name when provided', () => {
            render(<ConfirmDialog {...defaultProps} itemName="My Note" />);
            expect(screen.getByText('Confirm deletion of My Note')).toBeInTheDocument();
        });

        it('shows "This action cannot be undone" warning', () => {
            render(<ConfirmDialog {...defaultProps} />);
            expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument();
        });
    });

    describe('User Interactions', () => {
        it('calls onClose when close button is clicked', async () => {
            const user = userEvent.setup();
            render(<ConfirmDialog {...defaultProps} />);

            const closeButton = screen.getByRole('button', { name: '' }); // X button has no text
            await user.click(closeButton);

            expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
        });

        it('calls onClose when backdrop is clicked', async () => {
            const user = userEvent.setup();
            const { container } = render(<ConfirmDialog {...defaultProps} />);

            const backdrop = container.querySelector('.bg-zinc-900\\/50');
            if (backdrop) {
                await user.click(backdrop);
            }

            expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
        });

        it('calls onConfirm when confirm button is clicked', async () => {
            const user = userEvent.setup();
            render(<ConfirmDialog {...defaultProps} />);

            const confirmButton = screen.getByText('Confirm');
            await user.click(confirmButton);

            expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
        });

        it('closes dialog when Escape key is pressed', () => {
            render(<ConfirmDialog {...defaultProps} />);

            fireEvent.keyDown(document, { key: 'Escape' });

            expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
        });

        it('does not close on Escape when isLoading', () => {
            render(<ConfirmDialog {...defaultProps} isLoading={true} />);

            fireEvent.keyDown(document, { key: 'Escape' });

            expect(defaultProps.onClose).not.toHaveBeenCalled();
        });
    });

    describe('Type to Confirm', () => {
        it('disables confirm button when confirmText is not matched', () => {
            render(<ConfirmDialog {...defaultProps} confirmText="DELETE" />);

            const confirmButton = screen.getByText('Confirm');
            expect(confirmButton).toBeDisabled();
        });

        it('enables confirm button when confirmText is matched', async () => {
            const user = userEvent.setup();
            render(<ConfirmDialog {...defaultProps} confirmText="DELETE" />);

            const input = screen.getByPlaceholderText('Type DELETE in here');
            await user.type(input, 'DELETE');

            const confirmButton = screen.getByText('Confirm');
            expect(confirmButton).not.toBeDisabled();
        });

        it('confirmText matching is case-insensitive', async () => {
            const user = userEvent.setup();
            render(<ConfirmDialog {...defaultProps} confirmText="DELETE" />);

            const input = screen.getByPlaceholderText('Type DELETE in here');
            await user.type(input, 'delete');

            const confirmButton = screen.getByText('Confirm');
            expect(confirmButton).not.toBeDisabled();
        });

        it('shows type instruction label', () => {
            render(<ConfirmDialog {...defaultProps} confirmText="DELETE" />);
            expect(screen.getByText('DELETE')).toBeInTheDocument();
            expect(screen.getByText(/Type/)).toBeInTheDocument();
        });
    });

    describe('Loading State', () => {
        it('disables confirm button when isLoading', () => {
            render(<ConfirmDialog {...defaultProps} isLoading={true} />);

            const confirmButton = screen.getByText('Confirm');
            expect(confirmButton).toBeDisabled();
        });

        it('disables close button when isLoading', () => {
            render(<ConfirmDialog {...defaultProps} isLoading={true} />);

            const closeButton = screen.getByRole('button', { name: '' });
            expect(closeButton).toBeDisabled();
        });

        it('does not close on backdrop click when isLoading', async () => {
            const user = userEvent.setup();
            const { container } = render(<ConfirmDialog {...defaultProps} isLoading={true} />);

            const backdrop = container.querySelector('.bg-zinc-900\\/50');
            if (backdrop) {
                await user.click(backdrop);
            }

            expect(defaultProps.onClose).not.toHaveBeenCalled();
        });
    });

    describe('Variants', () => {
        it('renders danger variant correctly', () => {
            const { container } = render(<ConfirmDialog {...defaultProps} variant="danger" />);
            expect(container.querySelector('.bg-gray-900')).toBeInTheDocument();
        });

        it('renders warning variant correctly', () => {
            const { container } = render(<ConfirmDialog {...defaultProps} variant="warning" />);
            expect(container.querySelector('.bg-yellow-500')).toBeInTheDocument();
        });

        it('renders default variant correctly', () => {
            const { container } = render(<ConfirmDialog {...defaultProps} variant="default" />);
            expect(container.querySelector('.bg-gray-500')).toBeInTheDocument();
        });
    });
});
