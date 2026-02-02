import Link from "next/link";

export default function PrivacyPage() {
  const lastUpdated = "თებერვალი, 2026";

  return (
    <div className="bg-[#fafafa] min-h-screen text-black selection:bg-black selection:text-white p-8 md:p-24">
      <div className="max-w-3xl mx-auto space-y-12">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-5xl font-black tracking-tighter uppercase">
            Privacy Policy
          </h1>
          <p className="text-sm text-gray-400 font-bold uppercase tracking-[0.2em]">
            ბოლო განახლება: {lastUpdated}
          </p>
        </div>

        <div className="prose prose-neutral max-w-none space-y-10">
          <section className="space-y-4">
            <h2 className="text-xl font-black uppercase tracking-tight">
              1. მონაცემების შეგროვება
            </h2>
            <p className="text-gray-600 leading-relaxed font-medium">
              ვაგროვებ მხოლოდ იმ მონაცემებს, რაც აუცილებელია სერვისის
              მუშაობისთვის: თქვენი სახელი, ელ-ფოსტა და მაღაზიის ინფორმაცია,
              რომელსაც თავად მაწვდით.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black uppercase tracking-tight">
              2. როგორ ვიყენებ მონაცემებს
            </h2>
            <p className="text-gray-600 leading-relaxed font-medium">
              თქვენი მონაცემები გამოიყენება მხოლოდ თქვენი მაღაზიის სამართავად და
              AI აგენტის ფუნქციონირებისთვის, რათა მან შეძლოს კლიენტებთან სწორი
              კომუნიკაცია.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black uppercase tracking-tight">
              3. უსაფრთხოება
            </h2>
            <p className="text-gray-600 leading-relaxed font-medium">
              მონაცემები ინახება დაშიფრულ ბაზებში (Supabase). არასდროს გავყიდი
              თქვენს პირად ინფორმაციას მესამე მხარეზე.
            </p>
          </section>
          <section className="space-y-4">
            <h2 className="text-xl font-black uppercase tracking-tight">
              4. Cookies და ლოკალური მეხსიერება
            </h2>
            <p className="text-gray-600 leading-relaxed font-medium">
              საიტი იყენებს აუცილებელ Cookies და LocalStorage-ს თქვენი
              ავტორიზაციის სესიის შესანარჩუნებლად. ეს მონაცემები არ გამოიყენება
              რეკლამისთვის ან თვალთვალისთვის.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black uppercase tracking-tight">
              5. ცვლილებები პოლიტიკაში
            </h2>
            <p className="text-gray-600 leading-relaxed font-medium">
              ვინარჩუნებ უფლებას, პერიოდულად განვაახლო ეს პირობები.
              მნიშვნელოვანი ცვლილებების შემთხვევაში, ინფორმაციას მიიღებთ
              პლატფორმის ან ელ-ფოსტის მეშვეობით.
            </p>
          </section>

          <section className="space-y-8 border-t border-gray-100 pt-12">
            <div className="relative p-8 rounded-[2.5rem] bg-white border border-gray-100 shadow-2xl shadow-gray-200/50 overflow-hidden">
              {/* Background accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50" />

              <div className="relative space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                    <span className="text-white text-[10px] font-black uppercase">
                      ME
                    </span>
                  </div>
                  <h2 className="text-sm font-black uppercase tracking-[0.2em] text-black">
                    პირადი პასუხისმგებლობა
                  </h2>
                </div>

                <p className="text-xl font-bold text-gray-900 leading-snug tracking-tight">
                  "ეს პლატფორმა არის ჩემი შექმნილი და მე პირადად ვარ
                  პასუხისმგებელი თითოეულ დეტალზე. აქ არ მოგიწევთ ელოდოთ ბოტებს
                  ან რენდომ ადამიანებს — ნებისმიერ კითხვაზე პირადად მე გაგცემთ
                  პასუხს.{" "}
                  <span className="text-green-600 underline decoration-green-200 underline-offset-8">
                    თქვენი წარმატება, ავტომატურად ჩემი წარმატებაა.
                  </span>
                  "
                </p>

                <div className="pt-4 flex items-center gap-4">
                  <div className="h-[1px] flex-1 bg-gray-100" />
                  <span className="text-[10px] font-black uppercase text-gray-300 tracking-[0.3em]">
                    Founders Note
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Home Button */}
        <div className="pt-10 gap-4 flex">
          <Link
            href="/"
            className="inline-block px-8 py-4 bg-black text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-800 transition-all"
          >
            მთავარზე დაბრუნება
          </Link>
          <Link
            href="/Terms-of-service"
            className="px-8 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-200 transition-all"
          >
            Terms of Service
          </Link>
        </div>
      </div>
    </div>
  );
}
