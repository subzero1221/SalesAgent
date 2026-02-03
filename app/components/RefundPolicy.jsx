import React from "react";

export default function RefundPolicy(){
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 text-gray-800">
      <h1 className="text-3xl font-bold mb-8 text-center">
        თანხის დაბრუნების პოლიტიკა (Refund Policy)
      </h1>

      <div className="space-y-6 text-lg leading-relaxed">
        <p className="font-medium">
          ჩემი მიზანია მომხმარებლისთვის ხარისხიანი სერვისის მიწოდება. გთხოვთ,
          ყურადღებით გაეცნოთ ჩემს პირობებს თანხის დაბრუნებასთან დაკავშირებით:
        </p>

        <section className="bg-gray-50 p-6 rounded-lg border-l-4 border-blue-500">
          <h2 className="text-xl font-semibold mb-3">● სერვისის აქტივაცია</h2>
          <p>
            ვინაიდან ჩემი პროდუქტი წარმოადგენს ციფრულ სერვისს, მომხმარებლის მიერ
            სერვისის გამოყენების დაწყების (აქტივაციის) შემდეგ, გადახდილი თანხა
            დაბრუნებას არ ექვემდებარება.
          </p>
        </section>

        <section className="bg-gray-50 p-6 rounded-lg border-l-4 border-blue-500">
          <h2 className="text-xl font-semibold mb-3">● ტექნიკური ხარვეზი</h2>
          <p>
            თანხის დაბრუნებას ვახორციელებ მხოლოდ იმ შემთხვევაში, თუ
            მომხმარებელმა გადაიხადა სერვისის საფასური, თუმცა ჩემი სერვერის
            მხარეს არსებული ტექნიკური ხარვეზის გამო, ვერ შეძლო პროდუქტზე წვდომის
            მიღება.
          </p>
        </section>

        <section className="bg-gray-50 p-6 rounded-lg border-l-4 border-blue-500">
          <h2 className="text-xl font-semibold mb-3">● პროცედურა</h2>
          <p>
            ტექნიკური ხარვეზის აღმოჩენის შემთხვევაში, მომხმარებელმა პირადად უნდა
            მომმართოს ელ-ფოსტაზე:
            <span className="font-bold text-blue-600 ml-1 underline">
              bkelekhsaevi@gmail.com
            </span>{" "}
            გადახდიდან 24 საათის განმავლობაში. მე შევისწავლი ხარვეზს და
            დადასტურების შემთხვევაში, თანხა დაგიბრუნდებათ 5-10 სამუშაო დღის
            ვადაში.
          </p>
        </section>

        <section className="bg-gray-50 p-6 rounded-lg border-l-4 border-blue-500">
          <h2 className="text-xl font-semibold mb-3">● ორმაგი ტრანზაქცია</h2>
          <p>
            სისტემური შეცდომის გამო თანხის ორჯერ ჩამოჭრის შემთხვევაში, ზედმეტად
            გადახდილ რაოდენობას სრულად დავუბრუნებ მომხმარებელს.
          </p>
        </section>
      </div>

      <footer className="mt-12 pt-6 border-t text-sm text-gray-500 text-center">
        ბოლო განახლება: {new Date().toLocaleDateString("ka-GE")}
      </footer>
    </div>
  );
};


