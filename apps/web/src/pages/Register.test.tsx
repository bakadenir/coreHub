


import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Register from '../pages/Register';
import { ToastContext } from '../context/ToastContext';

// Mock the ToastContext
const mockShowToast = vi.fn();
const MockToastProvider = ({ children }: { children: React.ReactNode }) => (
    <ToastContext.Provider value={{ showToast: mockShowToast }}>
        {children}
    </ToastContext.Provider>
);

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});


describe('Register Page', () => {
    it('renders registration form correctly', () => {
        render(
            <MockToastProvider>
                <MemoryRouter>
                    <Register />
                </MemoryRouter>
            </MockToastProvider>
        );

        expect(screen.getByRole('heading', { name: /create your corehub account/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
    });

    it('updates input fields correctly', async () => {
        const user = userEvent.setup();
        render(
            <MockToastProvider>
                <MemoryRouter>
                    <Register />
                </MemoryRouter>
            </MockToastProvider>
        );

        const nameInput = screen.getByLabelText(/username/i) as HTMLInputElement;
        const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
        const passwordInput = screen.getByLabelText(/^password/i) as HTMLInputElement;

        await user.type(nameInput, 'Test User');
        await user.type(emailInput, 'test@example.com');
        await user.type(passwordInput, 'password123');

        expect(nameInput.value).toBe('Test User');
        expect(emailInput.value).toBe('test@example.com');
        expect(passwordInput.value).toBe('password123');
    });

    it('shows error when submitting empty form', async () => {
        render(
            <MockToastProvider>
                <MemoryRouter>
                    <Register />
                </MemoryRouter>
            </MockToastProvider>
        );

        const submitButton = screen.getByRole('button', { name: /register/i });
        // UserEvent click might not trigger if form validation somehow prevents it or structure issues
        // Using fireEvent.submit directly on form to ensure handler is called
        fireEvent.submit(submitButton.closest('form')!);

        // Register validation happens immediately, no timeout needed for client-side validation errors
        // But let's check if there are error messages rendered in DOM, as Register.test.tsx original code implied Toast.
        // Looking at Register.tsx, it sets `errors` state which renders error messages below inputs.
        // It DOES NOT use toast for validation errors initially?
        // Let's check `Register.tsx`:
        /*
            if (hasError) {
                setIsLoading(false);
                return;
            }
        */
        // It does NOT call showToast for validation errors. It renders them in `<p ...>{errors...}</p>`.

        // So expectation should be:
        await waitFor(() => {
            expect(screen.getByText(/enter a username/i)).toBeInTheDocument();
        });
        expect(mockShowToast).not.toHaveBeenCalled();
    });

    it('navigates to login page when clicking sign in link', () => {
        render(
            <MockToastProvider>
                <MemoryRouter>
                    <Register />
                </MemoryRouter>
            </MockToastProvider>
        );

        const signInLink = screen.getByRole('link', { name: /Already have an account\? Login/i });
        expect(signInLink).toHaveAttribute('href', '/login');
    });
});
