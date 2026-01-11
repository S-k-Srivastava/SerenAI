"use client"

import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Check, Sparkles, Zap, Rocket, AlertCircle, ChevronLeft, ChevronRight, Share2, FileText, Bot, TrendingUp, Type } from "lucide-react"
import { planService } from "@/lib/api/services/planService"
import { IPlan } from "@/types/plan"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"

const getPlanIcon = (name: string, index: number) => {
    const n = name.toLowerCase();
    if (n.includes('free') || n.includes('basic') || index === 0)
        return { icon: Sparkles, color: "text-blue-500", bg: "bg-blue-500/10", gradient: "from-blue-500/20 to-blue-600/20" };
    if (n.includes('pro') || n.includes('standard') || index === 1)
        return { icon: Zap, color: "text-primary", bg: "bg-primary/10", gradient: "from-primary/20 to-purple-600/20" };
    return { icon: Rocket, color: "text-emerald-500", bg: "bg-emerald-500/10", gradient: "from-emerald-500/20 to-teal-600/20" };
}

export function Pricing() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const { user } = useAuth();
    const router = useRouter();

    const handlePlanClick = (plan: IPlan) => {
        const params = new URLSearchParams({
            create: "true",
            subject: `Buying Plan: ${plan.name}`,
            body: `I am interested in subscribing to the ${plan.name} plan.\n\nPlan ID: ${plan._id}\n\nPlease help me valid this purchase.`
        });
        const queryString = params.toString();

        if (user) {
            router.push(`/help?${queryString}`);
        } else {
            // Encode the redirect URL to ensure query params are preserved
            const redirectUrl = encodeURIComponent(`/help?${queryString}`);
            router.push(`/auth/login?redirect=${redirectUrl}`);
        }
    };

    const { data: plans, isLoading, isError } = useQuery({
        queryKey: ["public-plans"],
        queryFn: () => planService.getPublicPlans(),
        staleTime: 1000 * 60 * 15,
    });

    const handleNext = () => {
        if (isAnimating || !plans) return;
        setIsAnimating(true);
        setCurrentIndex((prev) => (prev + 1) % plans.length);
        setTimeout(() => setIsAnimating(false), 500);
    };

    const handlePrev = () => {
        if (isAnimating || !plans) return;
        setIsAnimating(true);
        setCurrentIndex((prev) => (prev - 1 + plans.length) % plans.length);
        setTimeout(() => setIsAnimating(false), 500);
    };

    // Get visible cards (3 at a time in carousel)
    const getVisiblePlans = () => {
        if (!plans || plans.length === 0) return [];
        if (plans.length === 1) return [plans[0]];
        if (plans.length === 2) return [...plans, plans[0]]; // Duplicate first for 3 cards

        const prev = (currentIndex - 1 + plans.length) % plans.length;
        const next = (currentIndex + 1) % plans.length;
        return [plans[prev], plans[currentIndex], plans[next]];
    };

    const visiblePlans = getVisiblePlans();
    const canNavigate = plans && plans.length > 1;

    return (
        <section id="pricing" className="py-20 md:py-32 bg-gradient-to-b from-background via-muted/10 to-background relative overflow-hidden">
            {/* Enhanced Background Effects */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-primary/10 via-purple-500/5 to-transparent rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-blue-500/10 via-cyan-500/5 to-transparent rounded-full blur-[120px] animate-pulse delay-1000" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary/5 to-blue-500/5 rounded-full blur-[150px]" />
            </div>

            <div className="container mx-auto px-4 md:px-6">
                {/* Header */}
                <motion.div
                    className="text-center mb-20 space-y-4 relative z-10"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="inline-flex items-center gap-2">
                        <Badge variant="outline" className="px-4 py-1.5 text-sm font-medium border-primary/30 text-primary bg-primary/5 backdrop-blur-sm">
                            💎 Simple Pricing
                        </Badge>
                    </div>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight bg-gradient-to-br from-foreground via-foreground to-foreground/70 bg-clip-text">
                        Choose Your Perfect Plan
                    </h2>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                        {isLoading
                            ? "Loading plans..."
                            : "Transparent pricing. No hidden fees. Start free, scale as you grow."
                        }
                    </p>
                </motion.div>

                {/* Pricing Cards */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {[1, 2, 3].map((i) => (
                            <Card key={i} className="p-8 space-y-6 bg-card/50 backdrop-blur">
                                <Skeleton className="w-16 h-16 rounded-2xl" />
                                <Skeleton className="h-8 w-3/4" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-16 w-2/3" />
                                <div className="space-y-3">
                                    {[1, 2, 3, 4, 5].map((f) => <Skeleton key={f} className="h-4 w-full" />)}
                                </div>
                                <Skeleton className="h-12 w-full rounded-xl" />
                            </Card>
                        ))}
                    </div>
                ) : isError ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 border-2 border-dashed rounded-3xl bg-destructive/5 border-destructive/20 max-w-lg mx-auto backdrop-blur-sm">
                        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                            <AlertCircle className="w-8 h-8 text-destructive" />
                        </div>
                        <h3 className="text-xl font-bold">Failed to load plans</h3>
                        <p className="text-muted-foreground">Please try again later or contact support.</p>
                    </div>
                ) : (
                    <div className="relative max-w-7xl mx-auto">
                        {/* Navigation Buttons */}
                        {canNavigate && (
                            <>
                                <button
                                    onClick={handlePrev}
                                    disabled={isAnimating}
                                    className="absolute -left-4 md:left-0 lg:-left-16 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-full bg-background/80 backdrop-blur-xl border-2 border-border shadow-2xl flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary hover:scale-110 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
                                    aria-label="Previous plan"
                                >
                                    <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 group-hover:scale-110 transition-transform" />
                                </button>
                                <button
                                    onClick={handleNext}
                                    disabled={isAnimating}
                                    className="absolute -right-4 md:right-0 lg:-right-16 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-full bg-background/80 backdrop-blur-xl border-2 border-border shadow-2xl flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary hover:scale-110 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
                                    aria-label="Next plan"
                                >
                                    <ChevronRight className="w-5 h-5 md:w-6 md:h-6 group-hover:scale-110 transition-transform" />
                                </button>
                            </>
                        )}

                        {/* Cards Container - Carousel Style */}
                        <motion.div
                            className="relative py-8 lg:py-12 px-2 lg:px-4"
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            {/* Mobile & Tablet: Show only center card */}
                            <div className="block lg:hidden max-w-md mx-auto">
                                {plans && plans[currentIndex] && (
                                    <PricingCard
                                        key={plans[currentIndex]._id}
                                        plan={plans[currentIndex]}
                                        index={currentIndex}
                                        isHighlighted={true}
                                        position="center"
                                        isAnimating={isAnimating}
                                        onPlanClick={handlePlanClick}
                                    />
                                )}
                            </div>

                            {/* Desktop: Show 3 cards */}
                            <div className="hidden lg:grid lg:grid-cols-3 gap-2 items-center">
                                {visiblePlans.map((plan, idx) => {
                                    const isCenter = idx === 1;
                                    const position = idx === 0 ? 'left' : idx === 2 ? 'right' : 'center';

                                    return (
                                        <PricingCard
                                            key={plan._id}
                                            plan={plan}
                                            index={plans?.indexOf(plan) ?? idx}
                                            isHighlighted={isCenter}
                                            position={position}
                                            isAnimating={isAnimating}
                                            onPlanClick={handlePlanClick}
                                        />
                                    );
                                })}
                            </div>
                        </motion.div>

                        {/* Indicator Dots */}
                        {canNavigate && plans && plans.length > 1 && (
                            <div className="flex justify-center gap-2 mt-8">
                                {plans.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            if (!isAnimating) {
                                                setIsAnimating(true);
                                                setCurrentIndex(idx);
                                                setTimeout(() => setIsAnimating(false), 500);
                                            }
                                        }}
                                        className={`h-2 rounded-full transition-all duration-300 ${
                                            idx === currentIndex
                                                ? 'w-8 bg-primary'
                                                : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                                        }`}
                                        aria-label={`Go to plan ${idx + 1}`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </section>
    )
}

interface PricingCardProps {
    plan: IPlan;
    index: number;
    isHighlighted?: boolean;
    position?: 'left' | 'center' | 'right';
    isAnimating?: boolean;
    onPlanClick: (plan: IPlan) => void;
}

function PricingCard({ plan, index, isHighlighted = false, position = 'center', onPlanClick }: PricingCardProps) {
    const { icon: Icon, color: iconColor, bg: iconBg } = getPlanIcon(plan.name, index);
    const hasDiscount = plan.discountPercentage > 0;
    const discountedPrice = hasDiscount
        ? Math.round(plan.price * (1 - plan.discountPercentage / 100))
        : plan.price;

    // Z-index based on position
    const zIndexClass = isHighlighted ? 'z-20' : 'z-10';

    // Animation based on position
    const getAnimationProps = () => {
        if (position === 'left') {
            return { x: -20, scale: 0.95 };
        } else if (position === 'right') {
            return { x: 20, scale: 0.95 };
        }
        return { x: 0, scale: 1.05 };
    };

    return (
        <motion.div
            className={`relative ${zIndexClass}`}
            layout
            initial={false}
            animate={{
                ...getAnimationProps(),
                opacity: 1,
            }}
            transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                duration: 0.5,
            }}
        >
            {/* Discount Badge - Top Right */}
            {hasDiscount && (
                <div className="absolute -top-3 -right-3 z-30">
                    <Badge className="bg-green-600 text-white px-4 py-2 text-sm font-bold shadow-xl border-0 flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5" />
                        {plan.discountPercentage}% OFF
                    </Badge>
                </div>
            )}

            {/* Card */}
            <Card className={`relative overflow-hidden p-6 md:p-8 h-auto md:h-[700px] flex flex-col transition-all duration-500 group hover:shadow-2xl rounded-2xl md:rounded-3xl ${
                isHighlighted
                    ? 'border-2 border-primary shadow-2xl shadow-primary/20 bg-card'
                    : 'border border-border/50 hover:border-primary/50 bg-card backdrop-blur-sm'
            }`}>
                {/* Icon */}
                <div className={`relative w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl ${iconBg} flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <Icon className={`w-6 h-6 md:w-8 md:h-8 ${iconColor}`} />
                </div>

                {/* Name & Description */}
                <h3 className="text-xl md:text-2xl font-bold mb-2 group-hover:text-primary transition-colors">{plan.name}</h3>
                <p className="text-muted-foreground text-xs md:text-sm mb-4 md:mb-6 line-clamp-2 leading-relaxed">{plan.description}</p>

                {/* Price Section */}
                <div className="mb-3 md:mb-4 pb-3 md:pb-4 border-b border-border/50">
                    {hasDiscount && (
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm md:text-base text-muted-foreground/50 line-through decoration-2 decoration-red-500/50">
                                {plan.currency === "USD" ? "$" : "₹"}{plan.price}
                            </span>
                        </div>
                    )}
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl md:text-4xl lg:text-5xl font-bold">
                            {plan.currency === "USD" ? "$" : "₹"}{discountedPrice}
                        </span>
                        <span className="text-muted-foreground text-xs md:text-sm">
                            / {plan.duration === 30 ? "mo" : `${plan.duration}d`}
                        </span>
                    </div>
                    {plan.discountOfferTitle && (
                        <p className="text-xs text-green-600 dark:text-green-500 font-semibold mt-1">{plan.discountOfferTitle}</p>
                    )}
                </div>

                {/* Core Limits - Horizontal Layout */}
                <div className="grid grid-cols-2 gap-2 md:gap-3 mb-3 md:mb-4 pb-3 md:pb-4 border-b border-border">
                    <div className="flex flex-col items-center text-center group/item">
                        <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center mb-1 md:mb-1.5 group-hover/item:scale-110 transition-transform">
                            <Bot className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-500" />
                        </div>
                        <span className="text-lg md:text-xl font-bold text-primary">{plan.max_chatbot_count}</span>
                        <span className="text-[9px] md:text-[10px] text-muted-foreground mt-0.5">Chatbots</span>
                    </div>
                    <div className="flex flex-col items-center text-center group/item">
                        <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-purple-500/20 to-purple-600/20 flex items-center justify-center mb-1 md:mb-1.5 group-hover/item:scale-110 transition-transform">
                            <FileText className="w-3.5 h-3.5 md:w-4 md:h-4 text-purple-500" />
                        </div>
                        <span className="text-lg md:text-xl font-bold text-primary">{plan.max_document_count}</span>
                        <span className="text-[9px] md:text-[10px] text-muted-foreground mt-0.5">Documents</span>
                    </div>
                    <div className="flex flex-col items-center text-center group/item">
                        <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-orange-500/20 to-orange-600/20 flex items-center justify-center mb-1 md:mb-1.5 group-hover/item:scale-110 transition-transform">
                            <Share2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-orange-500" />
                        </div>
                        <span className="text-lg md:text-xl font-bold text-primary">{plan.max_chatbot_shares}</span>
                        <span className="text-[9px] md:text-[10px] text-muted-foreground mt-0.5">Shares</span>
                    </div>
                    <div className="flex flex-col items-center text-center group/item">
                        <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-pink-500/20 to-pink-600/20 flex items-center justify-center mb-1 md:mb-1.5 group-hover/item:scale-110 transition-transform">
                            <Type className="w-3.5 h-3.5 md:w-4 md:h-4 text-pink-500" />
                        </div>
                        <span className="text-lg md:text-xl font-bold text-primary">{plan.max_word_count_per_document}</span>
                        <span className="text-[9px] md:text-[10px] text-muted-foreground mt-0.5">Words/Doc</span>
                    </div>
                </div>

                {/* Features List */}
                <ul className="space-y-2 md:space-y-3 mb-6 md:mb-8 flex-grow overflow-y-auto max-h-[180px] md:max-h-[220px]">

                    {/* Public Chatbot Feature */}
                    {plan.is_public_chatbot_allowed && (
                        <li className="flex items-center gap-3 group/item">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-500/20 to-green-600/20 flex items-center justify-center flex-shrink-0 group-hover/item:scale-110 transition-transform">
                                <Check className="w-4 h-4 text-green-500" />
                            </div>
                            <span className="text-sm font-medium">Public Chatbot Sharing</span>
                        </li>
                    )}

                    {/* Benefits */}
                    {plan.benefits.map((benefit, i) => (
                        <li key={i} className="flex items-start gap-3 group/item">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/20 to-primary/30 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover/item:scale-110 transition-transform">
                                <Check className="w-4 h-4 text-primary" />
                            </div>
                            <span className="text-sm text-muted-foreground leading-relaxed">{benefit}</span>
                        </li>
                    ))}
                </ul>

                {/* CTA Button */}
                <div className="mt-auto pt-3 md:pt-4">
                    <Button
                        onClick={() => onPlanClick(plan)}
                        variant={isHighlighted ? "default" : "ghost-premium"}
                        size="lg"
                        className="w-full h-11 md:h-12 rounded-xl font-semibold text-sm md:text-base transition-all duration-300 hover:scale-105"
                    >
                        {plan.price === 0 ? "Start Free Trial" : "Get Started Now"}
                    </Button>
                </div>
            </Card>
        </motion.div>
    );
}
