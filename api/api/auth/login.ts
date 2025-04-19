<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <meta http-equiv="Content-Style-Type" content="text/css">
  <title></title>
  <meta name="Generator" content="Cocoa HTML Writer">
  <meta name="CocoaVersion" content="2487.2">
  <style type="text/css">
    p.p1 {margin: 0.0px 0.0px 0.0px 0.0px; font: 12.0px Helvetica}
    p.p2 {margin: 0.0px 0.0px 0.0px 0.0px; font: 12.0px Helvetica; min-height: 14.0px}
  </style>
</head>
<body>
<p class="p1">import { NextApiRequest, NextApiResponse } from "next";</p>
<p class="p2"><br></p>
<p class="p1">export default function handler(req: NextApiRequest, res: NextApiResponse) {</p>
<p class="p1"><span class="Apple-converted-space">  </span>if (req.method !== "POST") {</p>
<p class="p1"><span class="Apple-converted-space">    </span>return res.status(405).json({ message: "Method Not Allowed" });</p>
<p class="p1"><span class="Apple-converted-space">  </span>}</p>
<p class="p2"><br></p>
<p class="p1"><span class="Apple-converted-space">  </span>const { username, password } = req.body;</p>
<p class="p2"><br></p>
<p class="p1"><span class="Apple-converted-space">  </span>const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";</p>
<p class="p1"><span class="Apple-converted-space">  </span>const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "DomainGuide#2025";</p>
<p class="p2"><br></p>
<p class="p1"><span class="Apple-converted-space">  </span>if (username === ADMIN_USERNAME &amp;&amp; password === ADMIN_PASSWORD) {</p>
<p class="p1"><span class="Apple-converted-space">    </span>return res.status(200).json({ username, isAdmin: true });</p>
<p class="p1"><span class="Apple-converted-space">  </span>}</p>
<p class="p2"><br></p>
<p class="p1"><span class="Apple-converted-space">  </span>return res.status(401).json({ message: "Invalid username or password" });</p>
<p class="p1">}</p>
</body>
</html>
