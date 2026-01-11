import { Users, Target, Award, Zap } from "lucide-react"

// Editable about data
const aboutData = {
    badge: "About Us",
    headline: "Building the Future of AI Communication",
    description: "We're on a mission to make AI-powered conversations accessible to everyone. Our platform empowers businesses to create intelligent chatbots that understand and engage with customers naturally.",

    stats: [
        {
            value: "10K+",
            label: "Active Users",
            icon: Users,
            color: "from-primary to-primary-light"
        },
        {
            value: "1M+",
            label: "Messages Processed",
            icon: Zap,
            color: "from-primary-light to-success"
        },
        {
            value: "99.9%",
            label: "Uptime",
            icon: Award,
            color: "from-success to-warning"
        },
        {
            value: "50+",
            label: "Countries",
            icon: Target,
            color: "from-warning to-destructive"
        },
    ],

    values: [
        {
            title: "Innovation First",
            description: "We continuously push the boundaries of what's possible with AI technology.",
            icon: Zap,
            gradient: "from-primary to-primary-light"
        },
        {
            title: "User-Centric",
            description: "Every feature we build is designed with our users' needs at the forefront.",
            icon: Users,
            gradient: "from-primary-light to-success"
        },
        {
            title: "Excellence",
            description: "We're committed to delivering the highest quality products and services.",
            icon: Award,
            gradient: "from-success to-warning"
        },
        {
            title: "Transparency",
            description: "We believe in open communication and honest relationships with our users.",
            icon: Target,
            gradient: "from-warning to-primary"
        },
    ],

    team: {
        headline: "Meet the Team",
        description: "We're a diverse team of engineers, designers, and AI researchers passionate about making technology more human.",
    }
}

export function About() {
    return (
        <section id="about" className="py-24 md:py-32 bg-muted/30 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
            </div>

            <div className="container px-4 md:px-6">
                {/* Header */}
                <div className="flex flex-col items-center justify-center text-center space-y-4 mb-16">
                    <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary mb-4">
                        {aboutData.badge}
                    </div>
                    <h2 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl max-w-4xl">
                        <span className="text-foreground">
                            {aboutData.headline}
                        </span>
                    </h2>
                    <p className="max-w-[800px] text-lg md:text-xl text-muted-foreground">
                        {aboutData.description}
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-24">
                    {aboutData.stats.map((stat, idx) => (
                        <div
                            key={idx}
                            className="group relative"
                        >
                            {/* Gradient glow */}
                            <div className={`absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-500`}></div>

                            {/* Card */}
                            <div className="relative bg-card border border-border rounded-2xl p-6 text-center hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                                    <stat.icon className="w-6 h-6 text-primary" />
                                </div>
                                <div className="text-4xl font-bold mb-2 text-foreground">
                                    {stat.value}
                                </div>
                                <div className="text-sm text-muted-foreground font-medium">
                                    {stat.label}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Values */}
                <div className="mb-24">
                    <h3 className="text-3xl font-bold text-center mb-12">
                        Our Core Values
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        {aboutData.values.map((value, idx) => (
                            <div
                                key={idx}
                                className="group relative"
                            >
                                {/* Gradient glow */}
                                <div className={`absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-500`}></div>

                                {/* Card */}
                                <div className="relative bg-card border border-border rounded-2xl p-8 hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                                    {/* Icon */}
                                    <div className={`w-14 h-14 rounded-xl bg-primary/10 p-[2px] mb-5 group-hover:scale-110 transition-transform duration-300`}>
                                        <div className="w-full h-full bg-card rounded-[10px] flex items-center justify-center">
                                            <value.icon className="w-6 h-6 text-primary group-hover:text-primary-light transition-colors duration-300" />
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <h4 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors duration-300">
                                        {value.title}
                                    </h4>
                                    <p className="text-muted-foreground leading-relaxed">
                                        {value.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>


            </div>
        </section>
    )
}
