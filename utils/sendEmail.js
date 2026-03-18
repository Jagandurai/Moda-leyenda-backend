const sendEmail = async ({ to, subject, text, html, orderData }) => {
  try {
    // ✅ Build Professional HTML if orderData exists
    if (orderData) {
      const {
        _id,
        createdAt,
        user,
        address,
        items,
        amount,
      } = orderData;

      const formattedDate = new Date(createdAt).toLocaleString();

      const itemsRows = items
        .map(
          (item) => `
          <tr>
            <td style="padding:8px;border:1px solid #ddd;">${item.name}</td>
            <td style="padding:8px;border:1px solid #ddd;">${item.productCode}</td>
            <td style="padding:8px;border:1px solid #ddd;text-align:center;">${item.quantity}</td>
          </tr>
        `
        )
        .join("");

      subject = "🛒 New Order Received - Moda Leyenda";

      html = `
      <div style="font-family:Arial, sans-serif; background:#f6f6f6; padding:20px;">
        <div style="max-width:700px;margin:auto;background:#fff;padding:20px;border-radius:10px;">
          
          <h2 style="text-align:center;color:#333;">🛍️ Moda Leyenda</h2>
          <p style="text-align:center;color:#777;">New Order Notification</p>

          <hr />

          <h3>📦 Order Details</h3>
          <p><strong>Order ID:</strong> ${_id}</p>
          <p><strong>Date:</strong> ${formattedDate}</p>

          <h3>👤 Customer Info</h3>
          <p><strong>Name:</strong> ${user.name}</p>

          <h3>📍 Shipping Address</h3>
          <p>
            ${address.name}<br/>
            ${address.street}<br/>
            ${address.city}, ${address.state} - ${address.pincode}<br/>
            📞 ${address.phone}
          </p>

          <h3>🛒 Items</h3>
          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr style="background:#f0f0f0;">
                <th style="padding:10px;border:1px solid #ddd;">Product</th>
                <th style="padding:10px;border:1px solid #ddd;">Code</th>
                <th style="padding:10px;border:1px solid #ddd;">Qty</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRows}
            </tbody>
          </table>

          <h2 style="text-align:right;margin-top:20px;">
            Total: ₹${amount}
          </h2>

          <hr />

          <p style="text-align:center;color:#888;font-size:12px;">
            This is an automated email from Moda Leyenda
          </p>
        </div>
      </div>
      `;
    }

    // ✅ Send via Brevo API
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: {
          name: "Moda Leyenda",
          email: process.env.MAIL_FROM,
        },
        to: [{ email: to }],
        subject: subject,
        htmlContent: html || `<pre>${text}</pre>`,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(JSON.stringify(data));
    }

    console.log("✅ Professional email sent");
    return data;

  } catch (error) {
    console.error("🔥 Email Error:", error.message);
    throw error;
  }
};

export default sendEmail;