'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/lib/api/services/authService';
import { getErrorMessage } from '@/lib/errorUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { AuthVisualSection } from '@/components/auth/AuthVisualSection';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { useGoogleLogin } from '@react-oauth/google';

const GoogleIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
);

const emailRegisterSchema = z.object({
    email: z.string().email("Please provide a valid email address"),
    password: z.string()
        .min(8, "Password must be at least 8 characters long")
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            "Password must contain at least one uppercase letter, one lowercase letter, and one number"
        ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    firstName: z.string().min(2, "First Name must be at least 2 characters"),
    lastName: z.string().min(2, "Last Name must be at least 2 characters"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

const ssoRegisterSchema = z.object({
    firstName: z.string().min(2, "First Name must be at least 2 characters"),
    lastName: z.string().min(2, "Last Name must be at least 2 characters"),
});

type EmailRegisterFormValues = z.infer<typeof emailRegisterSchema>;
type SSORegisterFormValues = z.infer<typeof ssoRegisterSchema>;

export default function RegisterPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showNameForm, setShowNameForm] = useState(false);
    const [pendingToken, setPendingToken] = useState<{ type: 'google', token: string } | null>(null);
    const { login } = useAuth();

    const emailForm = useForm<EmailRegisterFormValues>({
        resolver: zodResolver(emailRegisterSchema),
        defaultValues: {
            email: '',
            password: '',
            confirmPassword: '',
            firstName: '',
            lastName: '',
        },
    });

    const ssoForm = useForm<SSORegisterFormValues>({
        resolver: zodResolver(ssoRegisterSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
        },
    });

    const googleRegister = useGoogleLogin({
        onSuccess: (tokenResponse) => {
            void (async () => {
                setPendingToken({ type: 'google', token: tokenResponse.access_token });
                setShowNameForm(true);
            })();
        },
        onError: () => {
            toast.error('Google Registration Failed');
        }
    });

    const onEmailRegisterSubmit = async (data: EmailRegisterFormValues) => {
        setIsLoading(true);
        try {
            const response = await authService.register(data);
            const { accessToken, refreshToken, user } = response.data;
            login(accessToken, refreshToken, user);
            toast.success("Registration successful! Welcome to SerenAI.");
        } catch (err) {
            console.error(err);
            toast.error(getErrorMessage(err, 'Registration failed. Email may already be in use.'));
        } finally {
            setIsLoading(false);
        }
    };

    const onSSORegisterSubmit = async (data: SSORegisterFormValues) => {
        if (!pendingToken) {
            toast.error("Please select a sign-in method first");
            return;
        }

        setIsLoading(true);
        try {
            const response = await authService.googleSSORegister(
                pendingToken.token,
                data.firstName,
                data.lastName
            );

            const { accessToken, refreshToken, user } = response.data;
            login(accessToken, refreshToken, user);
            toast.success("Registration successful! Welcome to SerenAI.");
        } catch (err) {
            console.error(err);
            toast.error(getErrorMessage(err, 'Registration failed. Email may already be in use.'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left side - Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-background">
                <div className="w-full max-w-md space-y-8 animate-fade-in-up">
                    {/* Logo/Brand */}
                    <div className="space-y-2">
                        <Link href="/" className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity">
                             <Image
                                src="/logo.png"
                                alt="SerenAI Logo"
                                width={32}
                                height={32}
                                className="w-8 h-8"
                            />
                            <span className="text-xl font-bold text-primary">SerenAI</span>
                        </Link>
                    </div>

                    {/* Header */}
                    <div className="space-y-2">
                        <h1 className="text-4xl font-bold tracking-tight">Create an account</h1>
                        <p className="text-muted-foreground text-lg">
                            Start building intelligent chatbots today
                        </p>
                    </div>

                    {!showNameForm ? (
                        <>
                            {/* Email/Password Registration Form */}
                            <Form {...emailForm}>
                                <form onSubmit={(e) => { void emailForm.handleSubmit(onEmailRegisterSubmit)(e); }} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={emailForm.control}
                                            name="firstName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>First Name</FormLabel>
                                                    <div className="relative">
                                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                        <FormControl>
                                                            <Input
                                                                placeholder="John"
                                                                className="h-12 pl-10"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                    </div>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={emailForm.control}
                                            name="lastName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Last Name</FormLabel>
                                                    <div className="relative">
                                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                        <FormControl>
                                                            <Input
                                                                placeholder="Doe"
                                                                className="h-12 pl-10"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                    </div>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <FormField
                                        control={emailForm.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                    <FormControl>
                                                        <Input
                                                            type="email"
                                                            placeholder="Enter your email"
                                                            className="h-12 pl-10"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={emailForm.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Password</FormLabel>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                    <FormControl>
                                                        <Input
                                                            type={showPassword ? "text" : "password"}
                                                            placeholder="Create a password"
                                                            className="h-12 pl-10 pr-10"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                                    >
                                                        {showPassword ? (
                                                            <EyeOff className="h-4 w-4" />
                                                        ) : (
                                                            <Eye className="h-4 w-4" />
                                                        )}
                                                    </button>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={emailForm.control}
                                        name="confirmPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Confirm Password</FormLabel>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                    <FormControl>
                                                        <Input
                                                            type={showConfirmPassword ? "text" : "password"}
                                                            placeholder="Confirm your password"
                                                            className="h-12 pl-10 pr-10"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                                    >
                                                        {showConfirmPassword ? (
                                                            <EyeOff className="h-4 w-4" />
                                                        ) : (
                                                            <Eye className="h-4 w-4" />
                                                        )}
                                                    </button>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button
                                        type="submit"
                                        className="w-full h-12"
                                        disabled={isLoading}
                                        variant="gradient"
                                        size="lg"
                                    >
                                        {isLoading ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                                                Creating account...
                                            </>
                                        ) : (
                                            'Create account'
                                        )}
                                    </Button>
                                </form>
                            </Form>

                            {/* Divider */}
                            {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="bg-background px-4 text-muted-foreground">
                                            Or continue with
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* SSO Buttons */}
                            {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
                                <div className="space-y-4">
                                    <div className="w-full">
                                        <Button
                                            variant="outline"
                                            className="w-full h-12 flex items-center justify-center gap-2"
                                            onClick={() => googleRegister()}
                                            disabled={isLoading}
                                            type="button"
                                        >
                                            <GoogleIcon />
                                            <span>Sign up with Google</span>
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            {/* SSO Name Form */}
                            <Form {...ssoForm}>
                                <form onSubmit={(e) => { void ssoForm.handleSubmit(onSSORegisterSubmit)(e); }} className="space-y-4">
                                    <div className="space-y-4">
                                        <p className="text-sm text-muted-foreground">
                                            Please provide your name to complete registration
                                        </p>

                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField
                                                control={ssoForm.control}
                                                name="firstName"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>First Name</FormLabel>
                                                        <div className="relative">
                                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                            <FormControl>
                                                                <Input
                                                                    placeholder="John"
                                                                    className="h-12 pl-10"
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                        </div>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={ssoForm.control}
                                                name="lastName"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Last Name</FormLabel>
                                                        <div className="relative">
                                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                            <FormControl>
                                                                <Input
                                                                    placeholder="Doe"
                                                                    className="h-12 pl-10"
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                        </div>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="flex-1 h-12"
                                            onClick={() => {
                                                setShowNameForm(false);
                                                setPendingToken(null);
                                                ssoForm.reset();
                                            }}
                                            disabled={isLoading}
                                        >
                                            Back
                                        </Button>
                                        <Button
                                            type="submit"
                                            className="flex-1 h-12"
                                            disabled={isLoading}
                                            variant="gradient"
                                            size="lg"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                                                    Creating...
                                                </>
                                            ) : (
                                                'Complete Registration'
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </>
                    )}

                    {/* Footer */}
                    <div className="space-y-4">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-background px-4 text-muted-foreground">
                                    Already have an account?
                                </span>
                            </div>
                        </div>

                        <Link href="/auth/login" className="block">
                            <Button variant="outline" className="w-full h-12" type="button">
                                Sign in instead
                            </Button>
                        </Link>
                    </div>

                    <p className="text-xs text-center text-muted-foreground">
                        By creating an account, you agree to our{' '}
                        <Link href="#" className="underline hover:text-primary">Terms</Link>
                        {' '}and{' '}
                        <Link href="#" className="underline hover:text-primary">Privacy Policy</Link>
                    </p>
                </div>
            </div>

            {/* Right side - Visual */}
            <AuthVisualSection
                title="Start your AI journey today"
                description="Get started with our free plan. No credit card required."
            />
        </div>
    );
}
