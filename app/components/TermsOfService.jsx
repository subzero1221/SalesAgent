import Link from "next/link";

export default function TermsPage() {
  const lastUpdated = "თებერვალი, 2026";

  return (
    <div className="bg-[#fafafa] min-h-screen text-black selection:bg-black selection:text-white p-8 md:p-24">
      <div className="max-w-3xl mx-auto space-y-12">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-5xl font-black tracking-tighter uppercase">
            Terms of Service
          </h1>
          <p className="text-sm text-gray-400 font-bold uppercase tracking-[0.2em]">
            ბოლო განახლება: {lastUpdated}
          </p>
        </div>

        <div className="prose prose-neutral max-w-none space-y-10">
          {/* Section 1: Introduction */}
          <section className="space-y-4">
            <h2 className="text-xl font-black uppercase tracking-tight">
              1. შეთანხმება
            </h2>
            <p className="text-gray-600 leading-relaxed font-medium">
              ამ პლატფორმის გამოყენებით, თქვენ ენდობით ჩემს ნამუშევარს. მე კი
              პირობას გაძლევთ, რომ მაქსიმალურად ვიზრუნებ თქვენი ბიზნესის
              გამართულ მუშაობაზე. ეს არის შეთანხმება ჩემსა (შემქმნელსა) და
              თქვენს (მომხმარებელს) შორის.
            </p>
          </section>

          {/* Section 2: Responsibility - The "Human" Way */}
          <section className="space-y-6">
            <h2 className="text-xl font-black uppercase tracking-tight">
              2. პასუხისმგებლობა და უსაფრთხოება
            </h2>
            <div className="bg-white border border-gray-100 p-8 rounded-[2rem] shadow-sm space-y-4">
              <p className="text-gray-700 leading-relaxed font-bold">
                მე ვიყენებ მსოფლიოში აღიარებულ ტექნოლოგიებს (Next.js, Supabase,
                Vercel), რომ თქვენი მონაცემები იყოს მაქსიმალურად დაცული. თუმცა,
                ციფრულ სამყაროში 100%-იანი გარანტია არ არსებობს.
              </p>
              <p className="text-gray-600 leading-relaxed font-medium italic">
                თუ მოხდა გაუთვალისწინებელი ტექნიკური ხარვეზი ან გარე შემოტევა,
                მე პირობას ვდებ, რომ არ მიგატოვებთ და ყველაფერს გავაკეთებ
                პრობლემის უმოკლეს დროში გამოსასწორებლად. თუმცა, მე ვერ ვიქნები
                პასუხისმგებელი იმ ზარალზე, რომელიც შეიძლება გამოიწვიოს ჩემგან
                დამოუკიდებელმა ტექნიკურმა ფორსმაჟორმა.
              </p>
            </div>
          </section>

          {/* Section 3: Usage Rules */}
          <section className="space-y-4">
            <h2 className="text-xl font-black uppercase tracking-tight">
              3. გამოყენების წესები
            </h2>
            <p className="text-gray-600 leading-relaxed font-medium">
              თქვენ იღებთ პასუხისმგებლობას თქვენს ანგარიშზე და პაროლის
              უსაფრთხოებაზე. გთხოვთ, არ გამოიყენოთ პლატფორმა არალეგალური
              მიზნებისთვის — მე შევქმენი ეს ხელსაწყო, რომ დაგეხმაროთ ბიზნესის
              ზრდაში და მინდა, რომ ეს სივრცე დარჩეს სასარგებლო ყველასთვის.
            </p>
          </section>

          {/* Section 4: Payments & Refunds */}
          <section className="space-y-4">
            <h2 className="text-xl font-black uppercase tracking-tight">
              4. გადახდები
            </h2>
            <p className="text-gray-600 leading-relaxed font-medium">
              სერვისის საფასური და პირობები წინასწარ არის ცნობილი. თუ რაიმე
              მიზეზით უკმაყოფილო დარჩებით, პირადად მომწერეთ და ჩვენ ერთად
              ვიპოვით გამოსავალს.
            </p>
          </section>

          {/* Personal Guarantee / Signature */}
          <div className="pt-10 border-t border-gray-100 flex flex-col gap-3">
            <span className="text-[10px] font-black uppercase text-gray-400 tracking-[0.3em] italic">
              პატივისცემით,
            </span>
            <div className="flex flex-col">
              <span className="text-2xl font-black text-black tracking-tighter uppercase leading-none">
                ბესო ქელეხსაევი
              </span>
              <span className="text-[9px] font-bold text-blue-500 uppercase tracking-widest mt-1">
                დამფუძნებელი და დეველოპერი, SalesAgent.ge
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-10 flex gap-4">
          <Link
            href="/"
            className="px-8 py-4 bg-black text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-800 transition-all"
          >
            მთავარი გვერდი
          </Link>
          <Link
            href="/privacy"
            className="px-8 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-200 transition-all"
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
