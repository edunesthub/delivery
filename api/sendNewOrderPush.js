export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, restaurantName } = req.body;
  if (!email) return res.status(400).json({ error: "Missing email" });

  const message = `New delivery from ${restaurantName || "Unknown Restaurant"}`;

  const response = await fetch("https://onesignal.com/api/v1/notifications", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Basic os_v2_app_omcpehlwtjcjto7t7lvrkphkfarkwx76a7belynntbe6w42hmfr24dqi46d6yu3rrrkbgexs6qoabvlamkqaxupo4aijsdofwg3aq5y"
    },
    body: JSON.stringify({
      app_id: "7304f21d-769a-4499-bbf3-faeb153cea28",
      headings: { "en": "New Delivery Assigned!" },
      contents: { "en": message },
      include_external_user_ids: [email]
    })
  });

  const data = await response.json();
  res.status(200).json(data);
}