const https = require("https");

exports.handler = async (event) => {
  const token = process.env.GITHUB_PAT;
  const method = event.httpMethod;
  const body = event.body;

  return new Promise((resolve) => {
    const options = {
      hostname: "api.github.com",
      path: "/gists" + (event.queryStringParameters?.id ? `/${event.queryStringParameters.id}` : ""),
      method: method,
      headers: {
        "Authorization": `token ${token}`,
        "User-Agent": "geo-mapper",
        "Content-Type": "application/json"
      }
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => resolve({ statusCode: res.statusCode, body: data }));
    });

    req.on("error", (e) => resolve({ statusCode: 500, body: e.message }));
    if (body) req.write(body);
    req.end();
  });
};
