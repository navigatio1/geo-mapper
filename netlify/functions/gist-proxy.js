const https = require("https");

exports.handler = async (event) => {
  const token = process.env.GITHUB_PAT;

  if (!token) {
    return { statusCode: 500, body: JSON.stringify({ message: "GITHUB_PAT not configured" }) };
  }

  const method = event.httpMethod;
  const gistId = event.queryStringParameters?.id;
  const path = "/gists" + (gistId ? `/${gistId}` : "");

  // Decode body if base64 encoded by Netlify
  let body = null;
  if (event.body) {
    body = event.isBase64Encoded
      ? Buffer.from(event.body, "base64").toString("utf8")
      : event.body;
  }

  return new Promise((resolve) => {
    const bodyBuffer = body ? Buffer.from(body, "utf8") : null;

    const options = {
      hostname: "api.github.com",
      path: path,
      method: method,
      headers: {
        "Authorization": `token ${token}`,
        "User-Agent": "geo-mapper",
        "Content-Type": "application/json",
        "Accept": "application/vnd.github.v3+json",
        ...(bodyBuffer ? { "Content-Length": bodyBuffer.length } : {})
      }
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => resolve({
        statusCode: res.statusCode,
        headers: { "Content-Type": "application/json" },
        body: data
      }));
    });

    req.on("error", (e) => resolve({
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: e.message })
    }));

    if (bodyBuffer) req.write(bodyBuffer);
    req.end();
  });
};
