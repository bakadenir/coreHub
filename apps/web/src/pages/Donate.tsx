
import { Link } from 'react-router-dom';
import Header from '../components/Header';

export default function Donate() {
    return (
        <div className="flex flex-col min-h-screen bg-background-light font-sans text-text-primary">
            <Header subtitle="Donate" />

            <main className="w-full max-w-4xl mx-auto px-6 md:px-12 py-12 flex-grow">

                {/* Back to Dashboard Control */}
                <div className="mb-8">
                    <Link
                        to="/dashboard"
                        className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors hover:translate-x-[-4px] duration-200"
                    >
                        <span className="material-icons-outlined text-base">arrow_back</span>
                        Back to Dashboard
                    </Link>
                </div>

                <header className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 text-text-primary">Donate</h1>
                    <div className="space-y-4 text-lg text-text-secondary max-w-2xl leading-relaxed">
                        <p>
                            Thank you for using <strong className="text-text-primary font-semibold">coreHub</strong>.
                        </p>
                        <p>
                            Your donation is appreciated and will ensure the future development of coreHub.
                            Donations directly support hardware, software updates, hosting fees, and other operational costs that keep the lights on.
                        </p>
                        <p>
                            Thank you for your continued support,
                            <br />
                            <span className="font-mono text-sm text-gray-500 mt-2 block">— Deni Romadhon</span>
                        </p>
                    </div>
                </header>

                {/* Donation Options */}
                <section className="mb-16 grid gap-4 sm:flex sm:items-center sm:gap-6 flex-wrap">
                    {/* PayPal */}
                    <a href="#" className="group relative flex items-center justify-center px-8 py-4 bg-[#FFC439] hover:bg-[#F4B400] text-black font-bold rounded-lg transition-all shadow-sm hover:shadow-md w-full sm:w-auto min-w-[200px] overflow-hidden">
                        <span className="absolute inset-0 bg-white/20 group-hover:bg-transparent transition-colors"></span>
                        <span className="italic font-display mr-2 relative z-10">Donate with</span>
                        <span className="font-extrabold italic text-xl relative z-10 text-[#003087]">Pay</span>
                        <span className="font-extrabold italic text-xl relative z-10 text-[#009cde]">Pal</span>
                    </a>

                    {/* Card */}
                    <a href="#" className="group flex items-center justify-center px-8 py-4 bg-black text-white font-medium rounded-lg border border-transparent hover:bg-gray-800 transition-all shadow-sm hover:shadow-md w-full sm:w-auto min-w-[200px] gap-3">
                        <span className="uppercase tracking-wide">Donate with Card</span>
                        <span className="material-icons-outlined text-xl">credit_card</span>
                    </a>

                    {/* Bank Jago */}
                    <a href="#" className="group flex items-center justify-center px-8 py-4 bg-[#FB8B01] hover:bg-[#E07A00] text-white font-medium rounded-lg border border-transparent transition-all shadow-sm hover:shadow-md w-full sm:w-auto min-w-[200px] gap-3">
                        <span className="uppercase tracking-wide">Bank Jago</span>
                        <span className="material-icons-outlined text-xl">account_balance_wallet</span>
                    </a>
                </section>

                <hr className="border-border-light mb-12" />

                {/* Donation History */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                            <span className="material-icons-outlined text-gray-400">history</span>
                            Donation History
                        </h2>
                        <div className="text-xs font-mono text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-200">
                            LIVE FEED
                        </div>
                    </div>
                    <div className="overflow-x-auto rounded-lg border border-border-light bg-white shadow-sm">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 border-b border-border-light">
                                <tr>
                                    <th className="py-3 px-6 text-xs font-mono uppercase tracking-wider text-gray-500 w-48">Date</th>
                                    <th className="py-3 px-6 text-xs font-mono uppercase tracking-wider text-gray-500">Comment</th>
                                    <th className="py-3 px-6 text-xs font-mono uppercase tracking-wider text-gray-500 text-right w-32">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-light text-sm">
                                {[
                                    { date: '16 Dec 2025', comment: 'thank you for lovely +brilliant tool', amount: '$5.00 USD' },
                                    { date: '16 Dec 2025', comment: "After many years of use, I still claim that it's one of the best tools of any kind. It's the best. Many, many thanks!", amount: '$50.00 USD' },
                                    { date: '16 Dec 2025', comment: 'Hallo. Ich bin der Dicke und spende auch.', amount: '€10.00 EUR', italic: true },
                                    { date: '16 Dec 2025', comment: 'Ich hoffe der Dicke spendet auch.', amount: '€10.00 EUR', italic: true },
                                    { date: '16 Dec 2025', comment: 'No comment', amount: '$2.00 USD', muted: true },
                                    { date: '15 Dec 2025', comment: "I've had this hidden gem installed for years but only recently figured out how to set it up properly and now it's absolutely mind-blowing. Thanks so much!", amount: '$10.00 USD' },
                                    { date: '15 Dec 2025', comment: 'I just discovered multi-file renaming, so useful, thank you!', amount: '$100.00 USD' },
                                    { date: '15 Dec 2025', comment: 'Great utility and meaning to get this done.', amount: '$25.00 USD' },
                                    { date: '14 Dec 2025', comment: "You've saved my bacon many times!", amount: '$25.00 USD' },
                                    { date: '14 Dec 2025', comment: 'Amazing tool. What Windows built-in search should\'ve been. Merry XMAS!', amount: '$10.00 USD' },
                                ].map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-50 transition-colors group">
                                        <td className="py-4 px-6 font-mono text-gray-500 whitespace-nowrap">{item.date}</td>
                                        <td className={`py-4 px-6 ${item.muted ? 'text-gray-400 italic text-xs' : 'text-gray-800'} ${item.italic && !item.muted ? 'italic' : ''} group-hover:text-black`}>
                                            {item.comment}
                                        </td>
                                        <td className="py-4 px-6 text-right font-mono font-medium text-gray-900">{item.amount}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-6 flex justify-center">
                        <button className="text-sm font-mono text-gray-500 hover:text-black transition-colors border border-border-light bg-white px-4 py-2 rounded hover:bg-gray-50">
                            Load more entries...
                        </button>
                    </div>
                </section>
            </main>

            <footer className="w-full border-t border-border-light py-8 text-center text-sm text-gray-500 font-mono mt-12 bg-gray-50">
                <p>© 2025 coreHub. All rights reserved. Code with <a href="https://github.com/bakadenir" target="_blank" rel="noopener noreferrer" className="hover:underline">bakadenir</a></p>
                <div className="mt-2 flex justify-center gap-4">
                    <a className="hover:text-black underline decoration-1 underline-offset-2" href="#">Privacy</a>
                    <a className="hover:text-black underline decoration-1 underline-offset-2" href="#">Terms</a>
                    <a className="hover:text-black underline decoration-1 underline-offset-2" href="#">Contact</a>
                </div>
            </footer>
        </div>
    );
}
