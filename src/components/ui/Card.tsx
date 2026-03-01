export function Card({ children, className = "", onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
    return (
        <div onClick={onClick} className={`border border-white/10 bg-[#121212]/50 p-6 backdrop-blur-sm transition-all hover:border-white/30 ${className}`}>
            {children}
        </div>
    );
}
