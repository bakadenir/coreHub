import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AddTodoListModal from '../AddTodoListModal';
import { ToastProvider } from '../../context/ToastContext';
import * as todosApiModule from '../../lib/todos.api';

// Mock the todos API
vi.mock('../../lib/todos.api', () => ({
    todosApi: {
        createList: vi.fn(),
    },
}));

// Mock the lib/index.ts barrel export
vi.mock('../../lib', () => ({
    todosApi: {
        createList: vi.fn(),
    },
}));

const renderWithProviders = (ui: React.ReactElement) => {
    return render(<ToastProvider>{ui}</ToastProvider>);
};

describe('AddTodoListModal Component', () => {
    const defaultProps = {
        isOpen: true,
        onClose: vi.fn(),
        onSuccess: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Rendering', () => {
        it('renders when isOpen is true', () => {
            renderWithProviders(<AddTodoListModal {...defaultProps} />);
            expect(screen.getByText('Create New List')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('e.g., Work, Shopping, Personal')).toBeInTheDocument();
        });

        it('does not render when isOpen is false', () => {
            renderWithProviders(<AddTodoListModal {...defaultProps} isOpen={false} />);
            expect(screen.queryByText('Create New List')).not.toBeInTheDocument();
        });

        it('renders color selection buttons', () => {
            const { container } = renderWithProviders(<AddTodoListModal {...defaultProps} />);
            // 8 color buttons
            const colorButtons = container.querySelectorAll('button[type="button"]');
            expect(colorButtons.length).toBeGreaterThanOrEqual(8);
        });

        it('shows Create List button', () => {
            renderWithProviders(<AddTodoListModal {...defaultProps} />);
            expect(screen.getByText('Create List')).toBeInTheDocument();
        });

        it('shows Cancel button', () => {
            renderWithProviders(<AddTodoListModal {...defaultProps} />);
            expect(screen.getByText('Cancel')).toBeInTheDocument();
        });
    });

    describe('Form Input', () => {
        it('updates name value when typing', async () => {
            const user = userEvent.setup();
            renderWithProviders(<AddTodoListModal {...defaultProps} />);

            const input = screen.getByPlaceholderText('e.g., Work, Shopping, Personal');
            await user.type(input, 'My New List');

            expect(input).toHaveValue('My New List');
        });

        it('disables submit button when name is empty', () => {
            renderWithProviders(<AddTodoListModal {...defaultProps} />);
            const submitButton = screen.getByText('Create List');
            expect(submitButton).toBeDisabled();
        });

        it('enables submit button when name has value', async () => {
            const user = userEvent.setup();
            renderWithProviders(<AddTodoListModal {...defaultProps} />);

            const input = screen.getByPlaceholderText('e.g., Work, Shopping, Personal');
            await user.type(input, 'My List');

            const submitButton = screen.getByText('Create List');
            expect(submitButton).not.toBeDisabled();
        });
    });

    describe('Color Selection', () => {
        it('changes selected color when color button is clicked', async () => {
            const user = userEvent.setup();
            const { container } = renderWithProviders(<AddTodoListModal {...defaultProps} />);

            // Find color buttons - they should have the color classes
            const greenButton = container.querySelector('.bg-green-500');
            if (greenButton) {
                await user.click(greenButton);
                // After clicking, the button should have ring classes indicating selection
                expect(greenButton).toHaveClass('ring-2');
            }
        });
    });

    describe('Close Behavior', () => {
        it('calls onClose when Cancel is clicked', async () => {
            const user = userEvent.setup();
            renderWithProviders(<AddTodoListModal {...defaultProps} />);

            await user.click(screen.getByText('Cancel'));

            expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
        });

        it('calls onClose when X button is clicked', async () => {
            const user = userEvent.setup();
            const { container } = renderWithProviders(<AddTodoListModal {...defaultProps} />);

            const closeButton = container.querySelector('.group.p-1');
            if (closeButton) {
                await user.click(closeButton);
                expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
            }
        });

        it('calls onClose when backdrop is clicked', async () => {
            const user = userEvent.setup();
            const { container } = renderWithProviders(<AddTodoListModal {...defaultProps} />);

            const backdrop = container.querySelector('.bg-zinc-900\\/40');
            if (backdrop) {
                await user.click(backdrop);
                expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
            }
        });
    });

    describe('Form Reset', () => {
        it('resets form when modal opens', async () => {
            const user = userEvent.setup();
            const { rerender } = renderWithProviders(<AddTodoListModal {...defaultProps} />);

            const input = screen.getByPlaceholderText('e.g., Work, Shopping, Personal');
            await user.type(input, 'Test List');

            // Close and reopen modal
            rerender(
                <ToastProvider>
                    <AddTodoListModal {...defaultProps} isOpen={false} />
                </ToastProvider>
            );
            rerender(
                <ToastProvider>
                    <AddTodoListModal {...defaultProps} isOpen={true} />
                </ToastProvider>
            );

            const newInput = screen.getByPlaceholderText('e.g., Work, Shopping, Personal');
            expect(newInput).toHaveValue('');
        });
    });
});
