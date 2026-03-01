export function Button({
    children,
    onClick,
    variant = 'primary',
    className = ""
}: {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
    className?: string;
}) {
    const baseStyle = "px-6 py-3 tracking-widest text-[0.65rem] uppercase transition-all duration-300 font-light w-full flex items-center justify-center";
    const variants = {
        primary: "bg-white text-black hover:bg-transparent hover:text-white border border-white focus:outline-none",
        secondary: "bg-[#1A1A1A] text-white hover:bg-[#2A2A2A] border border-transparent focus:outline-none",
        outline: "border border-white/20 text-white hover:bg-white hover:text-black hover:border-white focus:outline-none"
    };

    return (
        <button onClick={onClick} className={`${baseStyle} ${variants[variant]} ${className}`}>
            {children}
        </button>
    );
}
