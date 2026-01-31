import FacebookLoginButton from "@/app/components/FacebookLoginButton";

export default function FacebookLoginPage({userId}) {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-4xl font-extrabold text-gray-900 tracking-tight">
          Sales<span className="text-blue-600">Agent</span>
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          გაამარტივე მომხმარებელთან კომუნიკაცია ხელოვნური ინტელექტით
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-6 shadow-xl shadow-blue-100/50 sm:rounded-2xl sm:px-12 border border-gray-100">
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 italic">
                მოგესალმებით
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                დააკავშირეთ თქვენი Meta გვერდები ავტომატიზაციის დასაწყებად
              </p>
            </div>

            <div className="pt-4">
              <FacebookLoginButton userId={userId} />
            </div>

            <div className="relative mt-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-400">
                  უსაფრთხო კავშირი Meta API-სთან
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center text-[10px] text-gray-400 pt-2 uppercase tracking-widest font-bold">
              <div className="flex flex-col items-center gap-1">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                  ✓
                </div>
                <span>Messenger</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center text-pink-600">
                  ✓
                </div>
                <span>Instagram</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                  ✓
                </div>
                <span>AI სინქრონი</span>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-gray-500">
          ავტომატური პასუხები თქვენი ბიზნესისთვის 24/7
        </p>
      </div>
    </div>
  );
}
