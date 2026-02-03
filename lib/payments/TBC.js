// lib/payments/TBC.js
const TBC_AUTH_URL = "https://api.tbcbank.ge/v1/tpay/access-token";
const TBC_PAY_URL = "https://api.tbcbank.ge/v1/tpay/payments";

export async function getTbcAccessToken() {
  const apiKey = (process.env.TBC_API_KEY || "").trim();
  const clientId = (process.env.TBC_CLIENT_ID || "").trim();
  const clientSecret = (process.env.TBC_CLIENT_SECRET || "").trim();

  const res = await fetch(TBC_AUTH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
      apikey: apiKey,
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
    }).toString(),
  });

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }

  console.log("🔑 TBC Auth Response:", data);

  if (!res.ok) throw new Error(`Auth failed ${res.status}: ${text}`);
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
