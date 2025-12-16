
import ActivityCards from './ActivityCards';

export default function Dashboard() {
    return (
        <div className="lg:col-span-9 flex flex-col gap-6">
            <section className="flex-1 min-h-[400px] bg-white border border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center relative overflow-hidden shadow-sm group">
                <div
                    className="absolute inset-0 opacity-[0.03] pointer-events-none"
                    style={{
                        backgroundImage: `radial-gradient(
                circle at 1px 1px,
                currentColor 1px,
                transparent 0
              )`,
                        backgroundSize: '24px 24px',
                    }}
                ></div>
                <div className="z-10 text-center transform transition-transform duration-500 group-hover:scale-[1.02]">
                    <h2 className="text-[8rem] sm:text-[10rem] md:text-[12rem] leading-none font-mono font-bold text-primary tracking-tighter">
                        18:33
                    </h2>
                    <div className="mt-4 space-y-2">
                        <p className="text-xl md:text-2xl font-medium text-gray-900">
                            Sunday, 14 December 2025
                        </p>
                        <div className="flex items-center justify-center gap-2 text-gray-500 font-light">
                            <span className="material-icons-outlined text-lg">location_on</span>
                            <span>Gang Biola, 12150, Jakarta Selatan, Indonesia</span>
                        </div>
                    </div>
                </div>
            </section>

            <section>
                <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                    Your Activity
                    <span className="h-px bg-gray-200 flex-1 ml-2"></span>
                </h3>
                <ActivityCards />
            </section>
        </div>
    );
}
