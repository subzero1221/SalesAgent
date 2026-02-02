// lib/payments/TBC.js
const TBC_AUTH_URL = "https://api.tbcbank.ge/v1/tpay/access-token";
const TBC_PAY_URL = "https://api.tbcbank.ge/v1/tpay/payments";

export async function getTbcAccessToken() {
  const clientId = process.env.TBC_CLIENT_ID;
  const clientSecret = process.env.TBC_CLIENT_SECRET;
  const apiKey = process.env.TBC_API_KEY;

  // E-Commerce-ს ხშირად სჭირდება პარამეტრები პირდაპირ Body-ში
  const bodyData = `client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`;

  const res = await fetch(TBC_AUTH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      apikey: apiKey,
    },
    body: bodyData,
  });

  const data = await res.json();

  if (!res.ok) {
    // 👇 ეს დაგვეხმარება გავიგოთ რეალური მიზეზი
    console.error("❌ TBC E-Commerce Auth Error:", data);
    throw new Error(data.error_description || data.message || "Auth Failed");
  }

  return data.access_token;
}

export async function createTbcPayment(amount, orderId) {
  const token = await getTbcAccessToken();

  const res = await fetch(TBC_PAY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      apikey: process.env.TBC_API_KEY,
    },
    body: JSON.stringify({
      amount: { currency: "GEL", total: amount },
      returnurl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing/success`,
      callbackurl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/tbc`,
      // E-commerce Universal ხშირად trackingId-ს ნაცვლად 'extra'-ს ითხოვს
      extra: JSON.stringify({ orderId: orderId }),
      methods: [5, 7, 8],
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("❌ TBC Payment Error:", data);
    throw new Error(
      `Payment Failed: ${data.detail || "Check API configuration"}`,
    );
  }

  return data;
}
