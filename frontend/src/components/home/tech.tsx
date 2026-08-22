import React from 'react'; // Removed unnecessary useState
import { Terminal, Sparkles, ArrowRight, Zap, Code2, Database, Cloud, Cpu, Layers } from 'lucide-react';
import './TechStack.css';

const TechStackShowcase = () => {
    // LOGIC UPDATE: Removed 'hoveredTech' state. 
    // We let CSS handle the hover effects for zero-js overhead on animations.

    const technologies = [
        {
            id: 1,
            name: "React & TypeScript",
            category: "Frontend",
            description: "Building type-safe, component-driven interfaces. React's declarative nature paired with TypeScript's static typing creates a robust foundation.",
            why: "Compile-time error catching and superior IDE support.",
            icon: Code2
        },
        {
            id: 2,
            name: "Node.js & Express",
            category: "Backend",
            description: "Handling server-side logic with JavaScript's async capabilities. Express keeps things minimal while offering complete control.",
            why: "Unified language stack for faster shipping.",
            icon: Terminal
        },
        {
            id: 3,
            name: "MongoDB",
            category: "Database",
            description: "Document-based storage mirroring JSON. Flexible schemas allow data structures to evolve without painful migrations.",
            why: "Aggregation pipelines are powerful for analytics.",
            icon: Database
        },
        {
            id: 4,
            name: "Redis",
            category: "Caching",
            description: "In-memory data store for sub-millisecond reads. Used for session management, rate limiting, and caching hot data.",
            why: "Essential for reducing database load.",
            icon: Zap
        },
        {
            id: 5,
            name: "Tailwind CSS",
            category: "Styling",
            description: "Utility-first engine for rapid UI development. Keeps styling collocated with markup for better maintainability.",
            why: "Constraint-based design system out of the box.",
            icon: Sparkles
        },
        {
            id: 6,
            name: "AWS S3",
            category: "Storage",
            description: "Object storage for assets and backups. Scales infinitely and integrates with CloudFront for global distribution.",
            why: "Battle-tested reliability.",
            icon: Cloud
        }
    ];

    return (
        <div className="tech-container">
            <div className="tech-wrapper">

                {/* --- HEADER --- */}
                <header className="tech-header">
                    <div className="tech-badge">
                        <Cpu size={14} />
                        <span>SYSTEM ARCHITECTURE</span>
                    </div>

                    <h1 className="tech-title">
                        <span>Engineering & Development</span>
                        <span className="highlight" data-text="Excellence">Excellence</span>
                    </h1>

                    {/* COPYWRITING UPDATE: Professional, High-End Tone */}
                    <p className="tech-subtitle">
                        See how we built this. Every single component is crafted with intention and attention to detail. This stack was not chosen for hype, but for 
                        <span style={{color: '#fff'}}> reliability, scalability, and developer experience.</span>
                    </p>
                    <p className="tech-subtitle" style={{marginTop: '1rem'}}>
                        We studied the market leaders and re-engineered the process to ensure a unique, seamless customer journey.
                    </p>
                    
                    <br />
                    <span className="tech-subtitle" style={{fontSize: '0.8rem', opacity: 0.6}}>
                        // FOR EDUCATIONAL PURPOSES
                    </span>
                    
                </header>


                {/* --- STATS --- */}
                <div className="stats-bar">
                    <div className="stat-item">
                        <div className="pulse-dot"></div>
                        <span>System Operational</span>
                    </div>
                    <div className="stat-item">
                        <Layers size={14} />
                        <span>Full-Stack MERN</span>
                    </div>
                </div>

                {/* --- GRID --- */}
                <div className="tech-grid">
                    {technologies.map((tech) => {
                        const Icon = tech.icon;
                        return (
                            <div key={tech.id} className="tech-card">
                                <div className="card-header">
                                    <div className="tech-icon-box">
                                        <Icon size={24} strokeWidth={1.5} />
                                    </div>
                                    <span className="tech-category">{tech.category}</span>
                                </div>

                                <h3 className="tech-name">{tech.name}</h3>
                                <p className="tech-description">{tech.description}</p>

                                <div className="tech-why">
                                    <strong>Why?</strong> {tech.why}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* --- ARCHITECTURE --- */}
                <section className="architecture-section">
                    <div className="arch-info">
                        <h2>Data Flow</h2>
                        <p className="tech-description">
                            A unidirectional data flow ensures predictability. The frontend consumes APIs,
                            the backend processes logic, and the database stores truth.
                        </p>
                    </div>

                    <div className="arch-diagram">
                        {[
                            { from: "Client", to: "React + Vite Bundle", icon: Code2 },
                            { from: "Gateway", to: "Node.js Express API", icon: Terminal },
                            { from: "Persistence", to: "MongoDB Atlas", icon: Database },
                        ].map((step, i) => (
                            <div key={i} className="flow-step">
                                <span className="step-label">{step.from}</span>
                                <ArrowRight className="step-arrow animated-arrow" size={16} />
                                <span className="step-content">{step.to}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* --- PHILOSOPHY --- */}
                <section className="philosophy-grid">
                    {[
                        { title: "Simplicity", desc: "Complexity is the enemy of reliability." },
                        { title: "Type Safety", desc: "Catch errors at compile time, not runtime." },
                        { title: "Performance", desc: "Speed is a feature." }
                    ].map((p, i) => (
                        <div key={i} className="philosophy-item">
                            <div className="philosophy-number">0{i + 1}</div>
                            <h3>{p.title}</h3>
                            <p className="tech-description">{p.desc}</p>
                        </div>
                    ))}
                </section>

            </div>
        </div>
    );
};

export default TechStackShowcase;