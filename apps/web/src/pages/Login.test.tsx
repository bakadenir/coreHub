
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Login from '../pages/Login';
import { ToastContext } from '../context/ToastContext';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

// Mock the ToastContext
const mockShowToast = vi.fn();
const MockToastProvider = ({ children }: { children: React.ReactNode }) => (
    <ToastContext.Provider value={{ showToast: mockShowToast }}>
        {children}
    </ToastContext.Provider>
);

describe('Login Page', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.clearAllMocks();
    });

    it('renders login form correctly', () => {
        render(
            <MockToastProvider>
                <MemoryRouter>
                    <Login />
                </MemoryRouter>
            </MockToastProvider>
        );

        expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/email \/ username/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    });

    it('updates input fields correctly', () => {
        render(
            <MockToastProvider>
                <MemoryRouter>
                    <Login />
                </MemoryRouter>
            </MockToastProvider>
        );

        const emailInput = screen.getByLabelText(/email \/ username/i) as HTMLInputElement;
        const passwordInput = screen.getByLabelText(/^password/i) as HTMLInputElement;

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });

        expect(emailInput.value).toBe('test@example.com');
        expect(passwordInput.value).toBe('password123');
    });

    it('handles form submission with admin credentials', async () => {
        render(
            <MockToastProvider>
                <MemoryRouter>
                    <Login />
                </MemoryRouter>
            </MockToastProvider>
        );

        const emailInput = screen.getByLabelText(/email \/ username/i);
        const passwordInput = screen.getByLabelText(/^password/i);
        const submitButton = screen.getByRole('button', { name: /login/i });

        fireEvent.change(emailInput, { target: { value: 'admin@corehub.dev' } });
        fireEvent.change(passwordInput, { target: { value: 'admin123' } });

        await act(async () => {
            fireEvent.click(submitButton);
            vi.runAllTimers();
        });

        expect(mockShowToast).toHaveBeenCalledWith('Welcome back! Redirecting to admin...', 'success');
        expect(mockNavigate).toHaveBeenCalledWith('/admin');
    });

    it('handles form submission with user credentials', async () => {
        render(
            <MockToastProvider>
                <MemoryRouter>
                    <Login />
                </MemoryRouter>
            </MockToastProvider>
        );

        const emailInput = screen.getByLabelText(/email \/ username/i);
        const passwordInput = screen.getByLabelText(/^password/i);
        const submitButton = screen.getByRole('button', { name: /login/i });

        fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });

        await act(async () => {
            fireEvent.click(submitButton);
            vi.runAllTimers();
        });

        expect(mockShowToast).toHaveBeenCalledWith('Welcome back! Login successful.', 'success');
        expect(mockNavigate).toHaveBeenCalledWith('/');
    });
});

