"use client";

export default function FacebookLoginButton({userId}) {
    
  const handleLogin = () => {
   
    const appId = process.env.NEXT_PUBLIC_FACEBOOK_BUSSINESAPP_ID;
    const configId = process.env.NEXT_PUBLIC_CONFIGURATION_ID;
    const redirectUri = encodeURIComponent(
      "https://posthippocampal-lucently-sang.ngrok-free.dev/api/auth/facebook",
    );

    const state=userId
    const authUrl =
      `https://www.facebook.com/v21.0/dialog/oauth?` +
      `client_id=${appId}` +
      `&config_id=${configId}` +
      `&redirect_uri=${redirectUri}` +
      `&state=${state}` +
      `&response_type=code` +
      `&override_default_response_type=true` +
      `&scope=pages_messaging,instagram_manage_messages,pages_show_list,business_management`;

    window.location.href = authUrl;
  };

  return (
    <button
      onClick={handleLogin}
      className="group relative cursor-pointer w-full flex justify-center py-4 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-[#1877F2] hover:bg-[#166fe5] focus:outline-none transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg active:scale-95"
    >
      <span className="absolute left-0 inset-y-0 flex items-center pl-4">
        <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      </span>
      Facebook-ით შესვლა
    </button>
  );
}
